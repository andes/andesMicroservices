import { getData } from './queries';
import * as Verificator from './verificaCDA';
import { postCDA } from './../service/cda.service';
import { msCDAValidatorAmbulatorioLog } from './../logger/msCDAValidator';
import { userScheduler, } from './../config.private';
const sql = require('mssql');
let moment = require('moment');
const logAmbularorio = msCDAValidatorAmbulatorioLog.startTrace();

export async function ejecutar(efector: string, factory, paciente, cleanCache) {
    let data = factory;
    if (data) {
        sql.close();
        let pool = await sql.connect(data.connectionString);
        try {
            let resultado = await getData(pool, data.query);
            const registros = resultado.recordset;
            if (registros.length > 0) {
                let ps = registros.map(async registro => {
                    let dto = await Verificator.verificar(registro, paciente);
                    if (dto && (checkCache(efector, paciente, dto.fecha) || cleanCache)) {
                        await postCDA(dto);
                    }
                });
                await Promise.all(ps);

                const maxDate = registros.reduce((acc, current) => acc.getTime() < moment(current.fecha).toDate().getTime() ? moment(current.fecha).toDate() : acc, new Date(1900, 1, 1));
                setCache(efector, paciente, maxDate);
            } 

        } catch (error) {
            logAmbularorio.error('ambulatorio:ejecutaCDA:ejecutar', { paciente, efector, error }, error.message, userScheduler);

        }
    }
}

const cachePacienteFecha: { [key: string]: Date } = {};

function setCache(efector: string, paciente, fecha: Date) {
    cachePacienteFecha[efector + '-' + paciente.id] = fecha;
}

function checkCache(efector: string, paciente, fecha: Date) {
    if (!cachePacienteFecha[efector + '-' + paciente.id]) {
        return true;
    } else if (cachePacienteFecha[efector + '-' + paciente.id].getTime() < fecha.getTime()) {
        return true;
    }
    return false;
}
