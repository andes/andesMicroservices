import { log } from '@andes/log';
import * as sql from 'mssql';

import * as operaciones from '../service/operaciones.service';
import { fakeRequest } from './../config.private';

export async function existeProfesionalSIPS(profesional: any, conexion) {
    const dni = parseInt(profesional.documento, 10);
    if (dni) {
        const query = `SELECT TOP 1 *
            FROM [dbo].[Sys_Profesional] where [activo]=1 and [numeroDocumento] = '${dni}'`;
        try {
            const result = await conexion.request().query(query);
            if (result && result.recordset) {
                return result.recordset[0];
            } else {
                return null;
            }
        } catch (err) {
            log(fakeRequest, 'microservices:integration:sipsYsumar', profesional.id, 'existeProfesionalSIPS-buscar por documento: error', { error: err, query, profesional: dni });
            return err;
        }
    } else {
        return null;
    }
}

export async function insertarProfesionalSIPS(profesional: any, conexion) {
    let organizacion;
    if (profesional.createdBy.organizacion) {
        organizacion = await operaciones.getOrganizacion(profesional.createdBy.organizacion.id);
    }
    let idEfector: any = organizacion;
    let apellido = profesional.apellido;
    let nombre = profesional.nombre;
    let idTipoDocumento = 1;
    let numeroDocumento = profesional.documento ? profesional.documento : 0;
    let matricula = profesional.matricula ? profesional.matricula : '';
    let legajo = profesional.legajo ? profesional.legajo : '0';
    let codigoSISA = profesional.codigoSISA ? profesional.sisa : '0';
    let activo = 1;
    let idTipoProfesional = 1;
    let idUsuario = 1486739;
    let contactos = profesional.contactos;
    let mail;
    let telefono;
    contactos.forEach((element) => {
        if (element.tipo == 'email') {
            mail = element.valor;
        }
        if (element.tipo == 'celular' || element.tipo == 'fijo') {
            telefono = element.valor;
        }
    });
    let fechaModificacion = profesional.updatedAt ? profesional.updatedAt : profesional.createdAt;
    let queryInsert = 'INSERT INTO [dbo].[Sys_Profesional] ([idEfector], [apellido], [nombre], [idTipoDocumento], [numeroDocumento], [matricula]' +
        ',[legajo],[codigoSISA],[activo],[idTipoProfesional],[idUsuario],[mail],[telefono], [fechaModificacion])' +
        ' VALUES (@idEfector, @apellido, @nombre, @idTipoDocumento, @numeroDocumento, @matricula' +
        ',@legajo, @codigoSISA, @activo, @idTipoProfesional, @idUsuario, @mail, @telefono, @fechaModificacion)' +
        ' SELECT SCOPE_IDENTITY() AS id';
    try {
        let result = await new sql.Request(conexion)
            .input('idEfector', sql.Int, idEfector.organizacion.idSips)
            .input('apellido', sql.VarChar(50), apellido)
            .input('nombre', sql.VarChar(50), nombre)
            .input('idTipoDocumento', sql.Int, idTipoDocumento)
            .input('numeroDocumento', sql.Int, numeroDocumento)
            .input('matricula', sql.VarChar(20), matricula)
            .input('legajo', sql.VarChar(10), legajo)
            .input('codigoSISA', sql.VarChar(20), codigoSISA)
            .input('activo', sql.VarChar(1), activo)
            .input('idTipoProfesional', sql.Int, idTipoProfesional)
            .input('idUsuario', sql.Int, idUsuario)
            .input('mail', sql.VarChar(100), mail)
            .input('telefono', sql.VarChar(50), telefono)
            .input('fechaModificacion', sql.DateTime, new Date(fechaModificacion))
            .query(queryInsert);
        let doc;
        if (!profesional.documento) {
            if (result && result.recordset) {
                doc = result.recordset[0].id;
            }
            let queryUpdate = 'UPDATE  [dbo].[Sys_Profesional] SET numeroDocumento = ' + parseInt(doc) + ' where idProfesional = ' + doc + '  ';
            return await new sql.Request(conexion).query(queryUpdate);
        } else {
            if (result && result.recordset) {
                return result.recordset[0].id;
            }
        }
    } catch (err) {
        log(fakeRequest, 'microservices:integration:sipsYsumar', profesional.id, 'insertarProfesionalSIPS:error', { error: err, queryInsert, profesional: profesional.documento });
        return err;
    }
}
