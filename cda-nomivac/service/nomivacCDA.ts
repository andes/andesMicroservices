import { ANDES_HOST, ANDES_KEY } from '../config.private';
const request = require('request');

// Invoca a la API de andes para generar un cda con la vacuna
export function postCDA(data: any) {
    return new Promise((resolve: any, reject: any) => {
        const url = `${ANDES_HOST}/modules/cda/create`;
        const options = {
            url,
            method: 'POST',
            json: true,
            body: data,
            headers: {
                Authorization: `JWT ${ANDES_KEY}`
            }
        };
        request(options, (error, response, body) => {
            if (response.statusCode >= 200 && response.statusCode < 300) {
                return resolve(body);
            }
            return resolve(error || body);
        });
    });
}

export function postMongoDB(data: any) {
    return new Promise((resolve: any, reject: any) => {
        const url = `${ANDES_HOST}/modules/mobileapp/nomivac`;
        const options = {
            url,
            method: 'POST',
            json: true,
            body: data,
            headers: {
                Authorization: `JWT ${ANDES_KEY}`
            }
        };
        request(options, (error, response, body) => {
            if (response.statusCode >= 200 && response.statusCode < 300) {
                return resolve(body);
            }
            return resolve(error || body);
        });
    });
}
