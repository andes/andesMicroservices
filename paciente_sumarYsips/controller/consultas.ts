
import { log } from '@andes/log';
import * as moment from 'moment';
import * as sql from 'mssql';
import * as operaciones from '../service/operaciones.service';

let fakeRequest = {
        user: {
                usuario: 'sipsYsumar',
                app: 'integracion-sipsYsumar',
                organizacion: 'sss'
        },
        ip: 'localhost',
        connection: {
                localAddress: ''
        }
};
export async function getEfector(codigoCuie, conexion) {
        if (codigoCuie) {
                const query = `SELECT [idEfector]
                ,[nombre]
                ,[codigoSisa]
            FROM [dbo].[Sys_Efector] where cuie='${codigoCuie}'`;

                const result = await conexion.request().query(query);
                if (result && result.recordset) {
                        return result.recordset[0].idEfector;
                }

        }

}
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
export async function getObraSocial(codigoPuco, conexion) {
        if (codigoPuco) {
                const query = `SELECT [idObraSocial],[nombre]
                FROM [dbo].[Sys_ObraSocial] where cod_PUCO ='${codigoPuco}'`;
                const result = await conexion.request().query(query);
                if (result && result.recordset) {
                        return result.recordset[0].idObraSocial;
                }
        }

}
export async function getDepartamento(nombreDpto, conexion) {
        if (nombreDpto) {
                const query = `SELECT [idDepartamento]
                ,[nombre]
            FROM  [dbo].[Sys_Departamento] WHERE nombre= '${nombreDpto}'`;
                const result = await conexion.request().query(query);
                if (result && result.recordset) {
                        return result.recordset[0].idDepartamento;
                }
        }

}

