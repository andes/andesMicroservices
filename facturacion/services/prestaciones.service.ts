import { ANDES_HOST, ANDES_KEY } from './../config.private';
const request = require('request');

export async function getPrestaciones(idPrestacion) {
    return new Promise((resolve, reject) => {
        const url = `${ANDES_HOST}/modules/rup/prestaciones/${idPrestacion}?token=${ANDES_KEY}`;
        request(url, (error, response, body) => {
            if (!error && response.statusCode >= 200 && response.statusCode < 300) {
                const prestacion: any[] = JSON.parse(body);
                if (prestacion) {
                    return resolve(prestacion);
                }
            }
            return reject('No se encuentra organización: ' + error);
        });
    });
}