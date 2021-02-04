import { sisaDev } from '../config.private';
const request = require('request');

export async function sisaVacunas(paciente: any) {
    const sexoPaciente = paciente.sexo === 'masculino' ? 'M' : 'F';
    const url = sisaDev.url;
    const data = {
        idTipoDoc: '1',
        nroDoc: paciente.documento,
        sexo: sexoPaciente
    }

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
            if (response.statusCode >= 200 && response.statusCode < 300) {
                return resolve(body);
            }
            return resolve([]);
        });
    });
}
