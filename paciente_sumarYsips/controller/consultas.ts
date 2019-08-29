
import { log } from '@andes/log';
import * as moment from 'moment';
import * as sql from 'mssql';

import * as operaciones from '../service/operaciones.service';
import { fakeRequest } from './../config.private';

export async function getProvincia(codIndec, conexion) {
    if (codIndec) {
        const query = `SELECT [idProvincia]
            FROM [dbo].[Sys_Provincia] where codigoINDEC = ${codIndec}`;

        const result = await conexion.request().query(query);
        if (result && result.recordset) {
            return result.recordset[0].idProvincia;
        }
    }
}

export async function existePacienteSIPS(paciente: any, conexion) {
    const dni = parseInt(paciente.documento, 10);
    const idPaciente = paciente.id;
    if (dni) {
        const query = `SELECT TOP 1 *
            FROM [dbo].[Sys_Paciente] where [activo]=1 and [numeroDocumento] = '${dni}' or [objectId]= '${idPaciente}'`;
        try {
            const result = await conexion.request().query(query);
            if (result && result.recordset) {
                return result.recordset[0];
            } else {
                return null;
            }
        } catch (err) {
            log(fakeRequest, 'microservices:integration:sipsYsumar', paciente.id, 'existePacienteSIPS-buscar por documento: error', { error: err, query, paciente: dni });
            return err;
        }
    } else {
        // Es el caso que se este buscando un paciente que se habia cargado sin documento
        const query1 = `SELECT TOP 1 * FROM [dbo].[Sys_Paciente] where [objectId]='${idPaciente}'`;
        try {
            const result1 = await conexion.request().query(query1);
            if (result1 && result1.recordset) {
                return result1.recordset[0];
            } else {
                return null;
            }
        } catch (err) {
            log(fakeRequest, 'microservices:integration:sipsYsumar', paciente.id, 'existePacienteSIPS- buscar por objectId: error', { error: err, query1 });
            return err;
        }
    }
}

export async function existePacienteSUMAR(paciente: any, conexion) {
    const dni = parseInt(paciente.documento, 10);
    if (dni) {
        const query = `SELECT TOP 1 *
    FROM [dbo].[PN_beneficiarios] where [numero_doc] = '${dni}'`;
        try {
            const result = await conexion.request().query(query);
            if (result && result.recordset) {
                return result.recordset[0];
            } else {
                return null;
            }
        } catch (err) {
            log(fakeRequest, 'microservices:integration:sipsYsumar', paciente.id, 'existePacienteSUMAR: error', { error: err, query, paciente: dni });
            return err;
        }
    }
}

export async function existeParentezco(pacienteSips: any, conexion) {
    if (pacienteSips) {
        const idPacienteSips = parseInt(pacienteSips, 10);
        const query = `
        SELECT TOP 1 *
          FROM [dbo].[Sys_Parentesco] where [idPaciente] = '${idPacienteSips}'`;
        try {
            const result = await conexion.request().query(query);
            if (result && result.recordset) {
                return result.recordset[0];
            } else {
                return null;
            }
        } catch (err) {
            log(fakeRequest, 'microservices:integration:sipsYsumar', null, 'existeParentezco:error', { error: err, query });
            return err;
        }
    }

}
export async function existePacientePUCO(paciente: any, conexion) {
    const dni = parseInt(paciente.documento, 10);
    if (dni) {
        const query = `
                SELECT TOP 1 *
          FROM [Padron].[dbo].[Pd_PUCO] where DNI= '${dni}'`;
        try {
            const result = await conexion.request().query(query);
            if (result && result.recordset) {
                return result.recordset[0];

            } else {
                return null;
            }
        } catch (err) {
            log(fakeRequest, 'microservices:integration:sipsYsumar', paciente.id, 'existePacientePUCO: error', { error: err, query });
            return err;
        }
    }
}