export async function existePacienteSIPS(paciente: any, conexion) {
        const dni = parseInt(paciente.documento, 10);
        if (dni) {
                const query = `SELECT TOP 1 *
            FROM [dbo].[Sys_Paciente] where [activo]=1 and [numeroDocumento] = '${dni}'`;
                try {
                        const result = await conexion.request().query(query);
                        if (result && result.recordset) {
                                return result.recordset[0];
                        } else {
                                return null;
                        }
                } catch (err) {
                        log(fakeRequest, 'microservices:integration:sipsYsumar', paciente, 'Existe paciente Sips', err, undefined);
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
                        log(fakeRequest, 'microservices:integration:sipsYsumar', paciente, 'Existe paciente Sumar', err, undefined);
                        return err;
                }
        }
}
export async function existeParentezco(pacienteSips: any, conexion) {
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
                log(fakeRequest, 'microservices:integration:sipsYsumar', pacienteSips, 'Existe paciente Parentezco', err, undefined);
                return err;
        }

}
export async function existePacientePUCO(paciente: any, conexion) {
        const dni = parseInt(paciente.documento, 10);
        if (dni) {
                const query = `
                SELECT TOP 1*
          FROM [Padron].[dbo].[Pd_PUCO] where DNI= '${dni}'`;
                try {
                        const result = await conexion.request().query(query);
                        if (result && result.recordset) {
                                return result.recordset[0];

                        } else {
                                return null;
                        }
                } catch (err) {
                        log(fakeRequest, 'microservices:integration:sipsYsumar', paciente, 'Existe paciente puco', err, undefined);
                        return err;
                }
        }


}
export async function insertarPacienteSIPS(paciente: any, conexion) {

        let organizacion: any = paciente.createdBy.organizacion ? await operaciones.getOrganizacion(paciente.createdBy.organizacion.id) : null;
        let idEfector: any = organizacion ? await getEfector(organizacion.codigo.cuie, conexion) : null;
        let apellido = paciente.apellido;
        let nombre = paciente.nombre;
        let numeroDocumento = paciente.documento ? paciente.documento : 0;
        let idSexo = (paciente.sexo === 'masculino' ? 3 : paciente.sexo === 'femenino' ? 2 : 1);
        let fechaNacimiento = paciente.fechaNacimiento ? paciente.fechaNacimiento : '19000101';
        let idEstado = (paciente.estado === 'validado' ? 3 : 2);
        let idPais = 0;
        if ((paciente.direccion && paciente.direccion[0].ubicacion && paciente.direccion[0].ubicacion.pais && paciente.direccion[0].ubicacion.pais) === 'Argentina') {
                idPais = 54;
        }
        let idProvincia: any = 0;
        if (paciente.direccion && paciente.direccion[0].ubicacion && paciente.direccion[0].ubicacion.provincia) {
                let prov: any = await operaciones.getProv(paciente.direccion[0].ubicacion.provincia.nombre);
                let codigoindec = prov ? prov[0].codINDEC : null;
                idProvincia = codigoindec ? await getProvincia(codigoindec, conexion) : 0;
        }
        let idNivelInstruccion = 0;
        let idSituacionLaboral = 0;
        let idProfesion = 0;
        let idOcupacion = 0;
        let idBarrio = 0;
        let idLocalidad = 0;
        let idDepartamento: any = 0;
        if (paciente.direccion && paciente.direccion[0].ubicacion && paciente.direccion[0].ubicacion.localidad && paciente.direccion[0].ubicacion.provincia) {
                let localidad: any = await operaciones.getLocalidad(paciente.direccion[0].ubicacion.localidad.nombre, paciente.direccion[0].ubicacion.provincia.id);
                let nombreDpto = localidad ? localidad[0].departamento : null;
                idDepartamento = nombreDpto ? await getDepartamento(nombreDpto, conexion) : 0;

        }
        let idProvinciaDomicilio = 0;
        let codigoPuco = paciente.financiador ? paciente.financiador[0].codigoFinanciador : null;
        let idObraSocial = codigoPuco ? await getObraSocial(codigoPuco, conexion) : 0;
        let idUsuario = 1486739;
        let fechaAlta = paciente.createdAt;
        let fechaDefuncion = paciente.fechaFallecimiento ? paciente.fechaFallecimiento : '1900-01-01 00:00:00.000';
        let fechaUltimaActualizacion = paciente.updatedAt;
        let idEstadoCivil = 0;
        let idEtnia = 0;
        let idPoblacion = 0;
        let idIdioma = 0;
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
    let queryInsert = 'INSERT INTO [dbo].[Sys_Paciente] ([idEfector],[apellido],[nombre],[numeroDocumento],[idSexo]' +
                ',[fechaNacimiento],[idEstado],[idPais],[idProvincia],[idNivelInstruccion],[idSituacionLaboral],[idProfesion]' +
                ',[idOcupacion],[idBarrio],[idLocalidad],[idDepartamento],[idProvinciaDomicilio],[idObraSocial],[idUsuario]' +
                ',[fechaAlta],[fechaDefuncion],[fechaUltimaActualizacion],[idEstadoCivil],[idEtnia],[idPoblacion],[idIdioma],[telefonoFijo],[telefonoCelular],[objectId]) ' +
                'VALUES  (' + idEfector + ',\'' + apellido + '\',\'' + nombre +
                '\',' + numeroDocumento + ',' + idSexo + ',\'' + fechaNacimiento + '\',' + idEstado + ',' + idPais +
                ',' + idProvincia + ',' + idNivelInstruccion + ',' + idSituacionLaboral + ',' + idProfesion +
                ',' + idOcupacion + ',' + idBarrio + ',' + idLocalidad + ',' + idDepartamento +
                ',' + idProvinciaDomicilio + ',' + idObraSocial + ',' + idUsuario +
                ',\'' + fechaAlta + '\',\'' + fechaDefuncion + '\',\'' + fechaUltimaActualizacion + '\',' + idEstadoCivil + ',' + idEtnia +
                ',' + idPoblacion + ',' + idIdioma + ',\'' + telefonoFijo + '\',\'' + telefonoCelular + '\',\'' + objectId + '\'\) ';
    try {
                let id;
                queryInsert += ' select SCOPE_IDENTITY() as id';
                const result = await new sql.Request(conexion).query(queryInsert);
                if (result && result.recordset) {
                        return result.recordset[0].id;
                }
        } catch (err) {
                log(fakeRequest, 'microservices:integration:sipsYsumar', paciente, 'Insertar paciente sips', err, undefined);
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
                if (paciente.relaciones.length > 0) {
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

        let id_categoria = tipoCategoria;
        let sexo = (paciente.sexo === 'masculino' ? 'M' : paciente.sexo === 'femenino' ? 'F' : 'I');
        let fecha_nacimiento_benef = moment(paciente.fechaNacimiento).format('YYYY-MM-DD');
        let provincia_nac = paciente.direccion[0].ubicacion.provincia ? paciente.direccion[0].ubicacion.provincia.nombre : 0;
        let localidad_nac: any = 0;
        let pais_nac = 0;
        if (paciente.direccion[0].ubicacion && paciente.direccion[0].ubicacion.pais && paciente.direccion[0].ubicacion.pais === 'Argentina') {
                pais_nac = (paciente.direccion[0].ubicacion.pais).toUpperCase();
        }
        let indigena = ' ';
        let id_tribu = 0;
        let id_lengua = 0;
        let organizacion: any = paciente.createdBy.organizacion ? await operaciones.getOrganizacion(paciente.createdBy.organizacion.id) : null;
        let cuie_ea: any = organizacion ? await getEfector(organizacion.codigo.cuie, conexion) : null;
        let cuie_ah = cuie_ea;

        let departamento = paciente.localidad ? paciente.localidad.departamento : null;
        if (paciente.direccion && paciente.direccion[0].ubicacion && paciente.direccion[0].ubicacion.localidad && paciente.direccion[0].ubicacion.provincia) {
                localidad_nac = await operaciones.getLocalidad(paciente.direccion[0].ubicacion.localidad.nombre, paciente.direccion[0].ubicacion.provincia.id);
                let nombreDpto = localidad_nac ? localidad_nac[0].departamento : null;
                departamento = nombreDpto ? getDepartamento(nombreDpto, conexion) : 0;

        }
        let fecha_inscripcion = paciente.createdAt;
        let fecha_carga = fecha_inscripcion;
        let usuario_carga = '1486739';
        let activo = 1;
        let queryInsert = 'INSERT INTO [dbo].[PN_beneficiarios] ([clave_beneficiario],[tipo_transaccion],[apellido_benef],[nombre_benef]' +
                ',[clase_documento_benef],[tipo_documento],[numero_doc],[id_categoria],[sexo],[fecha_nacimiento_benef]' +
                ',[provincia_nac],[localidad_nac],[pais_nac],[indigena],[id_tribu],[id_lengua]' +
                ',[tipo_doc_madre],[nro_doc_madre],[apellido_madre],[nombre_madre],[tipo_doc_padre],[nro_doc_padre],[apellido_padre], [nombre_padre]' +
                ',[cuie_ea],[cuie_ah],[departamento],[fecha_inscripcion]' +
                ',[fecha_carga], [usuario_carga],[activo]) ' +
                'VALUES (\'' + clave_beneficiario + '\',\'' + tipo_transaccion + '\',\'' + apellido_benef +
                '\',\'' + nombre_benef + '\',\'' + clase_documento_benef + '\',\'' + tipo_documento + '\',\'' + numero_doc +
                '\',' + id_categoria + ',\'' + sexo + '\',\'' + fecha_nacimiento_benef + '\',\'' + provincia_nac + '\',\'' + localidad_nac +
                '\',\'' + pais_nac + '\',\'' + indigena + '\',\'' + id_tribu + '\',\'' + id_lengua + '\',\'' + tipo_doc_madre + '\',\'' + nro_doc_madre + '\',\'' + apellido_madre + '\',\'' + nombre_madre + '\',\'' + tipo_doc_padre + '\',\'' + nro_doc_padre + '\',\'' + apellido_padre + '\',\'' + nombre_padre + '\',\'' + cuie_ea + '\',\'' + cuie_ah + '\',\'' + departamento + '\',\'' + fecha_inscripcion + '\',\'' + fecha_carga + '\',\'' + usuario_carga + '\',\'' + activo + '\'\) ';
    try {
            let id;
            queryInsert += ' select SCOPE_IDENTITY() as id';
            const result = await new sql.Request(conexion).query(queryInsert);
            if (result && result.recordset) {
                        id = result.recordset[0].id;
                }
            let queryUpdate = 'UPDATE  [dbo].[PN_beneficiarios] SET clave_beneficiario = ' + (2100000000000000 + parseInt(id)) + ' where id_beneficiarios = ' + id + '  ';
            const resultUpdate = await new sql.Request(conexion).query(queryUpdate);
            if (resultUpdate && resultUpdate.recordset) {
                    return resultUpdate.recordset[0].clave_beneficiario;
                }

        } catch (err) {
            log(fakeRequest, 'microservices:integration:sipsYsumar', paciente, 'Insertar paciente SUMAR', err, undefined);
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
            log(fakeRequest, 'microservices:integration:sipsYsumar', progenitor, 'Insertar paciente parentezco', err, undefined);
            return err;
        }
    }
}
export async function actualizarPacienteSIPS(paciente: any, pacienteExistente: any, conexion) {
    let idPaciente = pacienteExistente.idPaciente;
    let apellido = paciente.apellido;
    let nombre = paciente.nombre;
    let numeroDocumento = paciente.documento ? paciente.documento : 0;
    let idSexo = (paciente.sexo === 'masculino' ? 3 : paciente.sexo === 'femenino' ? 2 : 1);
    let fechaNacimiento = paciente.fechaNacimiento ? paciente.fechaNacimiento : '19000101';
    let idEstado = (paciente.estado === 'validado' ? 3 : 2);
    let idProvincia: any = 0;
    if (paciente.direccion && paciente.direccion[0].ubicacion && paciente.direccion[0].ubicacion.provincia) {
        const prov: any = await operaciones.getProv(paciente.direccion[0].ubicacion.provincia.nombre);
        let codigoindec = prov ? prov[0].codINDEC : null;
        idProvincia = codigoindec ? await getProvincia(codigoindec, conexion) : 0;
    }
    let fechaUltimaActualizacion = paciente.updatedAt;
    let telefono = paciente.contacto ? paciente.contacto.map(unContacto => {
        let numero = {
            telefonoCelular: unContacto.tipo === 'celular' ? unContacto.valor : 0,
            telefonoFijo: unContacto.tipo === 'fijo' ? unContacto.valor : 0
        };
        return numero;
    }) : null;
    let telefonoFijo = telefono[0].telefonoFijo;
    let telefonoCelular = telefono[0].telefonoCelular;
    let query = 'UPDATE [dbo].[Sys_Paciente] SET ' +
                '[apellido] =' + '\'' + apellido + '\'' +
                ',[nombre] = ' + '\'' + nombre + '\'' +
                ',[numeroDocumento] = ' + numeroDocumento +
                ',[idSexo] = ' + idSexo +
                ',[fechaNacimiento] = ' + '\'' + fechaNacimiento + '\'' +
                ',[idEstado] = ' + idEstado +
                ',[idProvincia] =' + idProvincia +
                ',[fechaUltimaActualizacion] =' + '\'' + fechaUltimaActualizacion + '\'' +
                ',[telefonoFijo] = ' + '\'' + telefonoFijo + '\'' +
                ',[telefonoCelular] =' + '\'' + telefonoCelular + '\'' +
                ' where [idPaciente] = ' + idPaciente + '  ';
    try {
        const result = await new sql.Request(conexion).query(query);
        if (result && result.recordset) {
            return result.recordset[0];
        }
    } catch (err) {
        log(fakeRequest, 'microservices:integration:sipsYsumar', paciente, 'Actualizar paciente sips', err, undefined);
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
        if (paciente.relaciones.length > 0) {
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

    let id_categoria = tipoCategoria;
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
        log(fakeRequest, 'microservices:integration:sipsYsumar', paciente, 'Actualizar paciente sumar', err, undefined);
        return err;
    }

}

