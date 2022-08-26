import * as sql from 'mssql';
import { IDtoSumar } from '../../interfaces/IDtoSumar';
import moment = require('moment');
import 'moment/locale/es';
import { msFacturacionLog } from '../../logger/msFacturacion';
import { userScheduler } from '../../config.private';

const log = msFacturacionLog.startTrace();

export async function getComprobante(pool, objectId) {
    const query = 'SELECT id_comprobante FROM dbo.PN_comprobante WHERE objectId = @objectId';
    try {
        const result = await new sql.Request(pool)
            .input('objectId', sql.VarChar(100), objectId)
            .query(query);

        return result.recordset.length ? result.recordset[0].id_comprobante : null;
    } catch (err) {
        log.error('query-sumar:getComprobante', { objectId, query }, err, userScheduler);
        return null;
    }
}

export async function insertComprobante(request, cuie, fechaComprobante, afiliadoSumar, objectId) {
    try {
        const periodo = moment(fechaComprobante, 'YYYY/MM/DD').format('YYYY') + '/' + moment(fechaComprobante, 'YYYY/MM/DD').format('MM');
        const query = 'INSERT INTO dbo.PN_comprobante (cuie, id_factura, nombre_medico, fecha_comprobante, clavebeneficiario, id_smiafiliados, fecha_carga, comentario, marca, periodo, activo, idTipoDePrestacion,objectId,factAutomatico) ' +
            ' values (@cuie, NULL, NULL, @fechaComprobante, @clavebeneficiario, @id_smiafiliados, @fecha_carga, @comentario, @marca, @periodo, @activo, @idTipoPrestacion, @objectId, @factAutomatico)' +
            ' SELECT SCOPE_IDENTITY() AS id';

        const result = await request
            .input('cuie', sql.VarChar(10), cuie)
            .input('fechaComprobante', sql.DateTime, new Date(fechaComprobante))
            .input('clavebeneficiario', sql.VarChar(50), afiliadoSumar.clavebeneficiario)
            .input('id_smiafiliados', sql.Int, afiliadoSumar.id_smiafiliados)
            .input('fecha_carga', sql.DateTime, new Date())
            .input('comentario', sql.VarChar(500), 'Carga Automática')
            .input('marca', sql.VarChar(10), null)
            .input('periodo', sql.VarChar(7), periodo)
            .input('activo', sql.VarChar(1), 'S')
            .input('idTipoPrestacion', sql.Int, 1)
            .input('objectId', sql.VarChar(50), objectId)
            .input('factAutomatico', sql.VarChar(50), 'prestacion')
            .query(query);

        return result.recordset[0].id;
    } catch (error) {
        log.error('query-sumar:getComprobante', { error }, error, userScheduler);
        return null;
    }
}

export async function savePrestacionSumar(request, paciente, diagnostico, idComprobante, idNomenclador, precioPrestacion, fechaPrestacion, objectId) {
    const query = 'INSERT INTO [dbo].[PN_prestacion] ([id_comprobante],[id_nomenclador],[cantidad],[precio_prestacion],[id_anexo],[peso],[tension_arterial],[diagnostico],[edad],[sexo],[fecha_nacimiento],[fecha_prestacion],[anio],[mes],[dia],[objectId],[factAutomatico] )' +
        ' VALUES (@idComprobante,@idNomenclador,@cantidad,@precioPrestacion,@idAnexo,@peso,@tensionArterial,@diagnostico,@edad,@sexo,@fechaNacimiento,@fechaPrestacion,@anio,@mes,@dia,@objectId,@factAutomatico)' +
        ' SELECT SCOPE_IDENTITY() AS id';

    try {
        const result = await request
            .input('idComprobante', sql.Int, idComprobante)
            .input('idNomenclador', sql.Int, idNomenclador)
            .input('cantidad', sql.Int, 1) // Valor por defecto
            .input('precioPrestacion', sql.Decimal, precioPrestacion)
            .input('idAnexo', sql.Int, 301) // Valor por defecto (No corresponde)
            .input('peso', sql.Decimal, 0)
            .input('tensionArterial', sql.VarChar(7), '00/00')
            .input('diagnostico', sql.VarChar(500), diagnostico)
            .input('edad', sql.VarChar(2), moment(new Date()).diff(paciente.fechaNacimiento, 'years'))
            .input('sexo', sql.VarChar(2), paciente.sexo === 'masculino' ? 'M' : 'F')
            .input('fechaNacimiento', sql.DateTime, new Date(paciente.fechaNacimiento))
            .input('fechaPrestacion', sql.DateTime, new Date(fechaPrestacion))
            .input('anio', sql.Int, moment(paciente.fechaNacimiento).format('YYYY'))
            .input('mes', sql.Int, moment(paciente.fechaNacimiento).format('MM'))
            .input('dia', sql.Int, moment(paciente.fechaNacimiento).format('DD'))
            .input('objectId', sql.VarChar(50), objectId)
            .input('factAutomatico', sql.VarChar(50), 'prestacion')
            .query(query);
        return result.recordset[0].id;
    } catch (error) {
        log.error('query-sumar:savePrestacionSumar', { query }, error, userScheduler);
        return null;
    }
}