export async function insertarPacienteSIPS(paciente: any, conexion) {
    let idEfector: any = paciente.createdBy.organizacion ? await operaciones.getOrganizacion(paciente.createdBy.organizacion.id) : null;
    let apellido = paciente.apellido;
    let nombre = paciente.nombre;
    let numeroDocumento = paciente.documento ? paciente.documento : 0;
    let idSexo = (paciente.sexo === 'masculino' ? 3 : paciente.sexo === 'femenino' ? 2 : 1);
    let fechaNacimiento = paciente.fechaNacimiento ? moment(paciente.fechaNacimiento).format('MM/DD/YYYY') : moment('19000101').format('MM/DD/YYYY');
    let idEstado = (paciente.estado === 'validado' ? 3 : 2);
    let idPais = (paciente.direccion && paciente.direccion[0].ubicacion && paciente.direccion[0].ubicacion.pais) && (paciente.direccion[0].ubicacion.pais.nombre === 'Argentina') ? 54 : 0;
    let idProvincia: any = 0;
    let idNivelInstruccion = 0;
    let idSituacionLaboral = 0;
    let idProfesion = 0;
    let idOcupacion = 0;
    let idBarrio = 0;
    let idLocalidad = 0;
    let idDepartamento: any = 0;
    let idProvinciaDomicilio = 0;
    let idObraSocial = -1;
    let idUsuario = 1486739;
    let fechaAlta = moment(paciente.createdAt).format('MM/DD/YYYY');
    let fechaDefuncion = paciente.fechaFallecimiento ? moment(paciente.fechaFallecimiento).format('MM/DD/YYYY') : moment(new Date('1900/01/01 03:00:00.000')).format('MM/DD/YYYY');
    let fechaUltimaActualizacion = paciente.updatedAt ? moment(paciente.updatedAt).format('MM/DD/YYYY') : moment(new Date()).format('MM/DD/YYYY');
    let idEstadoCivil = 0;
    let idEtnia = 0;
    let idPoblacion = 0;
    let idIdioma = 0;
    let objectId = paciente.id;

    let queryInsert = 'INSERT INTO [dbo].[Sys_Paciente] ([idEfector], [apellido], [nombre], [numeroDocumento], [idSexo]' +
        ',[fechaNacimiento],[idEstado],[idPais],[idProvincia],[idNivelInstruccion],[idSituacionLaboral],[idProfesion]' +
        ',[idOcupacion],[idBarrio],[idLocalidad],[idDepartamento],[idProvinciaDomicilio],[idObraSocial],[idUsuario]' +
        ',[fechaAlta],[fechaDefuncion],[fechaUltimaActualizacion],[idEstadoCivil],[idEtnia],[idPoblacion],[idIdioma],[objectId])' +
        ' VALUES (@idEfector, @apellido, @nombre, @numeroDocumento, @idSexo' +
        ',@fechaNacimiento, @idEstado, @idPais, @idProvincia, @idNivelInstruccion, @idSituacionLaboral, @idProfesion' +
        ',@idOcupacion,@idBarrio, @idLocalidad, @idDepartamento,@idProvinciaDomicilio,@idObraSocial,@idUsuario' +
        ',@fechaAlta,@fechaDefuncion,@fechaUltimaActualizacion,@idEstadoCivil,@idEtnia,@idPoblacion,@idIdioma,@objectId)' +
        ' SELECT SCOPE_IDENTITY() AS id';
    try {
        let result = await new sql.Request(conexion)
            .input('idEfector', sql.Int, idEfector.organizacion.idSips)
            .input('apellido', sql.VarChar(50), apellido)
            .input('nombre', sql.VarChar(50), nombre)
            .input('numeroDocumento', sql.Int, numeroDocumento)
            .input('idSexo', sql.Int, idSexo)
            .input('fechaNacimiento', sql.DateTime, new Date(fechaNacimiento))
            .input('idEstado', sql.Int, idEstado)
            .input('idPais', sql.Int, idPais)
            .input('idProvincia', sql.Int, idProvincia)
            .input('idNivelInstruccion', sql.Int, idNivelInstruccion)
            .input('idSituacionLaboral', sql.Int, idSituacionLaboral)
            .input('idProfesion', sql.Int, idProfesion)
            .input('idOcupacion', sql.Int, idOcupacion)
            .input('idBarrio', sql.Int, idBarrio)
            .input('idLocalidad', sql.Int, idLocalidad)
            .input('idDepartamento', sql.Int, idDepartamento)
            .input('idProvinciaDomicilio', sql.Int, idProvinciaDomicilio)
            .input('idObraSocial', sql.Int, idObraSocial)
            .input('idUsuario', sql.Int, idUsuario)
            .input('fechaAlta', sql.DateTime, new Date(fechaAlta))
            .input('fechaDefuncion', sql.DateTime, new Date(fechaDefuncion))
            .input('fechaUltimaActualizacion', sql.DateTime, new Date(fechaUltimaActualizacion))
            .input('idEstadoCivil', sql.Int, idEstadoCivil)
            .input('idEtnia', sql.Int, idEtnia)
            .input('idPoblacion', sql.Int, idPoblacion)
            .input('idIdioma', sql.Int, idIdioma)
            .input('objectId', sql.VarChar(50), objectId)
            .query(queryInsert);

        let doc;
        if (!paciente.documento) {
            if (result && result.recordset) {
                doc = result.recordset[0].id;
            }
            let queryUpdate = 'UPDATE  [dbo].[Sys_Paciente] SET numeroDocumento = ' + parseInt(doc) + ' where idPaciente = ' + doc + '  ';
            return await new sql.Request(conexion).query(queryUpdate);
        } else {
            if (result && result.recordset) {
                return result.recordset[0].id;
            }
        }
    } catch (err) {
        log(fakeRequest, 'microservices:integration:sipsYsumar', paciente.id, 'insertarPacienteSIPS:error', { error: err, queryInsert, paciente: paciente.documento });
        return err;
    }
}

