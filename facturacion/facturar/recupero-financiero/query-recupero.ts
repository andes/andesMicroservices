import * as sql from 'mssql';
import { IDtoRecupero } from '../../interfaces/IDtoRecupero';
import * as moment from 'moment';

import { userScheduler } from './../../config.private';
import { msFacturacionLog } from './../../logger/msFacturacion';
const log = msFacturacionLog.startTrace();

export class QueryRecupero {

    async getIdPacienteSips(pool: any, dni: any) {
        const query = 'SELECT TOP 1 idPaciente FROM dbo.Sys_Paciente where activo = 1 and numeroDocumento = @dni order by objectId DESC;';
        try {
            const resultado = await new sql.Request(pool)
                .input('dni', sql.VarChar(50), dni)
                .query(query);

            return resultado.recordset.length ? resultado.recordset[0].idPaciente : null;
        } catch (error) {
            log.error('query-recupero:getIdPacienteSips', { query, dni }, error, userScheduler);
            return null;
        }
    }

    async getIdProfesionalSips(pool: any, dni: any) {
        const query = 'SELECT idProfesional FROM dbo.Sys_Profesional WHERE activo = 1 and numeroDocumento = @dni';
        try {
            const resultado = await new sql.Request(pool)
                .input('dni', sql.VarChar(50), dni)
                .query(query);

            return resultado.recordset.length ? resultado.recordset[0].idProfesional : null;
        } catch (error) {
            log.error('query-recupero:getIdProfesionalSips', { query, dni }, error, userScheduler);
            return null;
        }
    }


    async getNomencladorRecupero(pool: any, nomencladorRF: any) {
        const query = 'SELECT idNomenclador, idTipoPractica, valorUnidad, descripcion FROM dbo.FAC_Nomenclador WHERE codigo = @codigo and idTipoNomenclador = @idTipoNomenclador';
        try {
            const resultado = await new sql.Request(pool)
                .input('codigo', sql.VarChar(50), nomencladorRF.codigo)
                .input('idTipoNomenclador', sql.Int, nomencladorRF.idTipoNomenclador)
                .query(query);

            return resultado.recordset[0];
        } catch (error) {
            log.error('query-recupero:getNomencladorRecupero', { query, nomencladorRF }, error, userScheduler);
            return null;
        }
    }

    async getIdObraSocialSips(pool: any, dtoRecupero: any) {
        let query;
        try {
            const prepaga = dtoRecupero.prepaga;
            const codFinanciador = dtoRecupero.codigoFinanciador;
            query = (!prepaga) ? 'SELECT idObraSocial FROM dbo.Sys_ObraSocial WHERE cod_PUCO = @codigo;' : 'SELECT idObraSocial FROM dbo.Sys_ObraSocial WHERE idObraSocial = @codigo;';
            const resultado = await new sql.Request(pool)
                .input('codigo', sql.Int, codFinanciador)
                .query(query);

            return resultado.recordset.length ? resultado.recordset[0].idObraSocial : 0;
        } catch (error) {
            log.error('query-recupero:getIdObraSocialSips', { query }, error, userScheduler);
            return null;
        }
    }

    async getOrdenDePrestacion(pool: any, dtoRecupero: IDtoRecupero) {
        const query = 'SELECT TOP 1 * FROM dbo.FAC_Orden WHERE objectId = @objectId';
        try {
            const resultado = await new sql.Request(pool)
                .input('objectId', sql.VarChar(100), dtoRecupero.objectId)
                .query(query);

            return resultado.recordset.length;
        } catch (error) {
            log.error('query-recupero:getOrdenDePrestacion', { query }, error, userScheduler);
            return null;
        }
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
        const query = 'INSERT INTO [dbo].[FAC_Orden]' +
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

        try {
            
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
            return result.recordset.length ? result.recordset[0].ID : null;
        } catch (error) {
            log.error('query-recupero:saveOrdenRecupero', { dtoOrden, query }, error, userScheduler);
            return null;
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
        const query = 'INSERT INTO [dbo].[FAC_OrdenDetalle]' +
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
        try {
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
            log.error('query-recupero:saveOrdenDetalle', { ordenDetalle, query }, error, userScheduler);
        }
    }
}


/***
 * Obtenemos de SIPS el idTipoNomenclador
 * por medio del store procedure FAC_GetTipoNomenclador 
 */
export async function getIdTipoNomencladorSIPS(idObraSocial: any, fechaTurno: Date, pool: any) {
    const query = 'exec dbo.FAC_GetTipoNomenclador @idObraSocial, @fecha';
    try {
        const fecha = moment(fechaTurno).format('MM-DD-YY');
        const resultado = await new sql.Request(pool)
            .input('fecha', sql.VarChar(8), fecha)
            .input('idObraSocial', sql.Int, idObraSocial)
            .query(query);
        return resultado.recordset.length ? resultado.recordset[0].idTipoNomenclador : null;

    } catch (error) {
        log.error('query-recupero:getIdTipoNomencladorSIPS', { idObraSocial, fechaTurno, query }, error, userScheduler);
        return null;
    }
}

export async function updateRelPacienteObraSocial(pool, idPaciente, idObraSocial) {
    const idRelPacienteObraSocial = await getRelPacienteObraSocial(pool, idPaciente, idObraSocial);
    if (!idRelPacienteObraSocial) {
        await insertRelPacienteObraSocial(pool, idPaciente, idObraSocial);
    }
}

async function getRelPacienteObraSocial(pool, idPaciente, idObraSocial) {
    const query = `SELECT TOP 1 idRelPacienteObraSocial 
            FROM [dbo].[Sys_RelPacienteObraSocial] 
            WHERE idPaciente = @idPaciente AND idObraSocial = @idObraSocial;`;
    try {
        let resultado = await new sql.Request(pool)
            .input('idPaciente', sql.Int, idPaciente)
            .input('idObraSocial', sql.Int, idObraSocial)
            .query(query);

        if (resultado?.recordset[0]) {
            return resultado.recordset[0].idRelPacienteObraSocial;
        }

        return null;
    } catch (error) {
        log.error('query-recupero:getRelPacienteObraSocial', { idObraSocial, idPaciente, query }, error, userScheduler);
        return null;
    }
}

async function insertRelPacienteObraSocial(pool, idPaciente, idObraSocial) {
    const query = `INSERT INTO [dbo].[Sys_RelPacienteObraSocial] 
            ([idPaciente] 
            ,[idObraSocial] 
            ,[numeroAfiliado] 
            ,[fechaAlta]) 
        VALUES 
            (@idPaciente 
            ,@idObraSocial 
            ,@numeroAfiliado 
            ,@fechaAlta) 
            SELECT SCOPE_IDENTITY() as ID`;
    try {
        const result = await new sql.Request(pool)
            .input('idPaciente', sql.Int, idPaciente)
            .input('idObraSocial', sql.Int, idObraSocial)
            .input('numeroAfiliado', sql.VarChar(50), '')
            .input('fechaAlta', sql.DateTime, new Date())
            .query(query);

        return result.recordset[0].id;
    } catch (error) {
        log.error('query-recupero:insertRelPacienteObraSocial', { idObraSocial, idPaciente, query }, error, userScheduler);
        return null;
    }
}