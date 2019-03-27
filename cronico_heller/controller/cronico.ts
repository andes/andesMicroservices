import * as ConfigPrivate from '../config.private';
import * as sql from 'mssql';
//import { log } from '@andes/log';
//import * as moment from 'moment';

export async function CronicoPaciente(documentopaciente) {
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
                /*en este punto ya se proceso el microservicio de pacientes_heller, por lo tanto este esta en tabla Pacientes */ 

                let HCpacienteExistente = await existeHCPaciente(documentopaciente, conexion);
                
                await transaction.begin();
                  /* Buscar la primera NroHC disponible */
                        let HCNew = await HCDisponible(conexion);
                        let NroHcNew;

                        if (HCpacienteExistente===null) 
                        {
                              /*Actualizar la tabla Pacientes_HistoriasClinicas como ocupada    */
                              await updateNroHC(HCNew, transaction);
                              console.log('actualice la hc ocupada');

                              /*Actualizar Nro Hc en la tabla Pacientes*/ 
                              await updatePacienteXHc( HCNew, documentopaciente, transaction);
                              console.log('actualice paciente nro hc');

                              NroHcNew=HCNew.HC_HHH;
                        }
                       else 
                        { 
                             // recuperar NroHC del HCpacienteExistente  
                             console.log('update tiene hc');
                             NroHcNew=HCpacienteExistente.HC_HHH;                             
                        }
                      
                        /*Actualizar tabla CronicosMedCab
                        Actualizar la paciente campos AbandonaProg,FeIngProg,ConsAnuales. Para algunos casos el campo HC_HHH.
                        */
                        let RegistroMedico = await existeRegistroMedico(documentopaciente, conexion);

                        if (RegistroMedico===null) 
                          {
                           /* insertar un registro en la talba CronicosMedCab*/
                           await InsertarRegistroMedico( NroHcNew, documentopaciente, transaction);
                           console.log('insertar cronico med cab');
                          }
                        else
                         {
                        // Update 
                        await updateRegistroMedico( NroHcNew,documentopaciente,transaction) ;
                         }
                         /*Update Pacientes*/ 
                         await updatePaciente(documentopaciente, transaction);

                await transaction.commit();
        } catch (ex) {
                let fakeRequest = {
                        user: {
                                usuario: 'msHeller',
                                app: 'integracion-heller',
                                organizacion: 'sss'
                        },
                        ip: ConfigPrivate.staticConfiguration.heller.ip,
                        connection: {
                                localAddress: ''
                        }
                };
               // log(fakeRequest, 'microservices:integration:heller', paciente.id, conexion, ex, null);
                throw ex;
        }
}

async function existeHCPaciente(documentopaciente: any, conexion) {
        const dni = documentopaciente;//parseInt(paciente.documento, 10);
        const query = `select
         Pacientes.HC_HHH,
         Pacientes.[Número de Documento] AS documento,
         Pacientes.[Tipo de Documento],
         Pacientes.[Fecha de Nacimiento],
         Pacientes.Sexo,
         Pacientes.nroreg,
         Pacientes.APELLIDOS,
         Pacientes.NOMBRES         
         from Pacientes where [Número de Documento] =  '${dni}' 
         and HC_HHH<>''` ;
        let fakeRequest = {
                user: {
                        usuario: 'msHeller',
                        app: 'integracion-heller',
                        organizacion: 'sss'
                },
                ip: ConfigPrivate.staticConfiguration.heller.ip,
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
             //   await log(fakeRequest, 'microservices:integration:heller', paciente.id, 'Error en buscar Nro HC', err, undefined);
                return err;
        }

}


async function HCDisponible(conexion) {
        
        const query = `SELECT top 1 *
        from Pacientes_HistoriasClinicas
        where Ocupada=0`;

        let fakeRequest = {
                user: {
                        usuario: 'msHeller',
                        app: 'integracion-heller',
                        organizacion: 'sss'
                },
                ip: ConfigPrivate.staticConfiguration.heller.ip,
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
              //  await log(fakeRequest, 'microservices:integration:heller', '', 'Error asignar Nro HC', err, undefined);
                return err;
        }

}

async function updateNroHC( RegistroHC: any, transaction) {
       
        let HCLibre = RegistroHC.HC_HHH;
        const query = 'UPDATE Pacientes_HistoriasClinicas SET' +
                ' [Ocupada] = ' + 1 +                
                ' where [HC_HHH] =  ' + HCLibre;
              //  console.log(query);
        return new sql.Request(transaction)
                .query(query).then().catch(err => {
                        let fakeRequest = {
                                user: {
                                        usuario: 'msHeller',
                                        app: 'integracion-heller',
                                        organizacion: 'sss'
                                },
                                ip: ConfigPrivate.staticConfiguration.heller.ip,
                                connection: {
                                        localAddress: ''
                                }
                        };
                        transaction.rollback(err2 => {
                //                return log(fakeRequest, 'microservices:integration:heller', '', 'update Paciente_historiaclinica', err2, undefined);
                        });
                        throw err;
                });
}

