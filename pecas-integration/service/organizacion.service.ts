import { ANDES_HOST } from './../config.private';
const request = require('request');

export function getEfector(idOrganizacion) {
    return new Promise((resolve: any, reject: any) => {
        const url = `${ANDES_HOST}/core/tm/organizaciones/${idOrganizacion}`;
        const options = {
            url,
            method: 'GET',
            // json: true
            // body: data
            // headers: {
            //     Authorization: `JWT ${ANDES_KEY}`
            // }
        };
        request(options, (error, response, body) => {
            if (response.statusCode >= 200 && response.statusCode < 300) {
                resolve(JSON.parse(body));
            }
            resolve(error || body);
        });
    });
}
