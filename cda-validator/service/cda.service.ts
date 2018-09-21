import { ANDES_HOST, ANDES_KEY } from './../config.private';
const request = require('request');

export function postCDA(data: any) {
    return new Promise((resolve: any, reject: any) => {
        const url = `${ANDES_HOST}/modules/cda/create?token=${ANDES_KEY}`;
        const options = {
            url,
            method: 'POST',
            json: true,
            body: data
        };
        request(options, (error, response, body) => {
            if (response.statusCode >= 200 && response.statusCode < 300) {
                return resolve(body);
            }
            return resolve(error || body);
        });
    });
}
