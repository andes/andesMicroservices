import { ANDES_HOST, ANDES_KEY } from './../config.private';
const request = require('request');

export async function getOrganizacion(sisa) {
    return new Promise((resolve, reject) => {
        const url = `${ANDES_HOST}/core/tm/organizaciones?sisa=${sisa}&token=${ANDES_KEY}`;
        request(url, (error, response, body) => {
            if (!error && response.statusCode >= 200 && response.statusCode < 300) {
                const orgs: any[] = JSON.parse(body);
                if (orgs && orgs.length) {
                    return resolve({
                        _id: orgs[0].id,
                        nombre: orgs[0].nombre,
                    });
                }
            }
            return reject(error || body);
        });
    });
}
