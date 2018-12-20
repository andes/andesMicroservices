import * as ConfigPrivate from '../config.private';
import * as sql from 'mssql';
import { log } from '@andes/log';

import * as moment from 'moment';
export async function conexionPaciente(paciente) {
        let conexion;
        const connectionString = {
                user: ConfigPrivate.staticConfiguration.heller.user,
                password: ConfigPrivate.staticConfiguration.heller.password,
                server: ConfigPrivate.staticConfiguration.heller.ip,
                database: ConfigPrivate.staticConfiguration.heller.database,
                options: {
                        tdsVersion: '7_1'
                }
        };
        try {
                conexion = await new sql.ConnectionPool(connectionString).connect();
                const transaction = await new sql.Transaction(conexion);
                let pacienteExistente = await existePaciente(paciente, conexion);
                if (!pacienteExistente) {
                        transaction.begin(async err => {
                                await insertPaciente(paciente, transaction);
                                transaction.commit(err2 => {
                                        if (!err2) {
                                                return;
                                        }
                                });
                        });
                } else {
                        transaction.begin(async err => {
                                await updatePaciente(paciente, pacienteExistente, transaction);
                                transaction.commit(err2 => {
                                        if (!err2) {
                                                return;
                                        }
                                });
                        });
                }
        } catch (ex) {
                let fakeRequest = {
                        user: {
                                usuario: 'msHeller',
                                app: 'integracion-heller',
                                organizacion: 'sss'
                        },
                        ip: 'localhost',
                        connection: {
                                localAddress: ''
                        }
                };
                log(fakeRequest, 'microservices:integration:heller', undefined, conexion, ex, null);
                throw ex;
        }
}

export async function insertPaciente(pacienteHeller: any, conexion) {
        let Sexo;
        switch (pacienteHeller.sexo) {
                case 'femenino':
                        Sexo = 'F';
                        break;
                case 'masculino':
                        Sexo = 'M';
                        break;
                case 'otro':
                        Sexo = 'I';
                        break;
        }
        let telefono = pacienteHeller.contacto ? pacienteHeller.contacto.map(unContacto => {
                let numero;
                if (unContacto.tipo === 'celular' || unContacto.tipo === 'fijo') {
                        numero = unContacto.valor;
                }
                return numero;
        }) : null;
        let direcciones = pacienteHeller.direccion ? pacienteHeller.direccion.map(unaDireccion => {
                let direc = {
                        valor: unaDireccion.valor ? unaDireccion.valor : null,
                        localidad: unaDireccion.ubicacion.localidad ? unaDireccion.ubicacion.localidad : null,
                        provincia: unaDireccion.ubicacion.provincia ? unaDireccion.ubicacion.provincia : null,
                        pais: unaDireccion.ubicacion.pais ? unaDireccion.ubicacion.pais : null,
                };
                return direc;
        }) : null;
        let dni = parseInt(pacienteHeller.documento, 10);
        let tipoDoc = pacienteHeller.documento ? 'DNI' : 'SN';
        let apeYnom = pacienteHeller.apellido + ', ' + pacienteHeller.nombre;
        let feNac = pacienteHeller.fechaNacimiento ? moment(pacienteHeller.fechaNacimiento).format('YYYY/MM/DD') : null;
        let sexo = Sexo;
        let apellido = pacienteHeller.apellido;
        let nombre = pacienteHeller.nombre;
        let eCivil = pacienteHeller.estadoCivil ? pacienteHeller.estadoCivil : null;
        let dom = direcciones[0].valor;
        let loc = direcciones[0].localidad;
        let prov = direcciones[0].provincia;
        let nac = (direcciones[0].pais).substr(0, 3);
        let tel = telefono;
        let queryInsert = 'INSERT INTO Pacientes' +
                '([Número de Documento],[Tipo de Documento],[Apellido y Nombre],[Ecivil],' +
                '[Fecha de Nacimiento],[Sexo],[Domicilio],[Localidad],' +
                '[Provincia],[Nacionalidad],[Teléfono],[APELLIDOS],[NOMBRES]) ' +
                'VALUES  (' + dni + ',\'' + tipoDoc + '\',\'' + apeYnom +
                '\',\'' + eCivil + '\',\'' + feNac + '\',\'' + sexo + '\',\'' + dom + '\',\'' + loc +
                '\',\'' + prov + '\',\'' + nac + '\',\'' + tel +
                '\',\'' + apellido + '\',\'' + nombre + '\'\) ';
        let fakeRequest = {
                user: {
                        usuario: 'msHeller',
                        app: 'integracion-heller',
                        organizacion: 'sss'
                },
                ip: 'localhost',
                connection: {
                        localAddress: ''
                }
        };
        try {
                const result = await new sql.Request(conexion).query(queryInsert);
                if (result && result.recordset) {
                        return result.recordset[0];
                }
        } catch (err) {
                await log(fakeRequest, 'microservices:integration:heller', pacienteHeller, 'Insert patient', err, undefined);
                return err;
        }

}
export async function existePaciente(paciente: any, conexion) {
        const dni = parseInt(paciente.documento, 10);
        const query = `select
         Pacientes.HC_HHH,
         Pacientes.[Número de Documento] AS documento,
         Pacientes.[Tipo de Documento],
         Pacientes.[Apellido y Nombre],
         Pacientes.Ecivil,
         Pacientes.Lnacimiento,
         Pacientes.[Fecha de Nacimiento],
         Pacientes.[Fecha de Fallecimiento],
         Pacientes.Sexo,
         Pacientes.Domicilio,
         Pacientes.Barrio,
         Pacientes.Dependencia,
         Pacientes.Localidad,
         Pacientes.Provincia,
         Pacientes.Nacionalidad,
         Pacientes.[Código Postal],
         Pacientes.[Teléfono],
         Pacientes.[Fecha Registro],
         Pacientes.[Apellido Madre],
         Pacientes.[Nombre Madre],
         Pacientes.[Documento Madre],
         Pacientes.Obra_Social,
         Pacientes.Numero,
         Pacientes.Carga,
         Pacientes.repa,
         Pacientes.verificadoISSN,
         Pacientes.Observaciones,
         Pacientes.Usuario,
         Pacientes.cuenta,
         Pacientes.subcue,
         Pacientes.ConsAnuales,
         Pacientes.AbandonoProg,
         Pacientes.FeIngProg,
         Pacientes.IngPor,
         Pacientes.CodBarrio,
         Pacientes.verificado,
         Pacientes.nroreg,
         Pacientes.okbarrio,
         Pacientes.coddiag,
         Pacientes.Activo,
         Pacientes.HC_Pasiva,
         Pacientes.APELLIDOS,
         Pacientes.NOMBRES,
         Pacientes.TelCel,
         Pacientes.id_OperadorCel
         from Pacientes where [Número de Documento] =  '${dni}'`;
        let fakeRequest = {
                user: {
                        usuario: 'msHeller',
                        app: 'integracion-heller',
                        organizacion: 'sss'
                },
                ip: 'localhost',
                connection: {
                        localAddress: ''
                }
        };
        try {
                const result = await conexion.request().query(query);
                if (result.recordset.length > 0) {
                        return result.recordset[0];
                } else {
                        return null;
                }
        } catch (err) {
                await log(fakeRequest, 'microservices:integration:heller', paciente, 'Existe patient', err, undefined);
                return err;
        }

}

