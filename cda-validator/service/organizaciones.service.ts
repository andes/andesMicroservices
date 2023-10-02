import { ANDES_HOST, ANDES_KEY } from './../config.private';
import { userScheduler } from '../config.private';
import { msCDAValidatorLog } from '../logger/msCDAValidator';
const request = require('request');
const log = msCDAValidatorLog.startTrace();

export async function getOrganizacion(sisa) {
    return new Promise((resolve) => {
        const url = `${ANDES_HOST}/core/tm/organizaciones?sisa=${sisa}&token=${ANDES_KEY}`;
        request(url, (error, response, body) => {
            if (!error && response.statusCode >= 200 && response.statusCode < 300 && body) {
                const organizacion = JSON.parse(body);
                if (organizacion) {
                    resolve({
                        _id: organizacion[0].id,
                        nombre: organizacion[0].nombre
                    });
                }
            } else {
                log.error('guardia:getOrganizacion', { error, url }, userScheduler);
                resolve(error);
            }
        });
    });
}
