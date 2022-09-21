import * as sql from 'mssql';
import { QuerySumar } from './query-sumar';
import { IDtoFacturacion } from './../../interfaces/IDtoFacturacion';
import { IDtoSumar } from './../../interfaces/IDtoSumar';
import moment = require('moment');
import 'moment/locale/es';
import { updateEstadoFacturacionSinTurno, updateEstadoFacturacionConTurno, getDatosTurno } from '../../services/prestaciones.service';

import { userScheduler } from './../../config.private';
import { msFacturacionLog } from './../../logger/msFacturacion';
const log = msFacturacionLog.startTrace();

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
    let dtoComprobante, prestacion, datosReportables, estadoFacturacion;
    try {
        await transaction.begin();
        const request = await new sql.Request(transaction);

        let idComprobante = await querySumar.getComprobante(pool, dtoSumar);
        if (!idComprobante) {
            _estado = 'Comprobante sin prestacion';

            dtoComprobante = {
                cuie: dtoSumar.cuie,
                fechaComprobante: moment(dtoSumar.fechaTurno).format('MM/DD/YYYY'),
                claveBeneficiario: dtoSumar.claveBeneficiario,
                idAfiliado: dtoSumar.idAfiliado,
                fechaCarga: new Date(),
                comentario: 'Carga Automática',
                periodo: moment(dtoSumar.fechaTurno, 'YYYY/MM/DD').format('YYYY') + '/' + moment(dtoSumar.fechaTurno, 'YYYY/MM/DD').format('MM'),
                activo: 'S',
                idTipoPrestacion: 1,
                objectId: dtoSumar.objectId
            };

            idComprobante = await querySumar.saveComprobanteSumar(request, dtoComprobante);
        }

        if (dtoSumar.datosReportables) {
            let existePrestacion = await querySumar.getPrestacionSips(pool, dtoSumar);

            if (!existePrestacion) {
                let precioPrestacion: any = await querySumar.getNomencladorSumar(pool, dtoSumar.idNomenclador);

                moment.locale('es');
                prestacion = {
                    idComprobante,
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

        estadoFacturacion = {
            tipo: 'sumar',
            numeroComprobante: idComprobante,
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
            log.error('facturaSumar:rollback crear comprobante sumar', { dtoComprobante, prestacion, datosReportables, estadoFacturacion }, e, userScheduler);
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
