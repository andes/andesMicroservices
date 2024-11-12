import { ANDES_HOST, userScheduler } from '../config.private';
import { msCDAValidatorLog } from '../logger/msCDAValidator';

const fetch = require('node-fetch');
const log = msCDAValidatorLog.startTrace();

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
        const responseJson = await response.json();
        if (response.status >= 200 && response.status < 300) {
            return responseJson;
        } else {
            log.error('guardia-heller:postCDA:statusError', { dataCDA: data, url }, { status: responseJson.error, message: responseJson.message }, userScheduler);
            return null;
        }
    }
    catch (error) {
        log.error('guardia-heller:postCDA', { error: error.message }, userScheduler);
        return { error };
    }
}
