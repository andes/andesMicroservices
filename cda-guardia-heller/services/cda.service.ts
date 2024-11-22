import { ANDES_HOST, userScheduler } from '../config.private';
import { msCDAGuardiaHellerLog } from '../logger/msCDAGuardiaHeller';

const fetch = require('node-fetch');
const log = msCDAGuardiaHellerLog.startTrace();

export async function postCDA(data: any, token: any) {
    const url = `${ANDES_HOST}/modules/cda/create`;
    const options = {
        url,
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            Authorization: `JWT ${token}`
        }
    };
    try {
        const response = await fetch(url, options);
        if (response.status >= 200 && response.status < 300) {
            const responseJson = await response.json();
            return {
                status: response.status,
                cda: responseJson.cda,
                paciente: responseJson.paciente
            };
        } else {
            log.error('guardia-heller:postCDA:statusError', { dataCDA: data, url }, { status: response.error, message: response.message }, userScheduler);
            return { status: response.status, error: "Error al generar CDA: " + response.statusText };
        }
    }
    catch (error) {
        log.error('guardia-heller:postCDA', { error: error.message }, userScheduler);
        return { status: 500, error: error.message };
    }
}
