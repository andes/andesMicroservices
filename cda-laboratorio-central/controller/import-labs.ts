import { conSql } from '../config.private';
import * as moment from 'moment';
import * as sql from 'mssql';
import * as operations from './operations';
import { InformeLAB } from '../utils/informes/informe-lab';
import * as fs from 'fs';
import { userScheduler } from '../config.private';
import { msCDALaboratoriosLog } from '../logger/msCDALaboratorioCentral';
const log = msCDALaboratoriosLog.startTrace();

const cota = 0.95;

const connection = {
    user: conSql.auth.user,
    password: conSql.auth.password,
    server: conSql.serverSql.server,
    database: conSql.serverSql.database,
    options: {
        encrypt: true
    }
};

export async function importarDatos(paciente) {
    try {
        const pool = await new sql.ConnectionPool(connection).connect();
        let laboratorios: any = await operations.getEncabezados(pool, paciente);
        for (const lab of laboratorios.recordset) {
            try {
                const details: any = await operations.getDetalles(pool, lab.idProtocolo);
                if (details?.recordset?.length) {
                    const fecha = moment(lab.fecha, 'DD/MM/YYYY');
                    const organizacion: any = await operations.organizacionBySisaCode(lab.efectorCodSisa);
                    const profesional = {
                        nombre: lab.solicitante,
                        apellido: '-' // Nombre y Apellido viene junto en los registros de laboratorio de SQL
                    };
                    const informe = new InformeLAB(lab, details.recordset[0], 'Laboratorio Central');
                    fs.readFile((await informe.informe() as string), async (err, data) => {
                        if (err) {throw err; }
                        const adjunto64 = 'data:application/pdf;base64,' + data.toString('base64');
                        const dto = {
                            id: lab.idProtocolo,
                            organizacion: organizacion._id,
                            fecha: fecha.toDate(),
                            tipoPrestacion: '4241000179101',
                            paciente,
                            confidencialidad: 'N',
                            profesional,
                            cie10: 'Z01.7',
                            file: adjunto64,
                            texto: details.recordset[0].resultado
                        };
                        await operations.postCDA(dto);
                    });
                } else {
                    return null; // NO se encontraron registros en la consulta
                }
            } catch (error) {
                await log.error('cda-laboratorio-central:importarDatos', { error, paciente }, error.message, userScheduler);
            }
        }
        pool.close();
        return true;
    } catch (error) {
        await log.error('cda-laboratorio-central:importarDatos', { error, paciente }, error.message, userScheduler);
        return true;
    }
}
