import * as configPrivate from '../config.private';
import * as consulta from './consultas';
import * as sql from 'mssql';
import { log } from '@andes/log';


export async function conexionPaciente(paciente) {
    let conexion;
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
    const connectionString = {
        user: configPrivate.conSql.auth.user,
        password: configPrivate.conSql.auth.password,
        server: configPrivate.conSql.serverSql.server,
        database: configPrivate.conSql.serverSql.database,
        databasePuco: configPrivate.conSql.serverSql.databasePuco,
        connectionTimeout: 10000,
        requestTimeout: 45000
    };
    try {
        conexion = await new sql.ConnectionPool(connectionString).connect();
        const transaction = await new sql.Transaction(conexion);
        let _pacienteExistenteSIPS = consulta.existePacienteSIPS(paciente, conexion);
        let _pacienteExistenteSUMAR = consulta.existePacienteSUMAR(paciente, conexion);
        let _pacienteExistentePUCO = consulta.existePacientePUCO(paciente, conexion);
        let [pacienteExistenteSIPS, pacienteExistenteSUMAR, pacienteExistentePUCO] = await Promise.all([_pacienteExistenteSIPS, _pacienteExistenteSUMAR, _pacienteExistentePUCO]);
        await transaction.begin();
        if (!pacienteExistenteSIPS) {
            let pacienteSips = await consulta.insertarPacienteSIPS(paciente, transaction);
            let pacienteExistenteParentezco = await consulta.existeParentezco(pacienteSips, conexion);
            let relaciones = paciente.relaciones ? paciente.relaciones : [];
            let tutor = (relaciones.length > 0) ? relaciones[0] : null;
            if (!pacienteExistenteParentezco && tutor) {
                await consulta.insertarParentezco(pacienteSips, tutor, transaction);
            }
        } else {
            await consulta.actualizarPacienteSIPS(paciente, pacienteExistenteSIPS, transaction);
        }


        if (!pacienteExistenteSUMAR && !pacienteExistentePUCO) {
            await consulta.insertarPacienteSUMAR(paciente, transaction);
        } else {
            if (pacienteExistenteSUMAR) {
                await consulta.actualizarPacienteSUMAR(paciente, pacienteExistenteSUMAR, transaction);
            }
        }
        await transaction.commit();
    } catch (ex) {
        log(fakeRequest, 'microservices:integration:sipsYsumar', undefined, conexion, ex, null);
        throw ex;
    }
}