export async function insertarPacienteSUMAR(paciente: any, conexion) {
    let clave_beneficiario = 2100000000000000;
    let tipo_transaccion = 'A'; // A = ALTA
    let apellido_benef = paciente.apellido;
    let nombre_benef = paciente.nombre;
    let tipo_documento = 'DNI';
    let numero_doc = null;
    let clase_documento_benef = '';

    let tipo_doc_madre = 'DNI';
    let nro_doc_madre = null;
    let apellido_madre = null;
    let nombre_madre = null;

    let tipo_doc_padre = 'DNI';
    let nro_doc_padre = null;
    let apellido_padre = null;
    let nombre_padre = null;

    if (paciente.documento) {
        numero_doc = paciente.documento;
        clase_documento_benef = 'P'; // Propio
    } else {
        if (paciente.relaciones && paciente.relaciones.length > 0) {
            if (paciente.relaciones[0].relacion.nombre === 'progenitor/a') {
                let progenitor: any = await operaciones.getPaciente(paciente.relaciones[0].referencia);
                if (progenitor) {
                    numero_doc = progenitor.documento; //  Le pone el documento del tutor porque no tiene documento propio.
                    clase_documento_benef = 'A'; // Ajeno
                    if (progenitor.sexo === 'masculino') {
                        nro_doc_padre = progenitor.documento;
                        apellido_padre = progenitor.apellido;
                        nombre_padre = progenitor.nombre;
                    } else {
                        nro_doc_madre = progenitor.documento;
                        apellido_madre = progenitor.apellido;
                        nombre_madre = progenitor.nombre;
                    }
                }
            } else {
                return; /* Si no tiene documento ni relaciones no sirve para guardarlo en PN_Beneficiarios */
            }
        } else {
            return; /* Si no tiene documento ni relaciones no sirve para guardarlo en PN_Beneficiarios */
        }
    }

    let id_categoria = getCategoria(paciente);
    let sexo = (paciente.sexo === 'masculino' ? 'M' : paciente.sexo === 'femenino' ? 'F' : 'I');
    let fecha_nacimiento_benef = moment(paciente.fechaNacimiento).format('MM/DD/YYYY');
    let cuie_ah: any = paciente.createdBy.organizacion ? await operaciones.getOrganizacion(paciente.createdBy.organizacion.id) : null;
    let cuie_ea = cuie_ah.organizacion.cuie;
    let departamento = '';
    if (paciente.direccion && paciente.direccion[0].ubicacion && paciente.direccion[0].ubicacion.localidad && paciente.direccion[0].ubicacion.provincia) {
        let localidad_nac1: any = await operaciones.getLocalidad(paciente.direccion[0].ubicacion.localidad.id);
        departamento = localidad_nac1 ? localidad_nac1.departamento : null;
    }
    let fecha_inscripcion = moment(paciente.createdAt).format('MM/DD/YYYY');
    let fecha_carga = fecha_inscripcion;
    let usuario_carga = '1486739';
    let activo = 1;

    let queryInsert = 'INSERT INTO [dbo].[PN_beneficiarios] ([clave_beneficiario], [tipo_transaccion],[apellido_benef],[nombre_benef]' +
        ', [clase_documento_benef],[tipo_documento],[numero_doc], [id_categoria], [sexo], [fecha_nacimiento_benef]' +
        ', [tipo_doc_madre],[nro_doc_madre],[apellido_madre],[nombre_madre],[tipo_doc_padre],[nro_doc_padre],[apellido_padre], [nombre_padre] ' +
        ', [cuie_ea],[cuie_ah],[departamento], [fecha_inscripcion],[fecha_carga], [usuario_carga],[activo])' +
        ' VALUES (@clave_beneficiario, @tipo_transaccion, @apellido_benef, @nombre_benef, @clase_documento_benef, @tipo_documento ' +
        ', @numero_doc, @id_categoria, @sexo, @fecha_nacimiento_benef, @tipo_doc_madre, @nro_doc_madre, @apellido_madre, @nombre_madre, @tipo_doc_padre ' +
        ', @nro_doc_padre, @apellido_padre, @nombre_padre, @cuie_ea, @cuie_ah, @departamento, @fecha_inscripcion, @fecha_carga, @usuario_carga, @activo) ' +
        ' SELECT SCOPE_IDENTITY() AS id';
    let queryUpdate;
    try {
        let result = await new sql.Request(conexion)
            .input('clave_beneficiario', sql.VarChar(50), clave_beneficiario)
            .input('tipo_transaccion', sql.VarChar(1), tipo_transaccion)
            .input('apellido_benef', sql.VarChar(50), apellido_benef)
            .input('nombre_benef', sql.VarChar(50), nombre_benef)
            .input('clase_documento_benef', sql.VarChar(50), clase_documento_benef)
            .input('tipo_documento', sql.VarChar(10), tipo_documento)
            .input('numero_doc', sql.VarChar(12), numero_doc)
            .input('id_categoria', sql.Int, id_categoria)
            .input('sexo', sql.VarChar(1), sexo)
            .input('fecha_nacimiento_benef', sql.DateTime, new Date(fecha_nacimiento_benef))
            .input('tipo_doc_madre', sql.VarChar(5), tipo_doc_madre)
            .input('nro_doc_madre', sql.VarChar(12), nro_doc_madre)
            .input('apellido_madre', sql.VarChar(50), apellido_madre)
            .input('nombre_madre', sql.VarChar(50), nombre_madre)
            .input('tipo_doc_padre', sql.VarChar(5), tipo_doc_padre)
            .input('nro_doc_padre', sql.VarChar(12), nro_doc_padre)
            .input('apellido_padre', sql.VarChar(50), apellido_padre)
            .input('nombre_padre', sql.VarChar(50), nombre_padre)
            .input('cuie_ea', sql.VarChar(10), cuie_ea)
            .input('cuie_ah', sql.VarChar(10), cuie_ah.organizacion.cuie)
            .input('departamento', sql.VarChar(50), departamento)
            .input('fecha_inscripcion', sql.DateTime, new Date(fecha_inscripcion))
            .input('fecha_carga', sql.DateTime, new Date(fecha_carga))
            .input('usuario_carga', sql.VarChar(50), usuario_carga)
            .input('activo', sql.VarChar(1), activo)
            .query(queryInsert);

        let id;
        if (result && result.recordset) {
            id = result.recordset[0].id;
        }
        queryUpdate = 'UPDATE  [dbo].[PN_beneficiarios] SET clave_beneficiario = ' + (2100000000000000 + parseInt(id)) + ' where id_beneficiarios = ' + id + '  ';
        await new sql.Request(conexion).query(queryUpdate);
    } catch (err) {
        log(fakeRequest, 'microservices:integration:sipsYsumar', paciente.id, 'insertarPacienteSUMARR:error', err, { insert: queryInsert, update: queryUpdate, paciente: paciente.documento });
        return err;
    }
}

