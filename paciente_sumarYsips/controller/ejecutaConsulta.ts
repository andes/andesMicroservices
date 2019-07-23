import { connectionString } from '../config.private';
import * as consulta from './consultas';
import * as sql from 'mssql';

export async function conexionPaciente(paciente) {
    let conexion;

    conexion = await new sql.ConnectionPool(connectionString).connect();
    // const transaction = await new sql.Transaction(conexion);

    try {
        let _pacienteExistenteSIPS = consulta.existePacienteSIPS(paciente, conexion);
        let _pacienteExistenteSUMAR = consulta.existePacienteSUMAR(paciente, conexion);
        let _pacienteExistentePUCO = consulta.existePacientePUCO(paciente, conexion);
        let [pacienteExistenteSIPS, pacienteExistenteSUMAR, pacienteExistentePUCO] = await Promise.all([_pacienteExistenteSIPS, _pacienteExistenteSUMAR, _pacienteExistentePUCO]);

        // await transaction.begin();

        if (!pacienteExistentePUCO) {
            let _pacienteSIPS: any = setPacienteSIPS(paciente, pacienteExistenteSIPS, conexion);
            let _pacienteSUMAR: any = setPacienteSUMAR(paciente, pacienteExistenteSUMAR, conexion);

            let [pacSIPS, pacSUMAR] = await Promise.all([_pacienteSIPS, _pacienteSUMAR]);
            // let [pacSUMAR] = await Promise.all([_pacienteSUMAR]);

            // let pacienteSips;


            // if (!pacienteExistenteSIPS) {
            //     pacienteSips = await consulta.insertarPacienteSIPS(paciente, transaction);


            // } else {
            //     await consulta.actualizarPacienteSIPS(paciente, pacienteExistenteSIPS, transaction);
            //     pacienteSips = pacienteExistenteSIPS.idPaciente;
            // }
            // let pacienteExistenteParentezco = await consulta.existeParentezco(pacienteSips, conexion);
            // let relaciones = paciente.relaciones ? paciente.relaciones : [];
            // let tutor = (relaciones.length > 0) ? relaciones[0] : null;
            // if (!pacienteExistenteParentezco && tutor) {
            //     await consulta.insertarParentezco(pacienteSips, tutor, transaction);
            // }

            // console.log("Existe en SUmar: ", pacienteExistenteSUMAR);
            // if (!pacienteExistenteSUMAR) {
            //     await consulta.insertarPacienteSUMAR(paciente, transaction);
            // } else {
            //     await consulta.actualizarPacienteSUMAR(paciente, pacienteExistenteSUMAR, transaction);
            // }
        }
        // await transaction.commit();
    } catch (ex) {
        console.log("Hace rollback: ", ex);
        // transaction.rollback();
    }
}

/* Valida si el comprobante ya fue creado en la BD de SUMAR */
async function setPacienteSIPS(paciente, pacienteExistenteSIPS, conexion) {
    const transaction = await new sql.Transaction(conexion);
    
    try {
        await transaction.begin();
        let pacienteSips: any;
        if (!pacienteExistenteSIPS) {
            pacienteSips = await consulta.insertarPacienteSIPS(paciente, transaction);
        } else {
            await consulta.actualizarPacienteSIPS(paciente, pacienteExistenteSIPS, transaction);
            pacienteSips = pacienteExistenteSIPS.idPaciente;
        }

        // TODO: Revisar
        // let pacienteExistenteParentezco = await consulta.existeParentezco(pacienteSips, conexion);
        // let relaciones = paciente.relaciones ? paciente.relaciones : [];
        // let tutor = (relaciones.length > 0) ? relaciones[0] : null;
        // if (!pacienteExistenteParentezco && tutor) {
        //     await consulta.insertarParentezco(pacienteSips, tutor, transaction);
        // }

        await transaction.commit();

        // return pacienteSips;
    } catch (error) {
        console.log("Hace rollback SIPS: ", error);
        // transaction.rollback();
    }
}

async function setPacienteSUMAR(paciente, pacienteExistenteSUMAR, conexion) {
    const transaction = await new sql.Transaction(conexion);
    try {
        await transaction.begin();

        if (!pacienteExistenteSUMAR) {
            let pepe = await consulta.insertarPacienteSUMAR(paciente, transaction);
            console.log("pepep sumarrr: ", pepe);
        } else {
            await consulta.actualizarPacienteSUMAR(paciente, pacienteExistenteSUMAR, transaction);
        }

        await transaction.commit();

    } catch (error) {
        console.log("Hace rollback sumar: ", error);
        transaction.rollback();
    }
}