export async function getAfiliadoSumar(pool: any, documento: any) {
    const query = 'SELECT TOP 1 * FROM dbo.PN_smiafiliados WHERE afidni = @documento AND activo = @activo';
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

export async function getPrestacionSips(pool, fechaTurno, idAfiliado, idNomenclador) {
    try {
        const fechaPrestacion = moment(fechaTurno).format('YYYY-MM-DD');
        const result = await new sql.Request(pool)
            .input('idAfiliado', sql.Int, idAfiliado)
            .input('idNomenclador', sql.Int, idNomenclador)
            .input('fechaPrestacion', sql.Date, fechaPrestacion)
            .output('idPrestacion', sql.Int)
            .execute('PN_ValidaPrestacionPaciente');
        return result.recordset.length ? result.recordset[0].id_prestacion : null;
    }
    catch (error) {
        log.error('query-sumar:getPrestacionSips', { fechaTurno, idAfiliado, idNomenclador }, error, userScheduler);
        return null;
    }
}

export async function getNomencladorRecupero(request, codigo, idTipoNomenclador) {
    const query = 'SELECT idNomenclador, idTipoPractica, valorUnidad, descripcion FROM dbo.FAC_Nomenclador WHERE codigo = @codigo and idTipoNomenclador = @idTipoNomenclador';
    try {
        const resultado = await request
            .input('codigo', sql.VarChar(50), codigo)
            .input('idTipoNomenclador', sql.Int, idTipoNomenclador)
            .query(query);

        return resultado.recordset[0];
    } catch (error) {
        log.error('query-recupero:getNomencladorRecupero', { query }, error, userScheduler);
        return null;
    }
}

export async function getNomencladorSumar(request, idNomenclador: any) {
    const query = 'SELECT * FROM [dbo].[PN_nomenclador] where id_nomenclador = @idNomenclador';
    try {
        const resultado = await request
        .input('idNomenclador', sql.VarChar(50), idNomenclador)
        .query(query);

        return resultado.recordset.length ? { precio: resultado.recordset[0].precio } : null;
    } catch (error) {
        log.error('query-sumar:getNomencladorSumar', { idNomenclador, query }, error, userScheduler);
        return null;
    }
    
}

export async function saveDatosReportablesSumar(request, idPrestacion, idDatoReportable, valor) {
    const query = 'INSERT INTO [dbo].[PN_Rel_PrestacionXDatoReportable] ([idPrestacion], [idDatoReportable], [valor])' +
        ' values (@idPrestacion, @idDatoReportable, @valor)' +
        'SELECT SCOPE_IDENTITY() AS id';

    try {
        const result = await request
            .input('idPrestacion', sql.Int, idPrestacion)
            .input('idDatoReportable', sql.Int, idDatoReportable)
            .input('valor', sql.VarChar(500), valor)
            .query(query);
        return result.recordset[0].id;
    } catch (error) {
        log.error('query-sumar:saveDatosReportablesSumar', { query }, error, userScheduler);
        return null;
    }
}
