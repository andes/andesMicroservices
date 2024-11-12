import * as Verificator from '../controller/verificaCDA';
import { postCDA } from '../services/cda.service';
import { userScheduler } from '../config.private';
import { msCDAValidatorLog } from '../logger/msCDAValidator';

let moment = require('moment');
const logGuardia = msCDAValidatorLog.startTrace();

export async function ejecutar(efector: string, paciente: any, cleanCache: any, data: any, token: any) {
    let ret: any;
    try {
        let dataVerif = await Verificator.verificar(data, token);
        if (dataVerif.verif && (checkCache(efector, paciente, dataVerif.dto.fecha) || cleanCache)) {
            const dto = dataVerif.dto;
            ret = await postCDA(dto, token);
        } else {
            ret = dataVerif.msgError;
        }
        const maxDate = moment().toDate();
        setCache(efector, paciente, maxDate);
        return ret;
    } catch (error) {
        logGuardia.error('guardia-heller:ejecutaCDA:ejecutar', { paciente, efector, error }, error.message, userScheduler);
        return { dto: null, verif: false, msgError: error.message };
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
