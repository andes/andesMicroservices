import { ANDES_HOST, ANDES_KEY } from './../config.private';
const request = require('request');

export async function getOrganizacion(idOrganizacion) {
    return new Promise((resolve, reject) => {
        const url = `${ANDES_HOST}/core/tm/organizaciones?ids=${idOrganizacion}&token=${ANDES_KEY}`;
        request(url, (error, response, body) => {
            if (!error && response.statusCode >= 200 && response.statusCode < 300) {
                const orgs: any[] = JSON.parse(body);
                if (orgs && orgs.length) {
                    return resolve({
                        nombre: orgs[0].nombre,
                        cuie: orgs[0].codigo.cuie,
                        idSips: orgs[0].codigo.sips
                    });
                }
            }
            return reject('No se encuentra organización' + body);
        });
    });
}
