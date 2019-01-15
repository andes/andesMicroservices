import * as configPrivate from '../config.private';
import { log } from '@andes/log';
import * as moment from 'moment';

import * as sql from 'mssql';
export async function conexionPaciente(paciente) {
        let conexion;
        const connectionString = {
                user: configPrivate.conSql.auth.user,
                password: configPrivate.conSql.auth.password,
                server: configPrivate.conSql.serverSql.server,
                database: configPrivate.conSql.serverSql.database,
                connectionTimeout: 10000,
                requestTimeout: 45000
        };

        try {
                conexion = await new sql.ConnectionPool(connectionString).connect();
                const transaction = await new sql.Transaction(conexion);
                let pacienteExistenteSIPS = await existePacienteSIPS(paciente, conexion);
                let pacienteExistenteSUMAR = await existePacienteSUMAR(paciente, conexion);
                await transaction.begin();
                if (!pacienteExistenteSIPS) {
                        await insertarPacienteSIPS(paciente, transaction);
                }
                else {
                        //ActualizaSIPS
                }
                if (!pacienteExistenteSUMAR) {
                        await insertarPacienteSUMAR(paciente, transaction);
                } else {
                        //ActualizaSUMAR
                }
                await transaction.commit();
        } catch (ex) {
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
                log(fakeRequest, 'microservices:integration:sipsYsumar', undefined, conexion, ex, null);
                throw ex;
        }
}