export async function insertarParentezco(pacienteSips: any, tutor, conexion) {
    let progenitor: any = await operaciones.getPaciente(tutor.referencia);
    if (progenitor) {
        let apellido = progenitor.apellido;
        let nombre = progenitor.nombre;
        let idTipoDocumento = progenitor.documento ? 1 : 5;
        let numeroDocumento = progenitor.documento ? progenitor.documento : 0;
        let fechaNacimiento = progenitor.fechaNacimiento ? progenitor.fechaNacimiento : '19000101';
        let idPais = 0;
        let idProvincia = 0;
        let idNivelInstruccion = 0;
        let idSituacionLaboral = 0;
        let idProfesion = 0;
        let idPaciente = pacienteSips;
        let tipoParentesco = '';
        switch (tutor.relacion.nombre) {
            case 'progenitor/a':
                tipoParentesco = progenitor.sexo === 'femenino' ? 'MADRE' : 'PADRE';
                break;
            case 'tutor':
                tipoParentesco = 'TUTOR';
                break;
            default:
                tipoParentesco = tutor.relacion.nombre;
                break;
        }
        let idUsuario = '1486739';
        let fechaModificacion = progenitor.updatedAt;
        let idAntecedente = 0;
        let queryInsert = 'INSERT INTO [dbo].[Sys_Parentesco] ([apellido], [nombre],[idTipoDocumento],[numeroDocumento]' +
            ',[fechaNacimiento],[idPais],[idProvincia],[idNivelInstruccion],[idSituacionLaboral],[idProfesion]' +
            ',[idPaciente],[tipoParentesco],[idUsuario]' +
            ',[fechaModificacion],[idAntecedente]) ' +
            'VALUES (\'' + apellido + '\',\'' + nombre + '\',' + idTipoDocumento + ','
            + numeroDocumento + ',\'' + fechaNacimiento + '\',' + idPais +
            ',' + idProvincia + ',' + idNivelInstruccion + ',' + idSituacionLaboral + ',' + idProfesion +
            ',' + idPaciente + ',\'' + tipoParentesco + '\',' + idUsuario +
            ',\'' + fechaModificacion + '\',' + idAntecedente + '\) ';
        try {
            const result = await new sql.Request(conexion).query(queryInsert);
            if (result && result.recordset) {
                return result.recordset[0];
            }

        } catch (err) {
            log(fakeRequest, 'microservices:integration:sipsYsumar', progenitor.id, 'insertarParentezco:error', { err, queryInsert });
            return err;
        }
    }
}

