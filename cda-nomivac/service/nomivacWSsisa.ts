import { sisaDev, userScheduler } from '../config.private';
import { msCDANomivacLog } from '../logger/nomivacCDALog';
const request = require('request');
const log = msCDANomivacLog.startTrace();

export async function sisaVacunas(paciente: any) {
    const sexoPaciente = paciente.sexo === 'masculino' ? 'M' : 'F';
    const url = sisaDev.url;
    const data = {
        idTipoDoc: '1',
        nroDoc: paciente.documento,
        sexo: sexoPaciente
    };

    return new Promise((resolve: any, reject: any) => {
        const options = {
            url,
            method: 'POST',
            json: true,
            body: data,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                app_id: sisaDev.app_id,
                app_key: sisaDev.app_key
            }
        };
        request(options, (error, response, body) => {
            if (!error && response && response.statusCode >= 200 && response.statusCode < 300) {
                if (body && body.resultado && body.resultado !== 'OK') {
                    log.error('sisaVacunas:responseError', { data, statusCode: response.statusCode, body }, body.resultado, userScheduler);
                }
                return resolve(body);
            }
            log.error('sisaVacunas:requestError', { data, statusCode: response?.statusCode, body }, error || body || 'Error al consultar SISA', userScheduler);
            return resolve([]);
        });
    });
}
