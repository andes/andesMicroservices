import * as sql from 'mssql';

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
        let query = 'INSERT INTO dbo.PN_comprobante (cuie, id_factura, nombre_medico, fecha_comprobante, clavebeneficiario, id_smiafiliados, fecha_carga, comentario, marca, periodo, activo, idTipoDePrestacion,objectId,factAutomatico) ' +
            ' values (@cuie, NULL, NULL, @fechaComprobante, @claveBeneficiario, @idAfiliado, @fechaCarga, @comentario, @marca, @periodo, @activo, @idTipoPrestacion, @objectId, @factAutomatico)' +
            ' SELECT SCOPE_IDENTITY() AS id';

        const result = await request
            .input('cuie', sql.VarChar(10), dtoComprobante.cuie)
            .input('fechaComprobante', sql.DateTime, dtoComprobante.fechaComprobante)
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
        let query = 'INSERT INTO [dbo].[PN_prestacion] ([id_comprobante],[id_nomenclador],[cantidad],[precio_prestacion],[id_anexo],[peso],[tension_arterial],[diagnostico],[edad],[sexo],[fecha_nacimiento],[fecha_prestacion],[anio],[mes],[dia] )' +
            ' VALUES (@idComprobante,@idNomenclador,@cantidad,@precioPrestacion,@idAnexo,@peso,@tensionArterial,@diagnostico,@edad,@sexo,@fechaNacimiento,@fechaPrestacion,@anio,@mes,@dia)' +
            ' SELECT SCOPE_IDENTITY() AS id';

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
            .query(query);

        return result.recordset[0].id;
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

        const result = await request
            .input('idPrestacion', sql.Int, dtoPrestacion.idPrestacion)
            .input('idDatoReportable', sql.Int, dtoPrestacion.idDatoReportable)
            .input('valor', sql.VarChar(500), dtoPrestacion.valor)
            .query(query);


        return result.recordset[0].id;
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
}
