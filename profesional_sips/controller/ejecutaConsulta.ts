import { connectionString, fakeRequest } from '../config.private';
import * as consulta from './consultas';
import * as sql from 'mssql';

import { log } from '@andes/log';
export async function conexionProfesional(profesional) {
    let conexion;
    conexion = await new sql.ConnectionPool(connectionString).connect();
    const transaction = await new sql.Transaction(conexion);
    try {
        let _profesionalExistenteSIPS = consulta.existeProfesionalSIPS(profesional, conexion);
        let [profesionalExistenteSIPS] = await Promise.all([_profesionalExistenteSIPS]);
        await transaction.begin();
        let _pacienteSIPS: any = addProfesionalSIPS(profesional, profesionalExistenteSIPS, conexion);
        await Promise.all([_pacienteSIPS]);
        await transaction.commit();
    } catch (ex) {
        log(fakeRequest, 'microservices:integration:profesional_sips', profesional._id, 'conexionProfesional:error', { error: ex, profesional: profesional.documento });
        transaction.rollback();
    }
}

/* Valida si el profesional ya fue creado en la BD de SIPS */
async function addProfesionalSIPS(profesional, profesionalExistenteSIPS, conexion) {
    const transaction = await new sql.Transaction(conexion);
    try {
        await transaction.begin();
        if (!profesionalExistenteSIPS) {
            await consulta.insertarProfesionalSIPS(profesional, transaction);
        }
        await transaction.commit();
    } catch (error) {
        log(fakeRequest, 'microservices:integration:profesional_sips', profesional._id, 'addProfesionalSIPS:error', { error, profesional: profesional });
        transaction.rollback();
    }
}


