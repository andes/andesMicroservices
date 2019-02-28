import { ANDES_HOST, ANDES_KEY } from './../config.private';
const request = require('request');

export async function getConfigAutomatica(conceptId) {
    return new Promise((resolve, reject) => {
        const url = `${ANDES_HOST}/modules/facturacionAutomatica/configFacturacionAutomatica?conceptId=${conceptId}&token=${ANDES_KEY}`;
        request(url, (error, response, body) => {
            if (!error && response.statusCode >= 200 && response.statusCode < 300) {
                const confAuto: any[] = JSON.parse(body);
                if (confAuto && confAuto.length) {
                    resolve(confAuto);
                    // return resolve({
                    //     nombre: orgs[0].nombre,
                    //     cuie: orgs[0].codigo.cuie,
                    //     idSips: orgs[0].codigo.sips
                    // });
                }
            }
            return reject(error || body);
        });
    });
}
