import * as sql from 'mssql';
import { QueryRecupero } from './query-recupero';
import { IDtoRecupero } from './../../interfaces/IDtoRecupero';

import { userScheduler } from './../../config.private';
import { msFacturacionLog } from './../../logger/msFacturacion';
const log = msFacturacionLog.startTrace();

let queryRecupero = new QueryRecupero();

/**
 *
 *
 * @export
 * @param {*} pool
 * @param {IDtoRecupero} dtoRecupero
 * @param {*} datosConfiguracionAutomatica
 */
export async function facturaRecupero(pool, dtoRecupero: IDtoRecupero) {
    let existeOrden = await validaOrden(pool, dtoRecupero);

    if (!existeOrden) {
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        const request = await new sql.Request(transaction);
        let dtoOrden, dtoOrdendetalle;
        try {
            let nomencladorRecupero: any = await queryRecupero.getNomencladorRecupero(pool, dtoRecupero);

            dtoOrden = {
                idEfector: dtoRecupero.idEfector,
                /* Existe un trigger en Fac_Orden [Trigger_NumeroOrden] que actualiza 'numero' cuando el param es -1 */
                numero: -1,
                periodo: '0000/00',
                idServicio: dtoRecupero.idServicio,
                idPaciente: dtoRecupero.idPaciente,
                idProfesional: await queryRecupero.getIdProfesionalSips(pool, dtoRecupero.dniProfesional),
                fecha: new Date(),
                fechaPractica: dtoRecupero.fechaTurno,
                idTipoPractica: nomencladorRecupero.idTipoPractica,
                idObraSocial: await queryRecupero.getIdObraSocialSips(pool, dtoRecupero),
                idUsuarioRegistro: 1,
                fechaRegistro: new Date(),
                idPrefactura: 0,
                idFactura: 0,
                baja: 0,
                monto: nomencladorRecupero.valorUnidad,
                motivoConsulta: dtoRecupero.motivoDeConsulta,
                objectId: dtoRecupero.objectId,
                factAutomatica: 'prestacion'
            };

            const newIdOrden = await queryRecupero.saveOrdenRecupero(request, dtoOrden);

            if (newIdOrden) {
                dtoOrdendetalle = {
                    idOrden: newIdOrden,
                    idEfector: dtoRecupero.idEfector,
                    idNomenclador: nomencladorRecupero.idNomenclador,
                    descripcion: nomencladorRecupero.descripcion,
                    cantidad: 1,
                    valorUnidad: nomencladorRecupero.valorUnidad,
                    ajuste: 0,
                    totoal: nomencladorRecupero.valorUnidad
                };

                await queryRecupero.saveOrdenDetalle(request, dtoOrdendetalle);

                transaction.commit(error => {
                    if (error) {
                        return error;
                    }
                });
            }
        } catch (e) {
            transaction.rollback(error => {
                log.error('facturaRecupero:rollback crear orden recupero', { dtoRecupero, dtoOrden, dtoOrdendetalle }, e, userScheduler);

            });
        }
    }
}

/* Valida si la orden de prestación ya fue creada en la BD de Recupero Finanicero */
async function validaOrden(pool: any, dtoRecupero: IDtoRecupero): Promise<boolean> {
    let existe = false;

    let orden = await queryRecupero.getOrdenDePrestacion(pool, dtoRecupero);

    if (orden > 0) {
        existe = true;
    }

    return existe;
}
