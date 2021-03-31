import * as sql from 'mssql';
import { QuerySumar } from './query-sumar';
import { IDtoFacturacion } from './../../interfaces/IDtoFacturacion';
import { IDtoSumar } from './../../interfaces/IDtoSumar';
import moment = require('moment');
import 'moment/locale/es';
import { updateEstadoFacturacionSinTurno, updateEstadoFacturacionConTurno, getDatosTurno } from '../../services/prestaciones.service';
import { fakeRequestSql } from './../../config.private';
import { log } from '@andes/log';
import { getPacienteSP } from './../../services/sip-plus';

let querySumar = new QuerySumar();

/**
 *
 *
 * @export
 * @param {*} pool
 * @param {IDtoSumar} dtoSumar
 * @param {*} datosConfiguracionAutomatica
 */
export async function facturaSumar(pool: any, dtoSumar: IDtoSumar) {
    const transaction = new sql.Transaction(pool);
    let _estado = 'Sin Comprobante';

    try {
        await transaction.begin();
        const request = await new sql.Request(transaction);

        let newIdComprobante: any;
        let existeComprobante = await validaComprobante(pool, dtoSumar);

        // --------- PERINATAL----
        let pacienteSP: any = await getPacienteSP(dtoSumar.dniPaciente);
        // si la prestacion es por control de embarazo
        let facturarPerinatal = ['2473', '2474', '2753', '2760'].includes(dtoSumar.idNomenclador.toString());
        let nomencladorPer = null;
        let perCT005CT006 = false;
        let generarRegistros = true;
        if (facturarPerinatal) {
            const id = dtoSumar.idNomenclador.toString();
            perCT005CT006 = ['2473', '2474'].includes(id);
            nomencladorPer =
                (id === '2473') ? { valor: 'CTC005', codigo: 'P99', diagostico: 'W78' } :
                    (id === '2474') ? { valor: 'CTC006', codigo: 'P99', diagostico: 'W78' } :
                        (id === '2753') ? { valor: 'CTC007', codigo: 'P05', diagnostico: 'X70' } :
                            (id === '2760') ? { valor: ' NTN004', codigo: 'P03', diagnostico: '' } : null;

            nomencladorPer.id = id;

            // En CT005 / CT006 solo se generan registros para comprobantes, prestacion y datoReportables si se cumple:
            if (perCT005CT006) {
                // EG y PA no null y EG no sea 0
                generarRegistros = pacienteSP.semanas_gestacion && pacienteSP.pa_sistolica && pacienteSP.pa_diastolica;
                // fecha prestacion ultimos 4 meses
                generarRegistros = generarRegistros && moment(new Date()).diff(dtoSumar.fechaTurno, 'month') < 4;
                // si es CT005  EG debe estar dentro del intervalo [4, 12.6].
                if (id === '2473' && generarRegistros) {
                    generarRegistros = pacienteSP.semanas_gestacion >= 4 && pacienteSP.semanas_gestacion < 12.6;
                }
            }
        }

        if (!existeComprobante && generarRegistros) {
            _estado = 'Comprobante sin prestacion';

            let dtoComprobante: any = {
                cuie: dtoSumar.cuie,
                fechaComprobante: moment(dtoSumar.fechaTurno).format('MM/DD/YYYY'),
                claveBeneficiario: dtoSumar.claveBeneficiario,
                idAfiliado: dtoSumar.idAfiliado,
                fechaCarga: new Date(),
                comentario: 'Carga Automática',
                periodo: moment(dtoSumar.fechaTurno, 'YYYY/MM/DD').format('YYYY') + '/' + moment(dtoSumar.fechaTurno, 'YYYY/MM/DD').format('MM'),
                activo: 'S',
                alta_comp: null,
                idTipoPrestacion: 1,
                objectId: dtoSumar.objectId,
                nombre_medico: null
            };

            if (facturarPerinatal) {
                dtoComprobante.marca = 0;
                dtoComprobante.nombre_medico = ' -' + dtoSumar.profesional.apellido + ' ' + dtoSumar.profesional.nombre;
                let valorCarga = (perCT005CT006) ? 'CTC005 y CTC006' : nomencladorPer.valor;
                dtoComprobante.comentario = `CARGA AUTOMATICA ${valorCarga} - ` + moment().format('DD/MM/YYYY');
                dtoComprobante.alta_comp = 'NO';

            }

            newIdComprobante = await querySumar.saveComprobanteSumar(request, dtoComprobante);
        }

        if (dtoSumar.datosReportables || (facturarPerinatal && generarRegistros)) {
            let existePrestacion = await validaPrestacion(pool, dtoSumar);

            if (!existePrestacion) {
                let precioPrestacion: any = await querySumar.getNomencladorSumar(pool, dtoSumar.idNomenclador);
                moment.locale('es');
                let prestacion: any = {
                    idComprobante: (newIdComprobante) ? newIdComprobante : existeComprobante,
                    idNomenclador: dtoSumar.idNomenclador,
                    cantidad: 1,
                    precioPrestacion: precioPrestacion.precio,
                    idAnexo: 301,
                    peso: 0,
                    tensionArterial: '00/00',
                    diagnostico: dtoSumar.diagnostico,
                    edad: dtoSumar.edad,
                    sexo: dtoSumar.sexo,
                    fechaNacimiento: dtoSumar.fechaNacimiento,
                    fechaPrestacion: moment(dtoSumar.fechaTurno).format('MM/DD/YYYY'),
                    anio: dtoSumar.anio,
                    mes: dtoSumar.mes,
                    dia: dtoSumar.dia,
                    objectId: dtoSumar.objectId
                };

                // --------- PERINATAL----
                if (facturarPerinatal) {
                    prestacion.diagnostico = nomencladorPer.diagnostico;
                    prestacion.sexo = 'M';
                    const tipo = dtoSumar.idNomenclador.toString() === '2473' ? 'C005' : 'C006';
                    const fechaTurno = moment(dtoSumar.fechaTurno).format('YYYYMMDD');
                    const fechaNac = moment(dtoSumar.fechaNacimiento).format('YYYYMMDD');
                    prestacion.codigo_comp =
                        dtoSumar.cuie + fechaTurno +
                        dtoSumar.claveBeneficiario +
                        fechaNac + prestacion.sexo +
                        dtoSumar.edad + nomencladorPer.valor +
                        nomencladorPer.diagnostico +
                        nomencladorPer.codigo;
                }

                let newIdPrestacion = await querySumar.savePrestacionSumar(request, prestacion);


                if (!facturarPerinatal) {
                    for (let x = 0; x < dtoSumar.datosReportables.length; x++) {
                        let datosReportables = {
                            idPrestacion: newIdPrestacion,
                            idDatoReportable: dtoSumar.datosReportables[x].idDatoReportable,
                            valor: dtoSumar.datosReportables[x].datoReportable
                        };
                        await querySumar.saveDatosReportablesSumar(request, datosReportables);
                    }
                }
                else if (perCT005CT006) {
                    // en perinatal se reportan
                    let prestCtrl = null;
                    // se busca que el control de embarazo que coinciada con la fecha del turno
                    pacienteSP.paciente.pregnacies.forEach(emb => {
                        if (emb.prenatal) {
                            prestCtrl = emb.dato.prenatal.find(ctrlEmb => moment(ctrlEmb["dato"]["fecha-turno"]) === moment(dtoSumar.fechaTurno));
                        }
                    });
                    if (prestCtrl) {
                        // si existen PA y EG entonces se reportan
                        if (pacienteSP.semanas_gestacion && pacienteSP.pa_sistolica && pacienteSP.pa_diastolica) {
                            let datoReportable: any = {
                                idPrestacion: newIdPrestacion
                            }
                            // TA idDatoReportable= 3 
                            datoReportable.idDatoReportable = 3;
                            datoReportable.valor = pacienteSP.pa_sistolica + '/' + pacienteSP.pa_diastolica;
                            await querySumar.saveDatosReportablesSumar(request, datoReportable);

                            // EG edad gestacional idDatoReportable=5
                            datoReportable.idDatoReportable = 5;
                            datoReportable.valor = pacienteSP.semanas_gestacion;
                            await querySumar.saveDatosReportablesSumar(request, datoReportable);

                            // peso no es obligatorio pero si existe, se reporta
                            if (pacienteSP.peso) {
                                // peso idDatoReportable=1
                                datoReportable.idDatoReportable = 1;
                                datoReportable.valor = pacienteSP.peso;
                                await querySumar.saveDatosReportablesSumar(request, datoReportable);
                            }
                        }

                    }
                }
                _estado = 'Comprobante con prestacion';
            }
        }

        await transaction.commit();

        let turno: any;
        if (dtoSumar.objectId) {
            turno = await getDatosTurno(dtoSumar.objectId);
        }

        const estadoFacturacion = {
            tipo: 'sumar',
            numeroComprobante: (newIdComprobante) ? newIdComprobante : existeComprobante,
            estado: _estado
        };

        if (!turno) {
            updateEstadoFacturacionSinTurno(dtoSumar.idPrestacion, estadoFacturacion);
        } else {
            let idTurno = dtoSumar.objectId;
            let idAgenda = turno.idAgenda;
            let idBloque = turno.idBloque;

            updateEstadoFacturacionConTurno(idAgenda, idBloque, idTurno, estadoFacturacion);
        }

    } catch (e) {
        transaction.rollback(error => {
            log(fakeRequestSql, 'microservices:factura:create', null, '/rollback crear comprobante sumar', null, error);
        });
    }
}

