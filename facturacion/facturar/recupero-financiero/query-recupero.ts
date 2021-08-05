import * as sql from 'mssql';
import { IDtoRecupero } from '../../interfaces/IDtoRecupero';
import { fakeRequestSql } from './../../config.private';
import { log } from '@andes/log';
import * as moment from 'moment';

export class QueryRecupero {

    async getIdPacienteSips(pool: any, dni: any) {
        return new Promise((resolve: any, reject: any) => {
            (async () => {
                try {
                    let query = 'SELECT TOP 1 idPaciente FROM dbo.Sys_Paciente where activo = 1 and numeroDocumento = @dni order by objectId DESC;';
                    let resultado = await new sql.Request(pool)
                        .input('dni', sql.VarChar(50), dni)
                        .query(query);
                    if (resultado && resultado.recordset[0]) {
                        resolve(resultado.recordset[0] ? resultado.recordset[0].idPaciente : null);
                    } else {
                        resolve('No se encuentra Paciente en SIPS: ');
                    }
                } catch (err) {
                    reject(err);
                }
            })();
        });
    }

    async getIdProfesionalSips(pool: any, dni: any) {
        return new Promise((resolve: any, reject: any) => {
            (async () => {
                try {
                    let query = 'SELECT idProfesional FROM dbo.Sys_Profesional WHERE activo = 1 and numeroDocumento = @dni';
                    let resultado = await new sql.Request(pool)
                        .input('dni', sql.VarChar(50), dni)
                        .query(query);
                    if (resultado && resultado.recordset[0]) {
                        resolve(resultado.recordset[0] ? resultado.recordset[0].idProfesional : null);
                    } else {
                        resolve('No se encuentra Profesional en SIPS: ');
                    }

                } catch (err) {
                    reject(err);
                }
            })();
        });
    }


    async getNomencladorRecupero(pool: any, nomencladorRF: any) {
        return new Promise((resolve: any, reject: any) => {
            (async () => {
                try {
                    let query = 'SELECT idNomenclador, idTipoPractica, valorUnidad, descripcion FROM dbo.FAC_Nomenclador WHERE codigo = @codigo and idTipoNomenclador = @idTipoNomenclador';
                    let resultado = await new sql.Request(pool)
                        .input('codigo', sql.VarChar(50), nomencladorRF.codigo)
                        .input('idTipoNomenclador', sql.Int, nomencladorRF.idTipoNomenclador)
                        .query(query);

                    if (resultado && resultado.recordset[0]) {
                        resolve(resultado.recordset[0] ? resultado.recordset[0] : null);
                    } else {
                        resolve('No se encuentra Nomenclador en Recupero: ');
                    }
                } catch (err) {
                    reject(err);
                }
            })();
        });
    }

    async getIdObraSocialSips(pool: any, dtoRecupero: any) {
        return new Promise((resolve: any, reject: any) => {
            (async () => {
                try {
                    let prepaga = dtoRecupero.prepaga;
                    let codFinanciador = dtoRecupero.codigoFinanciador;
                    let query = (!prepaga) ? 'SELECT idObraSocial FROM dbo.Sys_ObraSocial WHERE cod_PUCO = @codigo;' : 'SELECT idObraSocial FROM dbo.Sys_ObraSocial WHERE idObraSocial = @codigo;';
                    let result = await new sql.Request(pool)
                        .input('codigo', sql.Int, codFinanciador)
                        .query(query);
                    if (result && result.recordset[0]) {
                        resolve(result.recordset[0] ? result.recordset[0].idObraSocial : 0);
                    } else {
                        resolve('No se encuentra Obra Social en SIPS:');
                    }
                } catch (err) {
                    reject(err);
                }
            })();
        });
    }

    async getOrdenDePrestacion(pool: any, dtoRecupero: IDtoRecupero) {
        return new Promise((resolve: any, reject: any) => {
            (async () => {
                try {
                    let query = 'SELECT TOP 1 * FROM dbo.FAC_Orden WHERE objectId = @objectId';
                    let result = await new sql.Request(pool)
                        .input('objectId', sql.VarChar(100), dtoRecupero.objectId)
                        .query(query);
                    if (result && result.recordset[0]) {
                        resolve(1);
                    } else {
                        resolve(0);
                    }
                } catch (err) {
                    reject(err);
                }
            })();
        });

    }

