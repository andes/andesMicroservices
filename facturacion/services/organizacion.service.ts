import { ANDES_HOST, ANDES_KEY } from './../config.private';
const request = require('request');

export async function getOrganizacion(idOrganizacion) {
    return new Promise((resolve, reject) => {
        const url = `${ANDES_HOST}/core/tm/organizaciones?ids=${idOrganizacion}&token=${ANDES_KEY}`;
        request(url, (error, response, body) => {
            if (!error && response.statusCode >= 200 && response.statusCode < 300) {
                const orgs: any[] = JSON.parse(body);
                const organizacion: any = {};
                if (orgs && orgs.length) {
                    resolve({
                        organizacion: {
                            nombre: orgs[0].nombre,
                            cuie: orgs[0].codigo.cuie,
                            idSips: orgs[0].codigo.sips
                        }
                    });
                }
            }
            reject('No se encuentra organización' + body);
        });
    });
}
