import { ANDES_HOST, ANDES_KEY } from './../config.private';
const request = require('request');

export async function getOrganizacion(idOrganizacion) {
    return new Promise((resolve, reject) => {
        const url = `${ANDES_HOST}/core/tm/organizaciones/${idOrganizacion}?token=${ANDES_KEY}`;
        request(url, (error, response, body) => {
            if (!error && response.statusCode >= 200 && response.statusCode < 300 && body) {
                resolve(JSON.parse(body));
            }
            reject('No se encuentra organización' + body);
        });
    });
}
