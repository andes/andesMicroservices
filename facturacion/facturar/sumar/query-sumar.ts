import * as sql from 'mssql';
import { IDtoSumar } from '../../interfaces/IDtoSumar';
import moment = require('moment');
import 'moment/locale/es';
import { fakeRequestSql } from './../../config.private';
import { log } from '@andes/log';

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
        try {
            let query = 'INSERT INTO dbo.PN_comprobante (cuie, id_factura, nombre_medico, fecha_comprobante, clavebeneficiario, id_smiafiliados, fecha_carga, comentario, marca, periodo, activo, alta_comp, idTipoDePrestacion,objectId,factAutomatico) ' +
                ' values (@cuie, NULL, NULL, @fechaComprobante, @claveBeneficiario, @idAfiliado, @fechaCarga, @comentario, @marca, @periodo, @activo,@alta_comp, @idTipoPrestacion, @objectId, @factAutomatico)' +
                ' SELECT SCOPE_IDENTITY() AS id';

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
                .input('alta_comp', sql.VarChar(1), dtoComprobante.alta_comp)
                .input('idTipoPrestacion', sql.Int, dtoComprobante.idTipoPrestacion)
                .input('objectId', sql.VarChar(50), dtoComprobante.objectId)
                .input('factAutomatico', sql.VarChar(50), 'prestacion')
                .query(query);
            return result.recordset[0].id;
        } catch (error) {
            log(fakeRequestSql, 'microservices:factura:create', null, '/error en saveComprobanteSumar', null, error);
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
        let query = 'INSERT INTO [dbo].[PN_prestacion] ([id_comprobante],[id_nomenclador],[cantidad],[precio_prestacion],[id_anexo],[peso],[tension_arterial],[diagnostico],[edad],[sexo],[fecha_nacimiento],[fecha_prestacion],[anio],[mes],[dia],[objectId],[factAutomatico] )' +
            ' VALUES (@idComprobante,@idNomenclador,@cantidad,@precioPrestacion,@idAnexo,@peso,@tensionArterial,@diagnostico,@edad,@sexo,@fechaNacimiento,@fechaPrestacion,@anio,@mes,@dia,@objectId,@factAutomatico)' +
            ' SELECT SCOPE_IDENTITY() AS id';

        try {
            let result = await request
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
            log(fakeRequestSql, 'microservices:factura:create', null, '/error en savePrestacionSumar', null, error);
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
        let query = 'INSERT INTO [dbo].[PN_Rel_PrestacionXDatoReportable] ([idPrestacion], [idDatoReportable], [valor])' +
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
            log(fakeRequestSql, 'microservices:factura:create', null, '/error en saveDatosReportablesSumar', null, error);
        }
    }

    async saveBeneficiario(pool: any, paciente: any) {
        const transaction = new sql.Transaction(pool);

        await transaction.begin();
        const request = await new sql.Request(pool);

        let query = 'INSERT INTO [dbo].[PN_beneficiarios] ([clave_beneficiario],[tipo_transaccion],[apellido_benef],[nombre_benef]' +
            ',[tipo_documento],[numero_doc],[id_categoria],[sexo],[fecha_nacimiento_benef], [id_tribu], [id_lengua],[fecha_inscripcion]' +
            ',[fecha_carga], [usuario_carga],[activo]) ' +
            'VALUES (@clave_beneficiario, @tipo_transaccion, @apellido_benef, @nombre_benef, @tipo_documento, @numero_doc, @id_categoria ' +
            ',@sexo, @fecha_nacimiento_benef, @id_tribu,@id_lengua, @fecha_inscripcion, @fecha_carga, @usuario_carga, @activo) ' +
            'SELECT SCOPE_IDENTITY() AS id';

        try {
            const result = await request
                .input('clave_beneficiario', sql.VarChar(50), '2100000000000000')
                .input('tipo_transaccion', sql.VarChar(100), 'A')
                .input('apellido_benef', sql.VarChar(100), paciente.apellido)
                .input('nombre_benef', sql.VarChar(100), paciente.nombre)
                .input('tipo_documento', sql.VarChar(100), 'DNI')
                .input('numero_doc', sql.VarChar(10), paciente.dni)
                .input('id_categoria', sql.Int, await this.getCategoriaBeneficiario(paciente))
                .input('sexo', sql.VarChar(100), (paciente.sexo === 'masculino') ? 'M' : paciente.sexo === 'femenino' ? 'F' : 'I')
                .input('fecha_nacimiento_benef', sql.DateTime, new Date(paciente.fechaNacimiento))
                .input('id_tribu', sql.Int, 0)
                .input('id_lengua', sql.Int, 0)
                .input('fecha_inscripcion', sql.DateTime, new Date())
                .input('fecha_carga', sql.DateTime, new Date())
                .input('usuario_carga', sql.VarChar(100), 'Fact.Auto')
                .input('activo', sql.VarChar(100), '1')

                .query(query);

            return result.recordset;
        } catch (error) {
            log(fakeRequestSql, 'microservices:factura:create', null, '/error en saveBeneficiarioesSumar', null, error);
        }
    }

    /* Valida si existe el beneficiario en Pn_Beneficiario */
    async validaBeneficiarioSumar(pool: any, paciente: any) {
        return new Promise((resolve: any, reject: any) => {
            (async () => {
                try {
                    let query = 'SELECT * FROM dbo.PN_beneficiarios WHERE numero_doc = @numero_doc AND activo = @activo';
                    let resultado = await new sql.Request(pool)
                        .input('numero_doc', sql.VarChar(50), paciente.dni)
                        .input('activo', sql.VarChar(1), '1')
                        .query(query);
                    if (resultado && resultado.recordset[0]) {
                        resolve(resultado.recordset[0] ? resultado.recordset[0] : null);
                    } else {
                        resolve(null);
                    }

                } catch (err) {
                    reject(err);
                }
            })();
        });
    }

    async getCategoriaBeneficiario(paciente: any) {
        return new Promise((resolve: any, reject: any) => {
            let tipoCategoria = 0;
            let edad = paciente.edadReal ? paciente.edadReal.valor : moment().diff(paciente.fechaNacimiento, 'years');
            if ((edad >= 0) && (edad <= 10)) {
                tipoCategoria = 4;
            } else if ((edad > 10) && (edad <= 19)) {
                tipoCategoria = 5;
            } else if ((edad > 19) && (edad <= 64)) {
                switch (paciente.sexo) {
                    case 'femenino':
                        tipoCategoria = 6;
                        break;
                    case 'masculino':
                        tipoCategoria = 7;
                        break;
                    case 'otro':
                        tipoCategoria = -1;
                        break;
                }
            }
            resolve(tipoCategoria);
        });
    }

    async getAfiliadoSumar(pool: any, documento: any) {
        return new Promise((resolve: any, reject: any) => {
            (async () => {
                try {
                    let query = 'SELECT * FROM dbo.PN_smiafiliados WHERE afidni = @documento AND activo = @activo';
                    let resultado = await new sql.Request(pool)
                        .input('documento', sql.VarChar(50), documento)
                        .input('activo', sql.VarChar(1), 'S')
                        .query(query);

                    if (resultado && resultado.recordset[0]) {
                        resolve(resultado.recordset[0] ? resultado.recordset[0] : null);
                    } else {
                        resolve(null);
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
     * @param {*} pool
     * @param {*} idNomeclador
     * @returns
     * @memberof QuerySumar
     */
    async getNomencladorSumar(pool: any, idNomeclador: any) {
        let query = 'SELECT * FROM [dbo].[PN_nomenclador] where id_nomenclador = @idNomenclador';
        let resultado = await new sql.Request(pool)
            .input('idNomenclador', sql.VarChar(50), idNomeclador)
            .query(query);

        return resultado.recordset[0] ? { precio: resultado.recordset[0].precio } : null;
    }

    async getComprobante(pool: any, dtoSumar: IDtoSumar) {
        return new Promise((resolve: any, reject: any) => {
            (async () => {
                try {
                    let query = 'SELECT id_comprobante FROM dbo.PN_comprobante WHERE objectId = @objectId';
                    let result = await new sql.Request(pool)
                        .input('objectId', sql.VarChar(100), dtoSumar.objectId)
                        .query(query);
                    if (result && result.recordset[0]) {
                        resolve(result.recordset[0].id_comprobante);
                    } else {
                        resolve(null);
                    }
                } catch (err) {
                    reject(err);
                }
            })();
        });
    }

    async getPrestacionSips(pool: any, dtoSumar: IDtoSumar) {
        return new Promise((resolve: any, reject: any) => {
            (async () => {
                try {
                    let fechaPrestacion = moment(dtoSumar.fechaTurno).format('YYYY-MM-DD');

                    let result = await pool.request()
                        .input('idAfiliado', sql.Int, dtoSumar.idAfiliado)
                        .input('idNomenclador', sql.Int, dtoSumar.idNomenclador)
                        .input('fechaPrestacion', sql.Date, fechaPrestacion)
                        .output('idPrestacion', sql.Int)
                        .execute('PN_ValidaPrestacionPaciente');

                    if (result && result.recordset[0]) {
                        resolve(result.recordset[0].id_prestacion);
                    } else {
                        resolve(null);
                    }
                } catch (err) {
                    reject(err);
                }
            })();
        });
    }
}
