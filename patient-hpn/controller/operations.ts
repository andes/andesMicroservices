
import * as sql from 'mssql';
import { staticConfiguration } from '../config.private';
import * as Fhir from '@andes/fhir';
import { log } from '@andes/log';


export async function integrar(paciente) {
    const connection = {
        user: staticConfiguration.hpn.user,
        password: staticConfiguration.hpn.password,
        server: staticConfiguration.hpn.ip,
        database: staticConfiguration.hpn.database,
        port: staticConfiguration.hpn.port,
        requestTimeout: 30000
    };
    try {
        let pool = await new sql.ConnectionPool(connection).connect();
        const transaction = await new sql.Transaction(pool);
        let pac = Fhir.Patient.decode(paciente);
        let tipoDocumento = 1;
        transaction.begin(async err => {
            let rollback = false;
            let pacienteExistente = await getDatosPaciente(tipoDocumento, pac, transaction);
            await savePaciente(pac, pacienteExistente, transaction);
            transaction.commit(err2 => {
                if (!err2) {
                    console.log('transaction commited');
                } else {
                    console.log('Palooooo de la transaction');
                }
            });
        });

    } catch (err) {
        let fakeRequest = {
            user: {
                usuario: 'msPacienteHPN',
                app: 'patient-hpn',
                organizacion: 'Microservicio generico'
            },
            ip: 'localhost',
            connection: {
                localAddress: ''
            }
        };
        log(fakeRequest, 'mpi:paciente:operations', undefined, 'connection', err, null);
        throw err;
    }
}

export async function savePaciente(paciente: any, pacienteExistente: any, transaction) {

    let conDni = true;
    if (!paciente.documento) {
        conDni = false;
        paciente.documento = await createPacienteSinDocumento(transaction);
    }
    const fechaCreacion = new Date();
    const fechaUltimoAcceso = fechaCreacion;
    const fechaActualizacion = fechaCreacion;
    const hcTipo = conDni ? 1 : 3; // Si no tiene DNI el hcTipo es SN
    const hcNumero = 'PDR' + paciente.documento;
    const tipoDocumento = conDni ? 'DNI' : 'SN';
    const nroDocumento = paciente.documento;
    const apellido = paciente.apellido;
    const nombre = paciente.nombre;
    const estadoCivil = (paciente.estadoCivil ? paciente.estadoCivil : null);
    const fechaNacimiento = (paciente.fechaNacimiento ? paciente.fechaNacimiento : null);
    const sexo = paciente.sexo;
    const andesId = paciente._id;

    const query = 'INSERT INTO dbo.Historias_Clinicas ' +
        '(HC_Fecha_de_creacion ' +
        ',HC_Fecha_de_ultimo_acceso ' +
        ',HC_Fecha_Actualizacion ' +
        ',HC_Tipo ' +
        ',HC_Numero ' +
        ',HC_Tipo_de_documento ' +
        ',HC_Documento ' +
        ',HC_Apellido ' +
        ',HC_Nombre ' +
        ',HC_Estado_Civil ' +
        ',HC_Sexo ' +
        ',HC_Nacimiento_Fecha ' +
        ',andesId) ' +
        'VALUES (' +
        '@fechaCreacion, ' +
        '@fechaUltimoAcceso, ' +
        '@fechaActualizacion, ' +
        '@hcTipo, ' +
        '@hcNumero, ' +
        '@tipoDocumento, ' +
        '@nroDocumento,' +
        '@apellido,' +
        '@nombre,' +
        '@estadoCivil, ' +
        '@sexo, ' +
        '@fechaNacimiento, ' +
        '@andesId) ' +
        'SELECT SCOPE_IDENTITY() AS idHistoria';
    return new sql.Request(transaction)
        .input('fechaCreacion', sql.DateTime, fechaCreacion)
        .input('fechaUltimoAcceso', sql.DateTime, fechaUltimoAcceso)
        .input('fechaActualizacion', sql.DateTime, fechaActualizacion)
        .input('hcTipo', sql.Int, hcTipo)
        .input('hcNumero', sql.VarChar(50), hcNumero)
        .input('tipoDocumento', sql.VarChar(3), tipoDocumento)
        .input('nroDocumento', sql.VarChar(10), nroDocumento)
        .input('apellido', sql.VarChar(50), apellido)
        .input('nombre', sql.VarChar(50), nombre)
        .input('estadoCivil', sql.VarChar(10), estadoCivil)
        .input('sexo', sql.VarChar(10), sexo)
        .input('fechaNacimiento', sql.DateTime, fechaNacimiento)
        .input('andesId', sql.VarChar(50), andesId)
        .query(query).then(result => {
            return {
                idHistoria: result.recordset[0].codigo,
            };
        }).catch(err => {
            let fakeRequest = {
                user: {
                    usuario: 'msPacienteHPN',
                    app: 'patient-hpn',
                    organizacion: 'Microservicio generico'
                },
                ip: 'localhost',
                connection: {
                    localAddress: ''
                }
            };
            transaction.rollback(err2 => {
                console.log('se produjo un rollback en el save');
            });
            log(fakeRequest, 'mpi:paciente:save', paciente, 'save', paciente, pacienteExistente);
            throw err;
        });
}
export async function getDatosPaciente(tipoDocumento, paciente, transaction) {
    const documento = paciente.documento.replace(/^0+/, '');
    const andesId = paciente._id;

    if (documento) {
        const query = 'SELECT h.Codigo as idHistoria, p.id as idPaciente, HC_Tipo, HC_Fecha_Actualizacion ' +
            'FROM Historias_Clinicas h ' + 'inner join Pacientes p on p.legacy_idHistoriaClinica=h.codigo ' +
            'WHERE h.HC_Documento = @documento order by HC_Fecha_Actualizacion desc ';

        const result = await transaction.request()
            .input('documento', sql.VarChar(50), documento)
            .input('tipoDocumento', sql.VarChar(50), tipoDocumento)
            .query(query)
            .catch(err => {
                transaction.rollback(err2 => {
                    console.log('se produjo un rollback en el get');
                });
            });
        if (result.recordset.length > 0) {
            const registros = result.recordset;
            const reg = registros.find(record => record.HC_TIpo === 1);
            if (!reg) {
                return result.recordset[0]; // Sino devuelvo el PDR
            } else {
                return reg;
            }
        } else {
            return null;
        }
    } else {
        // Para el caso de los pacientes que vienen sin DNI desde andes, pero que fueron creados con numero SN
        const query = 'SELECT h.Codigo as idHistoria, p.id as idPaciente ' +
            'FROM Historias_Clinicas h ' + 'inner join Pacientes p on p.legacy_idHistoriaClinica=h.codigo ' +
            'WHERE h.andesId = @andesId';

        const result = await transaction.request()
            .input('andesId', sql.VarChar(50), andesId)
            .query(query)
            .catch(err => {
                transaction.rollback(err2 => {
                    console.log('se produjo un rollback en el otro get');
                });
            });
        return result.recordset[0];
    }
}
export async function createPacienteSinDocumento(transaction) {
    try {
        const result = await new sql.Request(transaction)
            .input('sistema', sql.Int, 6)
            .output('nextKey', sql.Int)
            .execute('hsp_Keys');

        return result.output.nextKey;
    } catch (err) {
        transaction.rollback(err => {
            console.log('se produjo un rollback en el create paciente sin documento');
        });
    }
}
