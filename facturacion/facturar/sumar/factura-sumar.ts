import * as sql from 'mssql';
import { QuerySumar } from './query-sumar';
import { IDtoFacturacion } from './../../interfaces/IDtoFacturacion';
import { IDtoSumar } from './../../interfaces/IDtoSumar';
import moment = require('moment');
import 'moment/locale/es';
import { updateEstadoFacturacionSinTurno, updateEstadoFacturacionConTurno, getDatosTurno } from '../../services/prestaciones.service';

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

        if (!existeComprobante) {
            _estado = 'Comprobante sin prestacion';

            let dtoComprobante = {
                cuie: dtoSumar.cuie,
                fechaComprobante: moment(dtoSumar.fechaTurno).format('MM/DD/YYYY'),
                claveBeneficiario: dtoSumar.claveBeneficiario,
                idAfiliado: dtoSumar.idAfiliado,
                fechaCarga: new Date(),
                comentario: 'Carga Automática',
                periodo: moment(new Date, 'YYYY/MM/DD').format('YYYY') + '/' + moment(new Date, 'YYYY/MM/DD').format('MM'),
                activo: 'S',
                idTipoPrestacion: 1,
                objectId: dtoSumar.objectId
            };

            newIdComprobante = await querySumar.saveComprobanteSumar(request, dtoComprobante);
        }

        if (dtoSumar.datosReportables) {
            let existePrestacion = await validaPrestacion(pool, dtoSumar);

            if (!existePrestacion) {
                let precioPrestacion: any = await querySumar.getNomencladorSumar(pool, dtoSumar.idNomenclador);

                moment.locale('es');
                let prestacion = {
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

                let newIdPrestacion = await querySumar.savePrestacionSumar(request, prestacion);

                for (let x = 0; x < dtoSumar.datosReportables.length; x++) {
                    let datosReportables = {
                        idPrestacion: newIdPrestacion,
                        idDatoReportable: dtoSumar.datosReportables[x].idDatoReportable,
                        valor: dtoSumar.datosReportables[x].datoReportable
                    };

                    await querySumar.saveDatosReportablesSumar(request, datosReportables);
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
        // log error          
        transaction.rollback();
    }
}

export async function saveBeneficiario() {

}

/* Valida quelos datos reportables cargados en RUP sean los mismos que están en la colección configFacturacionAutomatica */
/* Falta Terminar */
export function validaDatosReportables(dtoFacturacion: IDtoFacturacion, datosConfigAutomatica) {
    /* TODO: configurar en configFacturacion si el dato reportable puede venir null o no */

    let drPrestacion = dtoFacturacion.prestacion.datosReportables.map(obj => obj[0]);
    let drConfigAutomatica = datosConfigAutomatica.sumar.datosReportables.map(obj => obj);

    let found = false;
    for (let i = 0; i < drPrestacion.length; i++) {
        if (drConfigAutomatica[i].valores[0].conceptId.indexOf(drPrestacion[i].registro.concepto.conceptId) > -1) {
            found = true;
        } else {
            found = false;
            break;
        }
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

/* Valida si la prestación ya fue creada en la BD de SUMAR */
async function validaPrestacion(pool: any, dtoSumar: IDtoSumar): Promise<boolean> {
    let idPrestacion: any = await querySumar.getPrestacion(pool, dtoSumar);

    if (idPrestacion) {
        return idPrestacion;
    } else {
        return null;
    }
}