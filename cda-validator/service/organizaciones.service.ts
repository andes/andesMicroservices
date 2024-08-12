import { ANDES_HOST, ANDES_KEY } from './../config.private';
import { userScheduler } from '../config.private';
import { msCDAValidatorLog, msCDAValidatorAmbulatorioLog } from '../logger/msCDAValidator';
const fetch = require('node-fetch');
const logGuardia = msCDAValidatorLog.startTrace();
const logAmb = msCDAValidatorAmbulatorioLog.startTrace();

export async function getOrganizacion(sisa, ambito = 'ambulatorio') {
    const url = `${ANDES_HOST}/core/tm/organizaciones?sisa=${sisa}`;
    const options = {
        url,
        method: 'GET',
        headers: {
            Authorization: `JWT ${ANDES_KEY}`
        }
    };
    try {
        let response = await fetch(url, options);
        const responseJson = await response.json();
        return responseJson[0] || null;
    }
    catch (error) {
        if (ambito = 'ambulatorio') {
            logAmb.error('cda-validator:getOrganizacion', sisa, error, userScheduler);
        }
        else {
            logGuardia.error('cda-validator:getOrganizacion', sisa, error, userScheduler);
        }
    }
}


