import * as ConfigPrivate from '../config.private';
import * as sql from 'mssql';
import { log } from '@andes/log';

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
                        postalCode: unaDireccion.codigoPostal ? unaDireccion.codigoPostal : null,
                        barrio: 'Sin Barrio',
                        localidad: unaDireccion.ubicacion.localidad ? unaDireccion.ubicacion.localidad : null,
                        provincia: unaDireccion.ubicacion.provincia ? unaDireccion.ubicacion.provincia : null,
                        pais: unaDireccion.ubicacion.pais ? unaDireccion.ubicacion.pais : null,
                };
                return direc;
        }) : null;
        const query = `INSERT INTO Pacientes
(HC_HHH,[Número de Documento],[Tipo de Documento],[Apellido y Nombre],Ecivil,Lnacimiento,
[Fecha de Nacimiento],[Fecha de Fallecimiento],Sexo,Domicilio,Barrio,Dependencia,Localidad,
Provincia,Nacionalidad,[Código Postal],[Teléfono],[Fecha Registro],[Apellido Madre],[Nombre Madre],
[Documento Madre],Obra_Social,Numero,Carga,repa,verificadoISSN,Observaciones,Usuario,cuenta,subcue,
ConsAnuales,AbandonoProg,FeIngProg,IngPor,CodBarrio,verificado,okbarrio,coddiag,Activo,
HC_Pasiva,APELLIDOS,NOMBRES,TelCel,id_OperadorCel) VALUES (@HC_HHH, @dni, @tipoDoc,@apeYnom,@eCivil,
@lNacimiento, @feNac,@feFal, @sexo, @dom,@barrio,@dependencia,
@loc, @prov,@nac,@cp, @tel, @feReg, @apeMadre,
@nomMadre, @dniMadre, @os, @num, @carga,
@repa, @verifIssn,@obs, @usuario, @cuenta,@subcue,
@consAnuales, @abandonoProg,@feIngProg, @ingPor, @codBarrio,
@verif,@okBarrio, @codDiag, @activo, @hc_pasiva,@apellido,
@nombre, @telCel, @id_operador)`;
        return new sql.Request(conexion)
                .input('HC_HHH', sql.Int, null)
                .input('dni', sql.Int, parseInt(pacienteHeller.documento, 10))
                .input('tipoDoc', sql.NVarChar(4), pacienteHeller.documento ? 'DNI' : 'SN')
                .input('apeYnom', sql.NVarChar(72), pacienteHeller.apellido + ', ' + pacienteHeller.nombre)
                .input('eCivil', sql.NVarChar(25), pacienteHeller.estadoCivil ? pacienteHeller.estadoCivil : null)
                .input('lNacimiento', sql.NVarChar(25), pacienteHeller.nacionalidad ? pacienteHeller.nacionalidad : null)
                .input('feNac', sql.DateTime2, pacienteHeller.fechaNacimiento ? pacienteHeller.fechaNacimiento : null)
                .input('feFal', sql.DateTime2, pacienteHeller.fechaFallecimiento ? pacienteHeller.fechaFallecimiento : null)
                .input('sexo', sql.NVarChar(1), Sexo)
                .input('dom', sql.NVarChar(100), direcciones[0].barrio)
                .input('barrio', sql.NVarChar(50), direcciones[0].barrio)
                .input('dependencia', sql.NVarChar(50), null)
                .input('loc', sql.NVarChar(30), direcciones.localidad)
                .input('prov', sql.NVarChar(20), direcciones.provincia)
                .input('nac', sql.NVarChar(4), direcciones.pais)
                .input('cp', sql.NVarChar(6), direcciones.postalCode)
                .input('tel', sql.NVarChar(20), telefono)
                .input('feReg', sql.DateTime2, new Date())
                .input('apeMadre', sql.NVarChar(35), null)
                .input('nomMadre', sql.NVarChar(25), null)
                .input('dniMadre', sql.Int, null)
                .input('os', sql.NVarChar(35), pacienteHeller.financiador ? pacienteHeller.financiador : 'a -VERIFICAR')
                .input('num', sql.Float, null)
                .input('carga', sql.Int, null)
                .input('repa', sql.NVarChar(8), null)
                .input('verifIssn', sql.Bit, 0)
                .input('obs', sql.NVarChar(300), 'DATOS INGRESADOS DESDE ANDES, MAS INFO VER ANDES.')
                .input('usuario', sql.Char(20), 'Aandes')
                .input('cuenta', sql.NVarChar(3), '999')
                .input('subcue', sql.NVarChar(3), '999')
                .input('consAnuales', sql.Int, null)
                .input('abandonoProg', sql.Char(2), null)
                .input('feIngProg', sql.DateTime2, null)
                .input('ingPor', sql.Char(1), null)
                .input('codBarrio', sql.Int, null)
                .input('verif', sql.Bit, 0)
                .input('okBarrio', sql.Int, null)
                .input('codDiag', sql.NVarChar(50), null)
                .input('activo', sql.Bit, 1)
                .input('hc_pasiva', sql.Bit, 0)
                .input('apellido', sql.NVarChar(50), pacienteHeller.apellido)
                .input('nombre', sql.NVarChar(50), pacienteHeller.nombre)
                .input('telCel', sql.NVarChar(10), telefono)
                .input('id_operador', sql.Int, null)
                .query(query).then(result => {
                        return result.recordset[0];
                }).catch(err => {
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
                        conexion.rollback(err2 => {
                                return log(fakeRequest, 'microservices:integration:heller', pacienteHeller, 'rollback', err2, undefined);
                        });
                        throw err;
                });
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

        const result = await conexion.request()
                .input('dni', sql.Int, dni)
                .query(query)
                .catch(err => {
                        throw err;
                });
        if (result.recordset.length > 0) {
                return result.recordset[0];
        } else {
                return null;
        }


}

export async function updatePaciente(paciente: any, pacienteExistente: any, transaction) {
        // const fechaActualizacion =moment().format('YYYY-MM-DD hh:mm'); // No tiene la bd de heller
        const tipoDocumento = pacienteExistente['Tipo de Documento'];
        const nroDocumento = pacienteExistente['documento'];
        const apellido = paciente.apellido;
        const nombre = paciente.nombre;
        const estadoCivil = (paciente.estadoCivil ? paciente.estadoCivil : null);
        const fechaNacimiento = (paciente.fechaNacimiento ? paciente.fechaNacimiento : null);
        const sexo = paciente.sexo;
        const query = 'UPDATE Pacientes SET' +
                ', [Número de Documento] = ' + '\'' + nroDocumento + '\'' +
                ', [Tipo de Documento] = ' + '\'' + tipoDocumento + '\'' +
                ', APELLIDO =  ' + '\'' + apellido + '\'' +
                ', NOMBRES =  ' + '\'' + nombre + '\'' +
                ', [Apellido y Nombre]= ' + '\'' + apellido + ',' + nombre +
                ',Ecivil = ' + '\'' + estadoCivil + '\'' +
                ', Sexo = ' + '\'' + sexo + '\'' +
                ',[Fecha de Nacimiento] = ' + '\'' + fechaNacimiento + '\'';
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
                                return log(fakeRequest, 'mpi:paciente:save', paciente, 'update', err2, undefined);
                        });
                        throw err;
                });
}

