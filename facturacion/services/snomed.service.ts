import { ANDES_HOST, ANDES_KEY } from './../config.private';
import { promises } from 'fs';
const request = require('request');

export async function getSnomed(expression) {
    return new Promise((resolve, reject) => {
        const url = `${ANDES_HOST}/core/term/snomed/expression?expression=${expression}`;
        request(url, (error, response, body) => {
            if (!error && response.statusCode >= 200 && response.statusCode < 300) {
                const exp: any[] = JSON.parse(body);

                resolve(exp);
                // if (puco && puco.length) {
                //     return resolve({
                //         codOS: puco[0].codigoFinanciador,
                //         financiador: puco[0].financiador
                //     });
                // }
            }
            return reject(error || body);
        });
    });
}

// export async function makeMongoQuery(term) {
//     return new Promise((resolve, reject) => {
//         const url = `${ANDES_HOST}/core/term/snomed/expression?term=${term}&token=${ANDES_KEY}`;
//         request(url, (error, response, body) => {
//             if (!error && response.statusCode >= 200 && response.statusCode < 300) {
//                 const exp: any[] = JSON.parse(body);

//                 resolve(exp);
//                 // if (puco && puco.length) {
//                 //     return resolve({
//                 //         codOS: puco[0].codigoFinanciador,
//                 //         financiador: puco[0].financiador
//                 //     });
//                 // }
//             }
//             return reject(error || body);
//         });
//     });
// }