export async function actualizarPacienteSIPS(paciente: any, pacienteExistente: any, conexion) {
    let idPaciente = pacienteExistente.idPaciente;
    let apellido = paciente.apellido;
    let nombre = paciente.nombre;
    let numeroDocumento = paciente.documento ? paciente.documento : pacienteExistente.documento;
    let idSexo = (paciente.sexo === 'masculino' ? 3 : paciente.sexo === 'femenino' ? 2 : 1);
    let fechaNacimiento = paciente.fechaNacimiento ? moment(paciente.fechaNacimiento).format('MM/DD/YYYY') : moment(new Date('1900/01/01 00:00:00.000')).format('MM/DD/YYYY');
    let idEstado = (paciente.estado === 'validado' ? 3 : 2);
    let idProvincia: any = 0;
    let calle = paciente.direccion ? paciente.direccion[0].valor : null;
    let fechaUltimaActualizacion = paciente.updatedAt ? moment(paciente.updatedAt).format('MM/DD/YYYY') : moment(new Date()).format('MM/DD/YYYY');
    let telefono = paciente.contacto ? paciente.contacto.map(unContacto => {
        let numero = {
            telefonoCelular: unContacto.tipo === 'celular' ? unContacto.valor : 0,
            telefonoFijo: unContacto.tipo === 'fijo' ? unContacto.valor : 0
        };
        return numero;
    }) : null;
    let telefonoFijo = telefono[0].telefonoFijo;
    let telefonoCelular = telefono[0].telefonoCelular;
    let objectId = paciente.id;

    let query = 'UPDATE [dbo].[Sys_Paciente] SET apellido = @apellido, nombre = @nombre, numeroDocumento = @numeroDocumento, idSexo = @idSexo ' +
        ', fechaNacimiento = @fechaNacimiento, idEstado = @idEstado, idProvincia = @idProvincia, calle = @calle, fechaUltimaActualizacion = @fechaUltimaActualizacion ' +
        ', telefonoFijo = @telefonoFijo, objectId = @objectId, telefonoCelular = @telefonoCelular where idPaciente = @idPaciente ';

    try {
        let result = await new sql.Request(conexion)
            .input('apellido', sql.VarChar(50), apellido)
            .input('nombre', sql.VarChar(50), nombre)
            .input('numeroDocumento', sql.Int, numeroDocumento)
            .input('idSexo', sql.Int, idSexo)
            .input('fechaNacimiento', sql.DateTime, new Date(fechaNacimiento))
            .input('idEstado', sql.Int, idEstado)
            .input('idProvincia', sql.Int, idProvincia)
            .input('calle', sql.VarChar(50), calle)
            .input('fechaUltimaActualizacion', sql.DateTime, new Date(fechaUltimaActualizacion))
            .input('telefonoFijo', sql.VarChar(50), telefonoFijo)
            .input('objectId', sql.VarChar(50), objectId)
            .input('telefonoCelular', sql.VarChar(50), telefonoCelular)
            .input('idPaciente', sql.Int, idPaciente)
            .query(query);
    } catch (err) {
        log(fakeRequest, 'microservices:integration:sipsYsumar', paciente.id, 'actualizarPacienteSIPS:error', { error: err, query, paciente: paciente.documento });
        return err;
    }
}

