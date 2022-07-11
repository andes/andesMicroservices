import { log } from '@andes/log';
import * as sql from 'mssql';

import * as operaciones from '../service/operaciones.service';
import { fakeRequest } from './../config.private';

export async function existeProfesionalSIPS(profesional: any, conexion) {
    const dni = parseInt(profesional.documento, 10);
    if (dni) {
        const query = `SELECT TOP 1 * FROM [dbo].[Sys_Profesional] where [numeroDocumento] = '${dni}'`;
        try {
            const result = await conexion.request().query(query);
            if (result && result.recordset) {
                return result.recordset[0];
            } else {
                return null;
            }
        } catch (err) {
            log(fakeRequest, 'microservices:integration:profesional_sips', profesional.id, 'existeProfesionalSIPS-buscar por documento: error', { error: err, query, profesional: dni });
            return err;
        }
    } else {
        return null;
    }
}

export async function insertarProfesionalSIPS(profesional: any, conexion) {
    let matricula = '';
    const formacionGrado = profesional.formacionGrado;
    const tieneGrado = formacionGrado && formacionGrado.length;
    const esMatriculado = profesional.profesionalMatriculado;
    if (esMatriculado && tieneGrado && formacionGrado[0].matriculacion && formacionGrado[0].matriculacion.length) {
        matricula = formacionGrado[0].matriculacion[0] ? formacionGrado[0].matriculacion[0].matriculaNumero : '';
    } else {
        if (profesional.matriculaExterna) {
            matricula = profesional.matriculaExterna;
        }
    }
    if (esMatriculado && !matricula) {
        //profesional de matriculaciones sin matricula, no se guarda en sips
        return;
    }

    let organizacion, idTipoProfesional = 1;
    const organizacionUser = profesional.createdBy || profesional.updatedBy;
    if (organizacionUser && organizacionUser.organizacion) {
        organizacion = await operaciones.getOrganizacion(organizacionUser.organizacion.id);
        if (!organizacion.idSips) {
            const efectorSips = await getOrganizacionSIPS(organizacion.sisa, conexion);
            organizacion.idSips = efectorSips.idEfector;
        }
    }
    if (tieneGrado) {
        if (formacionGrado[0].profesion._id) {
            idTipoProfesional = await operaciones.getTipoProfesional(formacionGrado[0].profesion._id);
        }
    }
    const idEfector: any = organizacion.idSips;
    const apellido = profesional.apellido.toUpperCase();
    const nombre = profesional.nombre.toUpperCase();
    const idTipoDocumento = 1;
    const numeroDocumento = profesional.documento ? profesional.documento : 0;
    const legajo = profesional.legajo ? profesional.legajo : '0';
    const codigoSISA = profesional.codigoSISA ? profesional.sisa : '0';
    const activo = 1;
    const idUsuario = 1486739;
    let mail;
    let telefono;
    profesional.contactos.forEach((element) => {
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
            .input('idEfector', sql.Int, idEfector)
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
        log(fakeRequest, 'microservices:integration:profesional_sips', profesional.id, 'insertarProfesionalSIPS:error', { error: err, queryInsert, profesional: profesional.documento });
        return err;
    }
}

export async function getOrganizacionSIPS(codSisa: any, conexion) {
    if (codSisa) {
        const codigoSisa = parseInt(codSisa, 10);
        const query = `SELECT TOP 1 * FROM [SIPS].[dbo].[Sys_Efector] where codigoSisa = '${codigoSisa}' and activo=1`;
        try {
            const result = await conexion.request().query(query);
            return (result && result.recordset) ? result.recordset[0] : null;
        } catch (err) {
            log(fakeRequest, 'microservices:integration:profesional_sips', codSisa, 'getOrganizacionSIPS:error', { error: err, query, codigoSisa });
            return err;
        }
    } else {
        return null;
    }
}
