import { ANDES_HOST, ANDES_KEY } from './../config.private';
const request = require('request');

export function getEspecialidades(idProfesional) {
    return new Promise((resolve: any, reject: any) => {
        const url = `${ANDES_HOST}/core/tm/profesionales/${idProfesional}`;
        const options = {
            url,
            method: 'GET',
            // json: true,
            // body: data
            headers: {
                Authorization: `JWT ${ANDES_KEY}`
            }
        };
        request(options, (error, response, body) => {
            if (response.statusCode >= 200 && response.statusCode < 300) {
                return resolve(JSON.parse(body));
            }
            return resolve(error || body);
        });
    });
}
