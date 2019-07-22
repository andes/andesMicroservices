import { connectionString } from '../config.private';
import * as consulta from './consultas';
import * as sql from 'mssql';

export async function conexionPaciente(paciente) {
    let conexion;

    conexion = await new sql.ConnectionPool(connectionString).connect();
    const transaction = await new sql.Transaction(conexion);

    try {
        let _pacienteExistenteSIPS = consulta.existePacienteSIPS(paciente, conexion);
        let _pacienteExistenteSUMAR = consulta.existePacienteSUMAR(paciente, conexion);
        let _pacienteExistentePUCO = consulta.existePacientePUCO(paciente, conexion);
        let [pacienteExistenteSIPS, pacienteExistenteSUMAR, pacienteExistentePUCO] = await Promise.all([_pacienteExistenteSIPS, _pacienteExistenteSUMAR, _pacienteExistentePUCO]);

        await transaction.begin();
        console.log("Existe en Puco: ", pacienteExistentePUCO);
        if (!pacienteExistentePUCO) {
            let pacienteSips;
            
            console.log("Existe en SIPSSSS: ", pacienteExistenteSIPS);
            if (!pacienteExistenteSIPS) {
                pacienteSips = await consulta.insertarPacienteSIPS(paciente, transaction);

            } else {
                await consulta.actualizarPacienteSIPS(paciente, pacienteExistenteSIPS, transaction);
                pacienteSips = pacienteExistenteSIPS.idPaciente;
            }
            let pacienteExistenteParentezco = await consulta.existeParentezco(pacienteSips, conexion);
            let relaciones = paciente.relaciones ? paciente.relaciones : [];
            let tutor = (relaciones.length > 0) ? relaciones[0] : null;
            if (!pacienteExistenteParentezco && tutor) {
                await consulta.insertarParentezco(pacienteSips, tutor, transaction);
            }
            console.log("Existe en SUmar: ", pacienteExistenteSUMAR);
            if (!pacienteExistenteSUMAR) {
                await consulta.insertarPacienteSUMAR(paciente, transaction);
            } else {
                await consulta.actualizarPacienteSUMAR(paciente, pacienteExistenteSUMAR, transaction);
            }
        }
        await transaction.commit();
    } catch (ex) {
        transaction.rollback();
    }
}
