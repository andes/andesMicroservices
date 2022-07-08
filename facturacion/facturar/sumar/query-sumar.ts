import * as sql from 'mssql';
import { IDtoSumar } from '../../interfaces/IDtoSumar';
import moment = require('moment');
import 'moment/locale/es';
import { msFacturacionLog } from '../../logger/msFacturacion';
import { userScheduler } from '../../config.private';

const log = msFacturacionLog.startTrace();

export class QuerySumar {

    /**
     *
     *
     * @param {*} transaction
     * @param {*} dtoComprobante
     * @returns
     * @memberof QuerySumar
     */
    async saveComprobanteSumar(request: any, dtoComprobante: any) {
        const query = 'INSERT INTO dbo.PN_comprobante (cuie, id_factura, nombre_medico, fecha_comprobante, clavebeneficiario, id_smiafiliados, fecha_carga, comentario, marca, periodo, activo, idTipoDePrestacion,objectId,factAutomatico) ' +
            ' values (@cuie, NULL, NULL, @fechaComprobante, @claveBeneficiario, @idAfiliado, @fechaCarga, @comentario, @marca, @periodo, @activo, @idTipoPrestacion, @objectId, @factAutomatico)' +
            ' SELECT SCOPE_IDENTITY() AS id';

        try {
            const result = await request
                .input('cuie', sql.VarChar(10), dtoComprobante.cuie)
                .input('fechaComprobante', sql.DateTime, new Date(dtoComprobante.fechaComprobante))
                .input('claveBeneficiario', sql.VarChar(50), dtoComprobante.claveBeneficiario)
                .input('idAfiliado', sql.Int, dtoComprobante.idAfiliado)
                .input('fechaCarga', sql.DateTime, dtoComprobante.fechaCarga)
                .input('comentario', sql.VarChar(500), dtoComprobante.comentario)
                .input('marca', sql.VarChar(10), dtoComprobante.marca)
                .input('periodo', sql.VarChar(7), dtoComprobante.periodo)
                .input('activo', sql.VarChar(1), dtoComprobante.activo)
                .input('idTipoPrestacion', sql.Int, dtoComprobante.idTipoPrestacion)
                .input('objectId', sql.VarChar(50), dtoComprobante.objectId)
                .input('factAutomatico', sql.VarChar(50), 'prestacion')
                .query(query);
            return result.recordset[0].id;
        } catch (error) {
            log.error('query-sumar:saveComprobanteSumar', { dtoComprobante, query }, error, userScheduler);
            return null;
        }
    }

    /**
     *
     *
     * @param {*} transaction
     * @param {*} dtoPrestacion
     * @returns
     * @memberof QuerySumar
     */
    async savePrestacionSumar(request: any, dtoPrestacion: any) {
        const query = 'INSERT INTO [dbo].[PN_prestacion] ([id_comprobante],[id_nomenclador],[cantidad],[precio_prestacion],[id_anexo],[peso],[tension_arterial],[diagnostico],[edad],[sexo],[fecha_nacimiento],[fecha_prestacion],[anio],[mes],[dia],[objectId],[factAutomatico] )' +
            ' VALUES (@idComprobante,@idNomenclador,@cantidad,@precioPrestacion,@idAnexo,@peso,@tensionArterial,@diagnostico,@edad,@sexo,@fechaNacimiento,@fechaPrestacion,@anio,@mes,@dia,@objectId,@factAutomatico)' +
            ' SELECT SCOPE_IDENTITY() AS id';

        try {
            const result = await request
                .input('idComprobante', sql.Int, dtoPrestacion.idComprobante)
                .input('idNomenclador', sql.Int, dtoPrestacion.idNomenclador)
                .input('cantidad', sql.Int, 1) // Valor por defecto
                .input('precioPrestacion', sql.Decimal, dtoPrestacion.precioPrestacion)
                .input('idAnexo', sql.Int, 301) // Valor por defecto (No corresponde)
                .input('peso', sql.Decimal, 0)
                .input('tensionArterial', sql.VarChar(7), '00/00')
                .input('diagnostico', sql.VarChar(500), dtoPrestacion.diagnostico)
                .input('edad', sql.VarChar(2), dtoPrestacion.edad)
                .input('sexo', sql.VarChar(2), dtoPrestacion.sexo)
                .input('fechaNacimiento', sql.DateTime, new Date(dtoPrestacion.fechaNacimiento))
                .input('fechaPrestacion', sql.DateTime, new Date(dtoPrestacion.fechaPrestacion))
                .input('anio', sql.Int, dtoPrestacion.anio)
                .input('mes', sql.Int, dtoPrestacion.mes)
                .input('dia', sql.Int, dtoPrestacion.dia)
                .input('objectId', sql.VarChar(50), dtoPrestacion.objectId)
                .input('factAutomatico', sql.VarChar(50), 'prestacion')
                .query(query);
            return result.recordset[0].id;
        } catch (error) {
            log.error('query-sumar:savePrestacionSumar', { dtoPrestacion, query }, error, userScheduler);
            return null;
        }
    }