    /**
     *
     *
     * @param {*} transaction
     * @param {*} dtoOrden
     * @returns
     * @memberof QueryRecupero
     */
    async saveOrdenRecupero(request: any, dtoOrden: any) {
        try {
            let query = 'INSERT INTO [dbo].[FAC_Orden]' +
                ' ([idEfector]' +
                ' ,[numero]' +
                ' ,[periodo]' +
                ' ,[idServicio]' +
                ' ,[idPaciente]' +
                ' ,[idProfesional]' +
                ' ,[fecha]' +
                ' ,[fechaPractica]' +
                ' ,[idTipoPractica]' +
                ' ,[observaciones]' +
                ' ,[idObraSocial]' +
                ' ,[idUsuarioRegistro]' +
                ' ,[fechaRegistro]' +
                ' ,[idPrefactura]' +
                ' ,[idFactura]' +
                ' ,[baja]' +
                ' ,[monto]' +
                ' ,[fechaSiniestro]' +
                ' ,[objectId] ' +
                ' ,[factAutomatico])' +
                ' VALUES' +
                ' (@idEfector' +
                ' ,@numero' +
                ' ,@periodo' +
                ' ,@idServicio' +
                ' ,@idPaciente' +
                ' ,@idProfesional' +
                ' ,@fecha' +
                ' ,@fechaPractica' +
                ' ,@idTipoPractica' +
                ' ,@observaciones ' +
                ' ,@idObraSocial' +
                ' ,@idUsuarioRegistro' +
                ' ,@fechaRegistro' +
                ' ,@idPrefactura' +
                ' ,@idFactura' +
                ' ,@baja' +
                ' ,@monto' +
                ' ,@fechaSiniestro' +
                ' ,@objectId ' +
                ' ,@factAutomatico) ' +
                'DECLARE @numeroOrden Int =  SCOPE_IDENTITY() ' +
                'SELECT @numeroOrden as ID';

            const result = await request
                .input('idEfector', sql.Int, dtoOrden.idEfector)
                .input('numero', sql.Int, dtoOrden.numero)
                .input('periodo', sql.Char(10), dtoOrden.periodo)
                .input('idServicio', sql.Int, dtoOrden.idServicio)
                .input('idPaciente', sql.Int, dtoOrden.idPaciente)
                .input('idProfesional', sql.Int, dtoOrden.idProfesional)
                .input('fecha', sql.DateTime, new Date(dtoOrden.fecha))
                .input('fechaPractica', sql.DateTime, new Date(dtoOrden.fechaPractica))
                .input('idTipoPractica', sql.Int, dtoOrden.idTipoPractica)
                .input('observaciones', sql.VarChar(500), dtoOrden.motivoConsulta)
                .input('idObraSocial', sql.Int, dtoOrden.idObraSocial)
                .input('idUsuarioRegistro', sql.Int, dtoOrden.idUsuarioRegistro)
                .input('fechaRegistro', sql.DateTime, new Date(dtoOrden.fechaRegistro))
                .input('idPrefactura', sql.Int, dtoOrden.idPrefactura)
                .input('idFactura', sql.Int, dtoOrden.idFactura)
                .input('baja', sql.Bit, dtoOrden.baja)
                .input('monto', sql.Decimal(18, 2), dtoOrden.monto)
                .input('fechaSiniestro', sql.DateTime, new Date('1900-01-01')) /* Modificar cuando se empiecen a cargar siniestros */
                .input('objectId', sql.VarChar(50), dtoOrden.objectId)
                .input('factAutomatico', sql.VarChar(50), dtoOrden.factAutomatica)
                .query(query);
            return result.recordset[0] ? result.recordset[0].ID : null;
        } catch (error) {
            log(fakeRequestSql, 'microservices:factura:create', null, '/error en saveOrdenRecupero', null, error);
        }
    }

    /**
     *
     *
     * @param {*} transaction
     * @param {*} ordenDetalle
     * @returns
     * @memberof QueryRecupero
     */
    async saveOrdenDetalle(request: any, ordenDetalle: any) {
        try {
            let query = 'INSERT INTO [dbo].[FAC_OrdenDetalle]' +
                ' ([idOrden]' +
                ' ,[idEfector]' +
                ' ,[idNomenclador]' +
                ' ,[descripcion]' +
                ' ,[cantidad]' +
                ' ,[valorUnidad]' +
                ' ,[ajuste])' +
                ' VALUES' +
                ' (@idOrden' +
                ' ,@idEfector' +
                ' ,@idNomenclador' +
                ' ,@descripcion' +
                ' ,@cantidad' +
                ' ,@valorUnidad' +
                ' ,@ajuste) ' +
                'SELECT SCOPE_IDENTITY() as ID';

            const result = await request
                .input('idOrden', sql.Int, ordenDetalle.idOrden)
                .input('idEfector', sql.Int, ordenDetalle.idEfector)
                .input('idNomenclador', sql.Int, ordenDetalle.idNomenclador)
                .input('descripcion', sql.VarChar(500), ordenDetalle.descripcion)
                .input('cantidad', sql.Int, ordenDetalle.cantidad)
                .input('valorUnidad', sql.Decimal(18, 2), ordenDetalle.valorUnidad)
                .input('ajuste', sql.Decimal(18, 2), ordenDetalle.ajuste)
                .query(query);

            return result.recordset[0];
        } catch (error) {
            log(fakeRequestSql, 'microservices:factura:create', null, '/error en saveOrdenDetalleRecupero', null, error);
        }
    }
}


/***
 * Obtenemos de SIPS el idTipoNomenclador
 * por medio del store procedure FAC_GetTipoNomenclador 
 */
export async function getIdTipoNomencladorSIPS(idObraSocial: any, fechaTurno: Date, pool: any) {
    try {
        const fecha = moment(fechaTurno).format('DD-MM-YY');
        const query = 'exec dbo.FAC_GetTipoNomenclador @idObraSocial, @fecha';

        const resultado = await new sql.Request(pool)
            .input('fecha', sql.VarChar(8), fecha)
            .input('idObraSocial', sql.Int, idObraSocial)
            .query(query);

        return resultado.recordset[0].idTipoNomenclador;

    } catch (err) {
        return err;
    }
}