/* Valida que los datos reportables cargados en RUP sean los mismos que están en la colección configFacturacionAutomatica */
export function validaDatosReportables(dtoFacturacion: IDtoFacturacion) {
    if (dtoFacturacion.prestacion.datosReportables) {
        let drPrestacion: any = dtoFacturacion.prestacion.datosReportables.filter((obj: any) => obj !== null).map(obj => obj);
        let drConfigAutomatica: any = dtoFacturacion.configAutomatica.sumar.datosReportables.map(obj => obj);
        let valida = true;

        for (let x = 0; x < drConfigAutomatica.length; x++) {
            for (let z = 0; z < drPrestacion.length; z++) {
                if (drConfigAutomatica[x].valores[0].conceptId === drPrestacion[z].conceptId) {
                    if (!drPrestacion[z].valor) {
                        valida = false;
                    }
                }
            }
        }
        return valida;
    } else {
        return false;
    }
}

/* Valida si el comprobante ya fue creado en la BD de SUMAR */
async function validaComprobante(pool: any, dtoSumar: IDtoSumar): Promise<boolean> {
    let idComprobante: any = await querySumar.getComprobante(pool, dtoSumar);

    if (idComprobante) {
        return idComprobante;
    } else {
        return null;
    }
}

/* Valida si la prestación ya fue creada en la BD de SUMAR desde ANDES */
async function validaPrestacion(pool: any, dtoSumar: IDtoSumar): Promise<boolean> {
    let idPrestacion: any = await querySumar.getPrestacionSips(pool, dtoSumar);

    if (idPrestacion) {
        return idPrestacion;
    } else {
        return null;
    }
}