    /**
     *
     *
     * @param {*} transaction
     * @param {*} dtoPrestacion
     * @returns
     * @memberof QuerySumar
     */
    async saveDatosReportablesSumar(request: any, dtoPrestacion: any) {
        const query = 'INSERT INTO [dbo].[PN_Rel_PrestacionXDatoReportable] ([idPrestacion], [idDatoReportable], [valor])' +
            ' values (@idPrestacion, @idDatoReportable, @valor)' +
            'SELECT SCOPE_IDENTITY() AS id';

        try {
            const result = await request
                .input('idPrestacion', sql.Int, dtoPrestacion.idPrestacion)
                .input('idDatoReportable', sql.Int, dtoPrestacion.idDatoReportable)
                .input('valor', sql.VarChar(500), dtoPrestacion.valor)
                .query(query);
            return result.recordset[0].id;
        } catch (error) {
            log.error('query-sumar:saveDatosReportablesSumar', { dtoPrestacion, query }, error, userScheduler);
            return null;
        }
    }

    async getAfiliadoSumar(pool: any, documento: any) {
        const query = 'SELECT * FROM dbo.PN_smiafiliados WHERE afidni = @documento AND activo = @activo';
        try {
            const resultado = await new sql.Request(pool)
                .input('documento', sql.VarChar(50), documento)
                .input('activo', sql.VarChar(1), 'S')
                .query(query);
            return resultado.recordset.length ? resultado.recordset[0] : null;

        } catch (error) {
            log.error('query-sumar:getAfiliadoSumar', { documento, query }, error, userScheduler);
            return null;
        }
    }

    /**
     *
     *
     * @param {*} pool
     * @param {*} idNomeclador
     * @returns
     * @memberof QuerySumar
     */
    async getNomencladorSumar(pool: any, idNomenclador: any) {
        const query = 'SELECT * FROM [dbo].[PN_nomenclador] where id_nomenclador = @idNomenclador';
        try {
            const resultado = await new sql.Request(pool)
            .input('idNomenclador', sql.VarChar(50), idNomenclador)
            .query(query);

            return resultado.recordset.length ? { precio: resultado.recordset[0].precio } : null;
        } catch (error) {
            log.error('query-sumar:getNomencladorSumar', { idNomenclador, query }, error, userScheduler);
            return null;
        }
        
    }

    async getComprobante(pool: any, dtoSumar: IDtoSumar) {
        const query = 'SELECT id_comprobante FROM dbo.PN_comprobante WHERE objectId = @objectId';
        try {
            const result = await new sql.Request(pool)
                .input('objectId', sql.VarChar(100), dtoSumar.objectId)
                .query(query);

            return result.recordset.length ? result.recordset[0].id_comprobante : null;
        }
        catch (err) {
            log.error('query-sumar:getComprobante', { dtoSumar, query }, err, userScheduler);
            return null;
        }
    }

    async getPrestacionSips(pool: any, dtoSumar: IDtoSumar) {
        try {
            const fechaPrestacion = moment(dtoSumar.fechaTurno).format('YYYY-MM-DD');
            const result = await pool.request()
                .input('idAfiliado', sql.Int, dtoSumar.idAfiliado)
                .input('idNomenclador', sql.Int, dtoSumar.idNomenclador)
                .input('fechaPrestacion', sql.Date, fechaPrestacion)
                .output('idPrestacion', sql.Int)
                .execute('PN_ValidaPrestacionPaciente');
            return result.recordset.length ? result.recordset[0].id_prestacion : null;
        }
        catch (error) {
            log.error('query-sumar:getPrestacionSips', { dtoSumar }, error, userScheduler);
            return null;
        }
    }
}