async function getEfector(codigoCuie, conexion) {
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
async function getProvincia(codIndec, conexion) {
        if (codIndec) {
                const query = `SELECT [idProvincia]
            FROM [dbo].[Sys_Provincia] where codigoINDEC = ${codIndec}`;

                const result = await conexion.request().query(query);
                if (result && result.recordset) {
                        return result.recordset[0].idProvincia;
                }

        }

}
async function getObraSocial(codigoPuco, conexion) {
        if (codigoPuco) {
                const query = `SELECT [idObraSocial],[nombre]
                FROM [dbo].[Sys_ObraSocial] where cod_PUCO ='${codigoPuco}'`;
                const result = await conexion.request().query(query);
                if (result && result.recordset) {
                        return result.recordset[0].idObraSocial;
                }
        }

}
async function getDepartamento(nombreDpto, conexion) {
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
async function existePacienteSIPS(paciente: any, conexion) {
        const dni = parseInt(paciente.documento, 10);
        const query = `SELECT [idPaciente]
      ,[idEfector]
      ,[apellido]
      ,[nombre]
      ,[numeroDocumento]
      ,[idSexo]
      ,[fechaNacimiento]
      ,[idEstado]
      ,[idMotivoNI]
      ,[idPais]
      ,[idProvincia]
      ,[idNivelInstruccion]
      ,[idSituacionLaboral]
      ,[idProfesion]
      ,[idOcupacion]
      ,[calle]
      ,[numero]
      ,[piso]
      ,[departamento]
      ,[manzana]
      ,[idBarrio]
      ,[idLocalidad]
      ,[idDepartamento]
      ,[idProvinciaDomicilio]
      ,[referencia]
      ,[informacionContacto]
      ,[cronico]
      ,[idObraSocial]
      ,[idUsuario]
      ,[fechaAlta]
      ,[fechaDefuncion]
      ,[fechaUltimaActualizacion]
      ,[idEstadoCivil]
      ,[idEtnia]
      ,[idPoblacion]
      ,[idIdioma]
      ,[otroBarrio]
      ,[camino]
      ,[campo]
      ,[esUrbano]
      ,[lote]
      ,[parcela]
      ,[edificio]
      ,[activo]
      ,[fechaAltaObraSocial]
      ,[numeroAfiliado]
      ,[numeroExtranjero]
      ,[telefonoFijo]
      ,[telefonoCelular]
      ,[email]
      ,[latitud]
      ,[longitud]
      ,[objectId]
  FROM [dbo].[Sys_Paciente] where [numeroDocumento] = '${dni}'`;
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
        try {
                const result = await conexion.request().query(query);
                if (result && result.recordset) {
                        return result.recordset[0];
                } else {
                        return null;
                }
        } catch (err) {
                await log(fakeRequest, 'microservices:integration:sipsYsumar', paciente, 'Existe paciente Sips', err, undefined);
                return err;
        }

}
async function existePacienteSUMAR(paciente: any, conexion) {
        const dni = parseInt(paciente.documento, 10);
        const query = `SELECT [id_beneficiarios]
        ,[estado_envio]
        ,[clave_beneficiario]
        ,[tipo_transaccion]
        ,[apellido_benef]
        ,[nombre_benef]
        ,[clase_documento_benef]
        ,[tipo_documento]
        ,[numero_doc]
        ,[id_categoria]
        ,[sexo]
        ,[fecha_nacimiento_benef]
        ,[provincia_nac]
        ,[localidad_nac]
        ,[pais_nac]
        ,[indigena]
        ,[id_tribu]
        ,[id_lengua]
        ,[alfabeta]
        ,[estudios]
        ,[anio_mayor_nivel]
        ,[tipo_doc_madre]
        ,[nro_doc_madre]
        ,[apellido_madre]
        ,[nombre_madre]
        ,[alfabeta_madre]
        ,[estudios_madre]
        ,[anio_mayor_nivel_madre]
        ,[tipo_doc_padre]
        ,[nro_doc_padre]
        ,[apellido_padre]
        ,[nombre_padre]
        ,[alfabeta_padre]
        ,[estudios_padre]
        ,[anio_mayor_nivel_padre]
        ,[tipo_doc_tutor]
        ,[nro_doc_tutor]
        ,[apellido_tutor]
        ,[nombre_tutor]
        ,[alfabeta_tutor]
        ,[estudios_tutor]
        ,[anio_mayor_nivel_tutor]
        ,[fecha_diagnostico_embarazo]
        ,[semanas_embarazo]
        ,[fecha_probable_parto]
        ,[fecha_efectiva_parto]
        ,[cuie_ea]
        ,[cuie_ah]
        ,[menor_convive_con_adulto]
        ,[calle]
        ,[numero_calle]
        ,[piso]
        ,[dpto]
        ,[manzana]
        ,[entre_calle_1]
        ,[entre_calle_2]
        ,[telefono]
        ,[departamento]
        ,[localidad]
        ,[municipio]
        ,[barrio]
        ,[cod_pos]
        ,[observaciones]
        ,[fecha_inscripcion]
        ,[fecha_carga]
        ,[usuario_carga]
        ,[activo]
        ,[fum]
        ,[tipo_ficha]
        ,[responsable]
        ,[discv]
        ,[disca]
        ,[discmo]
        ,[discme]
        ,[otradisc]
        ,[rcv]
    FROM [dbo].[PN_beneficiarios] where [numero_doc] = '${dni}'`;
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
        try {
                const result = await conexion.request().query(query);
                if (result && result.recordset) {
                        return result.recordset[0];

                } else {
                        return null;
                }
        } catch (err) {
                await log(fakeRequest, 'microservices:integration:sipsYsumar', paciente, 'Existe paciente Sumar', err, undefined);
                return err;
        }

}
async function insertarPacienteSIPS(paciente: any, conexion) {
        let codigoCuie = paciente.efectorCodigo ? paciente.efectorCodigo.cuie : null;
        let idEfector: any = await getEfector(codigoCuie, conexion);
        let apellido = paciente.apellido;
        let nombre = paciente.nombre;
        let numeroDocumento = paciente.documento ? paciente.documento : 0;
        let idSexo = (paciente.sexo === 'masculino' ? 3 : paciente.sexo === 'femenino' ? 2 : 1);
        let fechaNacimiento = paciente.fechaNacimiento ? paciente.fechaNacimiento : '19000101';
        let idEstado = (paciente.estado === 'validado' ? 3 : 2);
        let idPais = 0;
        if (paciente.direccion[0].ubicacion && paciente.direccion[0].ubicacion.pais && paciente.direccion[0].ubicacion.pais === 'Argentina') {
                idPais = 54;
        }
        let codigoindec = paciente.provincia ? paciente.provincia.codINDEC : null;
        let idProvincia = codigoindec ? await getProvincia(codigoindec, conexion) : 0;
        let idNivelInstruccion = 0;
        let idSituacionLaboral = 0;
        let idProfesion = 0;
        let idOcupacion = 0;
        let idBarrio = 0;
        let idLocalidad = 0;
        let nombreDpto = paciente.localidad ? paciente.localidad.departamento : null;
        let idDepartamento = nombreDpto ? await getDepartamento(nombreDpto, conexion) : 0;
        let idProvinciaDomicilio = 0;
        let codigoPuco = paciente.financiador ? paciente.financiador[0].codigoFinanciador : null;
        let idObraSocial = codigoPuco ? await getObraSocial(codigoPuco, conexion) : 0;
        let idUsuario = 1486739;
        let fechaAlta = paciente.fechaCreacion;
        let fechaDefuncion = paciente.fechaMuerte ? paciente.fechaMuerte : '1900-01-01 00:00:00.000';
        let fechaUltimaActualizacion = paciente.fechaActualizacion;
        let idEstadoCivil = 0;
        let idEtnia = 0;
        let idPoblacion = 0;
        let idIdioma = 0;
        let telefono = paciente.contacto ? paciente.contacto.map(unContacto => {
                let numero = {
                        telefonoCelular: unContacto.tipo === 'celular' ? unContacto.valor : 0,
                        telefonoFijo: unContacto.tipo === 'fijo' ? unContacto.valor : 0
                }
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
        try {
                let id;
                queryInsert += ' select SCOPE_IDENTITY() as id';
                const result = await new sql.Request(conexion).query(queryInsert);
                if (result && result.recordset) {
                        id = result.recordset[0].id;
                }
                if ((paciente.relaciones).length > 0) {
                        let tipoParentesco = paciente.docTutor.relacion.nombre;
                        let idAntecedente = 0;
                        let queryParentezco = 'INSERT INTO [dbo].[Sys_Parentesco] ([apellido], [nombre],[numeroDocumento]' +
                                ',[fechaNacimiento],[idPais],[idProvincia],[idNivelInstruccion],[idSituacionLaboral],[idProfesion]' +
                                ',[idPaciente],[tipoParentesco],[idUsuario]' +
                                ',[fechaModificacion],[idAntecedente]) ' +
                                'VALUES  (' + apellido + '\',\'' + nombre + ',' +
                                '\',' + numeroDocumento + ',\'' + fechaNacimiento + ',' + idPais +
                                ',' + idProvincia + ',' + idNivelInstruccion + ',' + idSituacionLaboral + ',' + idProfesion +
                                ',' + id + ',' + tipoParentesco + ',' + idUsuario +
                                ',\'' + fechaUltimaActualizacion + '\',' + idAntecedente + '\'\) ';

                        const resultParentezco = await new sql.Request(conexion).query(queryParentezco);

                }

        } catch (err) {
                await log(fakeRequest, 'microservices:integration:sipsYsumar', paciente, 'Insertar paciente sips', err, undefined);
                return err;
        }

}
async function insertarPacienteSUMAR(paciente: any, conexion) {
        let clave_beneficiario = 2100000000000000;
        let tipo_transaccion = 'A'; // A = ALTA
        let apellido_benef = paciente.apellido;
        let nombre_benef = paciente.nombre;
        let tipo_documento = paciente.doc ? 'DNI' : 'SN';
        let numero_doc = null;
        let clase_documento_benef = null;
        if (tipo_documento === 'DNI') {
                numero_doc = paciente.documento;
                clase_documento_benef = 'P'; // Propio
        } else {
                if ((paciente.relaciones).length > 0) {
                        numero_doc = paciente.docTutor.documento; //  Le pone el documento del tutor porque no tiene documento propio.
                        clase_documento_benef = 'A'; // Ajeno
                }

        }
        let tipoCategoria = 0;
        let edad = moment().diff(paciente.fechaNacimiento, 'years');
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
        let provincia_nac = paciente.provincia ? paciente.provincia.nombre : 0;
        let localidad_nac = paciente.localidad ? paciente.localidad.nombre : 0;
        let pais_nac = 0;
        if (paciente.direccion[0].ubicacion && paciente.direccion[0].ubicacion.pais && paciente.direccion[0].ubicacion.pais === 'Argentina') {
                pais_nac = (paciente.direccion[0].ubicacion.pais).toUpperCase();
        }
        let indigena = ' ';
        let id_tribu = 0;
        let id_lengua = 0;
        let cuie_ea = paciente.efectorCodigo ? paciente.efectorCodigo.cuie : null;
        let cuie_ah = cuie_ea;
        let departamento = paciente.localidad ? paciente.localidad.departamento : null;
        let fecha_inscripcion = paciente.fechaCreacion;
        let fecha_carga = fecha_inscripcion;
        let usuario_carga = '1486739';
        let activo = 1;
        let queryInsert = ' INSERT INTO [dbo].[PN_beneficiarios]' +
                '([clave_beneficiario],[tipo_transaccion],[apellido_benef],[nombre_benef]' +
                ',[clase_documento_benef],[tipo_documento],[numero_doc],[id_categoria],[sexo],[fecha_nacimiento_benef]' +
                ',[provincia_nac],[localidad_nac],[pais_nac],[indigena],[id_tribu],[id_lengua],[cuie_ea],[cuie_ah],[departamento],[fecha_inscripcion]' +
                ',[fecha_carga], [usuario_carga],[activo]) ' +
                'VALUES (\'' + clave_beneficiario + '\',\'' + tipo_transaccion + '\',\'' + apellido_benef +
                '\',\'' + nombre_benef + '\',\'' + clase_documento_benef + '\',\'' + tipo_documento + '\',\'' + numero_doc +
                '\',' + id_categoria + ',\'' + sexo + '\',\'' + fecha_nacimiento_benef + '\',\'' + provincia_nac + '\',\'' + localidad_nac +
                '\',\'' + pais_nac + '\',\'' + indigena + '\',\'' + id_tribu + '\',\'' + id_lengua + '\',\'' + cuie_ea + '\',\'' + cuie_ah + '\',\'' + departamento + '\',\'' + fecha_inscripcion + '\',\'' + fecha_carga + '\',\'' + usuario_carga + '\',\'' + activo + '\'\) ';
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
                await log(fakeRequest, 'microservices:integration:sipsYsumar', paciente, 'Insertar paciente SUMAR', err, undefined);
                return err;
        }

}