export async function actualizarPacienteSUMAR(paciente: any, pacienteExistente: any, conexion) {
    let apellido_benef = paciente.apellido;
    let nombre_benef = paciente.nombre;
    let tipo_documento = 'DNI';
    let numero_doc = null;
    let clase_documento_benef = null;
    let tipo_doc_madre = 'DNI';
    let nro_doc_madre = null;
    let apellido_madre = null;
    let nombre_madre = null;
    let tipo_doc_padre = 'DNI';
    let nro_doc_padre = null;
    let apellido_padre = null;
    let nombre_padre = null;

    if (paciente.documento) {
        numero_doc = paciente.documento;
        clase_documento_benef = 'P'; // Propio
    } else {
        if (paciente.relaciones && paciente.relaciones.length > 0) {
            if (paciente.relaciones[0].relacion.nombre === 'progenitor/a') {
                let progenitor: any = await operaciones.getPaciente(paciente.relaciones[0].referencia);
                if (progenitor) {
                    numero_doc = progenitor.documento; //  Le pone el documento del tutor porque no tiene documento propio.
                    clase_documento_benef = 'A'; // Ajeno
                    if (progenitor.sexo === 'masculino') {
                        nro_doc_padre = progenitor.documento;
                        apellido_padre = progenitor.apellido;
                        nombre_padre = progenitor.nombre;
                    } else {
                        nro_doc_madre = progenitor.documento;
                        apellido_madre = progenitor.apellido;
                        nombre_madre = progenitor.nombre;
                    }
                }
            }
        }
    }
    let calle = paciente.direccion ? paciente.direccion[0].valor : null;
    let id_categoria = getCategoria(paciente);
    let sexo = (paciente.sexo === 'masculino' ? 'M' : paciente.sexo === 'femenino' ? 'F' : 'I');
    let fecha_nacimiento_benef = moment(paciente.fechaNacimiento).format('YYYY-MM-DD');
    let query = 'UPDATE [dbo].[PN_beneficiarios] SET' +
        '[apellido_benef] =' + '\'' + apellido_benef + '\'' +
        ',[nombre_benef] =' + '\'' + nombre_benef + '\'' +
        ',[clase_documento_benef] =' + '\'' + clase_documento_benef + '\'' +
        ',[tipo_documento] =' + '\'' + tipo_documento + '\'' +
        ',[numero_doc] = ' + '\'' + numero_doc + '\'' +
        ',[id_categoria] = ' + id_categoria +
        ',[sexo] = ' + '\'' + sexo + '\'' +
        ',[calle] = ' + '\'' + calle + '\'' +
        ',[fecha_nacimiento_benef] = ' + '\'' + fecha_nacimiento_benef + '\'' +
        ',[tipo_doc_madre] =' + '\'' + tipo_doc_madre + '\'' +
        ',[nro_doc_madre] =' + nro_doc_madre +
        ',[apellido_madre] = ' + apellido_madre +
        ',[nombre_madre] = ' + nombre_madre +
        ',[tipo_doc_padre] =' + '\'' + tipo_doc_padre + '\'' +
        ',[nro_doc_padre]=' + nro_doc_padre +
        ',[apellido_padre] =' + apellido_padre +
        ',[nombre_padre] =' + nombre_padre +
        ' where [id_beneficiarios] = ' + pacienteExistente.id_beneficiarios + '  ';
    try {
        const result = await new sql.Request(conexion).query(query);
        if (result && result.recordset) {
            return result.recordset[0];
        }
    } catch (err) {
        log(fakeRequest, 'microservices:integration:sipsYsumar', paciente.id, 'actualizarPacienteSUMAR:error', { error: err, query, paciente: paciente.documento });
        return err;
    }
}

function getCategoria(paciente) {
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

    return tipoCategoria;
}