export async function updatePaciente(pacienteActual: any, pacienteExistente: any, transaction) {
        // const fechaActualizacion =moment().format('YYYY-MM-DD hh:mm'); // No tiene la bd de heller
        let Sexo;
        switch (pacienteActual.sexo) {
                case 'femenino':
                        Sexo = 'F';
                        break;
                case 'masculino':
                        Sexo = 'M';
                        break;
                case 'otro':
                        Sexo = 'I';
                        break;
        }
        let telefono = pacienteActual.contacto ? pacienteActual.contacto.map(unContacto => {
                let numero;
                if (unContacto.tipo === 'celular' || unContacto.tipo === 'fijo') {
                        numero = unContacto.valor;
                }
                return numero;
        }) : null;
        let direcciones = pacienteActual.direccion ? pacienteActual.direccion.map(unaDireccion => {
                let direc = {
                        valor: unaDireccion.valor ? unaDireccion.valor : null,
                        localidad: unaDireccion.ubicacion.localidad ? unaDireccion.ubicacion.localidad : null,
                        provincia: unaDireccion.ubicacion.provincia ? unaDireccion.ubicacion.provincia : null,
                        pais: unaDireccion.ubicacion.pais ? unaDireccion.ubicacion.pais : null,
                };
                return direc;
        }) : null;
        let dni = parseInt(pacienteActual.documento, 10);
        let dniExistente = parseInt(pacienteExistente.documento, 10);
        let tipoDoc = pacienteActual.documento ? 'DNI' : 'SN';
        let apeYnom = pacienteActual.apellido + ', ' + pacienteActual.nombre;
        let feNac = pacienteActual.fechaNacimiento ? moment(pacienteActual.fechaNacimiento).format('YYYY/MM/DD') : null;
        let sexo = Sexo;
        let apellido = pacienteActual.apellido;
        let nombre = pacienteActual.nombre;
        let eCivil = pacienteActual.estadoCivil ? pacienteActual.estadoCivil : null;
        let dom = direcciones[0].valor;
        let loc = direcciones[0].localidad;
        let prov = direcciones[0].provincia;
        let nac = (direcciones[0].pais).substr(0, 3);
        let tel = telefono;
        const query = 'UPDATE Pacientes SET' +
                ' [Número de Documento] = ' + dni +
                ', [Tipo de Documento] = ' + '\'' + tipoDoc + '\'' +
                ', APELLIDO =  ' + '\'' + apellido + '\'' +
                ', NOMBRES =  ' + '\'' + nombre + '\'' +
                ', [Apellido y Nombre]= ' + '\'' + apeYnom +
                ',Ecivil = ' + '\'' + eCivil + '\'' +
                ', Sexo = ' + '\'' + sexo + '\'' +
                ', [Fecha de Nacimiento]= ' + '\'' + feNac + '\'' +
                ', [Domicilio]= ' + '\'' + dom + '\'' +
                ', [Localidad]= ' + '\'' + loc + '\'' +
                ', [Provincia]= ' + '\'' + prov + '\'' +
                ',[Nacionalidad]= ' + '\'' + nac + '\'' +
                ',[Teléfono]= ' + '\'' + tel + '\'' +
                ' where [Número de Documento] =  ' + dniExistente;
        return new sql.Request(transaction)
                .query(query).then().catch(err => {
                        let fakeRequest = {
                                user: {
                                        usuario: 'msHeller',
                                        app: 'integracion-heller',
                                        organizacion: 'sss'
                                },
                                ip: 'localhost',
                                connection: {
                                        localAddress: ''
                                }
                        };
                        transaction.rollback(err2 => {
                                return log(fakeRequest, 'microservices:integration:heller', pacienteActual, 'update paciente', err2, undefined);
                        });
                        throw err;
                });
}