async function updatePacienteXHc( HCNew : any, documentopaciente : any, transaction) {
               
        let NroHC = HCNew.HC_HHH;
                const query = ' Update Pacientes' +
                ' SET HC_HHH = '+ NroHC +
                ' where [Número de Documento]= ' +documentopaciente;       
                console.log(query);

                return new sql.Request(transaction)
                .query(query).then().catch(err => {
                        let fakeRequest = {
                                user: {
                                        usuario: 'msHeller',
                                        app: 'integracion-heller',
                                        organizacion: 'sss'
                                },
                                ip: ConfigPrivate.staticConfiguration.heller.ip,
                                connection: {
                                        localAddress: ''
                                }
                        };
                        transaction.rollback(err2 => {
                //                return log(fakeRequest, 'microservices:integration:heller', '', 'update Paciente_historiaclinica', err2, undefined);
                        });
                        throw err;
                });
}

async function existeRegistroMedico(documentopaciente: any, conexion) {
       
        const query = `select * 
        from CronicosMedCab
        where DNI = `+ documentopaciente;
        /*let fakeRequest = {
                user: {
                        usuario: 'msHeller',
                        app: 'integracion-heller',
                        organizacion: 'sss'
                },
                ip: ConfigPrivate.staticConfiguration.heller.ip,
                connection: {
                        localAddress: ''
                }
        };*/
        try {
                const result = await conexion.request().query(query);
                if (result.recordset.length > 0) {
                        return result.recordset[0];
                } else {
                        return null;
                }
        } catch (err) {
             //   await log(fakeRequest, 'microservices:integration:heller', paciente.id, 'Error en buscar Nro HC', err, undefined);
                return err;
        }

}

async function InsertarRegistroMedico(NroHC:any,documentopaciente: any, conexion) {
      
        //let NroHC= HCNew.HC_HHH;
        const query =  "INSERT CronicosMedCab(HC_HHH,DNI,Profesional,codigo) "+ 
        "VALUES("+NroHC+","+documentopaciente+",'Profesional Andes'"+",1019656)";
        console.log(query);
        /*let fakeRequest = {
                user: {
                        usuario: 'msHeller',
                        app: 'integracion-heller',
                        organizacion: 'sss'
                },
                ip: ConfigPrivate.staticConfiguration.heller.ip,
                connection: {
                        localAddress: ''
                }
        };*/
        try {
                const result = await conexion.request().query(query);
                if (result.recordset.length > 0) {
                        return result.recordset[0];
                } else {
                        return null;
                }
        } catch (err) {
             //   await log(fakeRequest, 'microservices:integration:heller', paciente.id, 'Error en buscar Nro HC', err, undefined);
                return err;
        }

}

async function updatePaciente(documentopaciente : any, transaction) {
               
        const query = "Update Pacientes"  +
                " SET "+
                  "AbandonoProg='No',"+
                  "ConsAnuales =4,"+
                  "FeIngProg=CONVERT(char(10), GetDate(),126)"+
                " where [Número de Documento]= " +documentopaciente;       
                
                console.log(query);

                return new sql.Request(transaction)
                .query(query).then().catch(err => {
                        let fakeRequest = {
                                user: {
                                        usuario: 'msHeller',
                                        app: 'integracion-heller',
                                        organizacion: 'sss'
                                },
                                ip: ConfigPrivate.staticConfiguration.heller.ip,
                                connection: {
                                        localAddress: ''
                                }
                        };
                        transaction.rollback(err2 => {
                //                return log(fakeRequest, 'microservices:integration:heller', '', 'update Paciente_historiaclinica', err2, undefined);
                        });
                        throw err;
                });
}

async function updateRegistroMedico( NroHc: any,NroDocumento:any, transaction) {
       
        const query = "UPDATE CronicosMedCab SET" +
        " [HC_HHH] = "+ NroHc + ","+
	" [Profesional]='Profesional Andes'," +
	" [codigo]=1019656 "+
        " where [DNI]="+ NroDocumento; 
        console.log(query);
        return new sql.Request(transaction)
                .query(query).then().catch(err => {
                        let fakeRequest = {
                                user: {
                                        usuario: 'msHeller',
                                        app: 'integracion-heller',
                                        organizacion: 'sss'
                                },
                                ip: ConfigPrivate.staticConfiguration.heller.ip,
                                connection: {
                                        localAddress: ''
                                }
                        };
                        transaction.rollback(err2 => {
                //                return log(fakeRequest, 'microservices:integration:heller', '', 'update Paciente_historiaclinica', err2, undefined);
                        });
                        throw err;
                });
}