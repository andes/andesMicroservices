import * as sql from 'mssql';
import { runInNewContext } from 'vm';

export class QueryRecupero {

    async getIdPacienteSips(pool: any, dni: any) {
        return new Promise((resolve: any, reject: any) => {
            (async function () {
                try {
                    let query = 'SELECT TOP 1 idPaciente FROM dbo.Sys_Paciente where activo = 1 and numeroDocumento = @dni order by objectId DESC;';
                    let resultado = await new sql.Request(pool)
                        .input('dni', sql.VarChar(50), dni)
                        .query(query)

                    resolve(resultado.recordset[0] ? resultado.recordset[0].idPaciente : null);

                } catch (err) {
                    reject(err);
                }
            })();
        });
    }

    async getIdProfesionalSips(pool: any, dni: any) {
        return new Promise((resolve: any, reject: any) => {
            (async function () {
                try {
                    let query = 'SELECT idProfesional FROM dbo.Sys_Profesional WHERE activo = 1 and numeroDocumento = @dni';
                    let resultado = await new sql.Request(pool)
                        .input('dni', sql.VarChar(50), dni)
                        .query(query)

                    resolve(resultado.recordset[0] ? resultado.recordset[0].idProfesional : null);

                } catch (err) {
                    reject(err);
                }
            })();
        });
    }


    async getNomencladorRecupero(pool: any, idNomenclador: any) {
        return new Promise((resolve: any, reject: any) => {
            (async function () {
                try {
                    let query = 'SELECT idTipoPractica, valorUnidad, descripcion FROM dbo.FAC_Nomenclador WHERE idNomenclador = @idNomenclador';
                    let resultado = await new sql.Request(pool)
                        .input('idNomenclador', sql.VarChar(50), idNomenclador)
                        .query(query)

                    resolve(resultado.recordset[0] ? resultado.recordset[0] : null);

                } catch (err) {
                    reject(err);
                }
            })();
        });
    }

    async getIdObraSocialSips(pool: any, codigoObraSocial: any) {
        let query = 'SELECT idObraSocial FROM dbo.Sys_ObraSocial WHERE cod_PUCO = @codigo;';
        let result = await new sql.Request(pool)
            .input('codigo', sql.Int, codigoObraSocial)
            .query(query);
        return result.recordset[0] ? result.recordset[0].idObraSocial : 0;
    }

    async saveOrdenRecupero(pool: any, dtoOrden: any) {
        console.log("Dto Orden: ", dtoOrden);
        return new Promise(async (resolve, reject) => {
            (async function () {
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
                        ' ,[idObraSocial]' +
                        ' ,[idUsuarioRegistro]' +
                        ' ,[fechaRegistro]' +
                        ' ,[idPrefactura]' +
                        ' ,[idFactura]' +
                        ' ,[baja]' +
                        ' ,[monto]' +
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
                        ' ,@idObraSocial' +
                        ' ,@idUsuarioRegistro' +
                        ' ,@fechaRegistro' +
                        ' ,@idPrefactura' +
                        ' ,@idFactura' +
                        ' ,@baja' +
                        ' ,@monto' +
                        ' ,@objectId ' +
                        ' ,@factAutomatico) ' +
                        'DECLARE @numeroOrden Int =  SCOPE_IDENTITY() ' +
                        'SELECT @numeroOrden as ID';

                    let transaction = new sql.Transaction(pool);

                    transaction.begin().then(async function () {
                        await new sql.Request(transaction)
                            .input('idEfector', sql.Int, dtoOrden.idEfector)
                            .input('numero', sql.Int, dtoOrden.numero)
                            .input('periodo', sql.Char(10), dtoOrden.periodo)
                            .input('idServicio', sql.Int, dtoOrden.idServicio)
                            .input('idPaciente', sql.Int, dtoOrden.idPaciente)
                            .input('idProfesional', sql.Int, dtoOrden.idProfesional)
                            .input('fecha', sql.DateTime, new Date(dtoOrden.fecha))
                            .input('fechaPractica', sql.DateTime, new Date(dtoOrden.fechaPractica))
                            .input('idTipoPractica', sql.Int, dtoOrden.idTipoPractica)
                            .input('idObraSocial', sql.Int, dtoOrden.idObraSocial)
                            .input('idUsuarioRegistro', sql.Int, dtoOrden.idUsuarioRegistro)
                            .input('fechaRegistro', sql.DateTime, new Date(dtoOrden.fechaRegistro))
                            .input('idPrefactura', sql.Int, dtoOrden.idPrefactura)
                            .input('idFactura', sql.Int, dtoOrden.idFactura)
                            .input('baja', sql.Bit, dtoOrden.baja)
                            .input('monto', sql.Decimal(18, 2), dtoOrden.monto)
                            .input('objectId', sql.VarChar(50), dtoOrden.objectId)
                            .input('factAutomatico', sql.VarChar(50), dtoOrden.factAutomatica)
                            .query(query, (err: any, result: any) => {
                                transaction.commit((err: any) => {
                                    if (err) {
                                        reject(err);
                                    }

                                    resolve(result.recordset[0] ? result.recordset[0].ID : null);
                                });
                            });
                    });
                } catch (err) {
                    reject(err);
                }
            })()
        });
    }

    async saveOrdenDetalle(pool: any, ordenDetalle: any) {
        return new Promise(async (resolve, reject) => {
            (async function () {
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

                    let transaction = new sql.Transaction(pool);

                    transaction.begin().then(async function () {
                        await new sql.Request(transaction)
                            .input('idOrden', sql.Int, ordenDetalle.idOrden)
                            .input('idEfector', sql.Int, ordenDetalle.idEfector)
                            .input('idNomenclador', sql.Int, ordenDetalle.idNomenclador)
                            .input('descripcion', sql.VarChar(500), ordenDetalle.descripcion)
                            .input('cantidad', sql.Int, ordenDetalle.cantidad)
                            .input('valorUnidad', sql.Decimal(18, 2), ordenDetalle.valorUnidad)
                            .input('ajuste', sql.Decimal(18, 2), ordenDetalle.ajuste)
                            .query(query, (err: any, result: any) => {
                                transaction.commit((err: any) => {
                                    if (err) {
                                        reject(err);
                                    }

                                    resolve(result.recordset[0]);
                                });
                            });
                    })//.then(() => pool.close());
                } catch (err) {
                    reject(err);
                }
            })()
        });
    }
}

