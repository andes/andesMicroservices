import { ANDES_HOST, ANDES_KEY } from '../config.private';
import { userScheduler } from '../config.private';
import { msCDAValidatorLog } from '../logger/msCDAValidator';
const fetch = require('node-fetch');
const log = msCDAValidatorLog.startTrace();

export async function postCDA(data: any) {
    const url = `${ANDES_HOST}/modules/cda/create`;

    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `JWT ${ANDES_KEY}`
        }
    });
    const body = response.json();
    if (response.status >= 200 && response.status < 300) {
        return await body;
    } else {
        log.error('guardia:postGuardiasCDA', { response, body }, 'unkown error', userScheduler);
        return null;
    }
}

