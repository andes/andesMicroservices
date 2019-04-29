import { ANDES_HOST, ANDES_KEY } from './../config.private';
const request = require('request');

export async function getPuco(dniPaciente) {
    return new Promise((resolve, reject) => {
        const url = `${ANDES_HOST}/modules/obraSocial/puco?dni=${dniPaciente}&token=${ANDES_KEY}`;
        request(url, (error, response, body) => {
            if (!error && response.statusCode >= 200 && response.statusCode < 300) {
                const puco: any[] = JSON.parse(body);
                const obraSocial: any = {};
                if (puco && puco.length) {
                    return resolve({
                        obraSocial: {
                            codOS: puco[0].codigoFinanciador,
                            financiador: puco[0].financiador
                        }
                    });
                } else {
                    resolve(null);
                }
            }
            return reject('No se encuentra datos en PUCO: ' + body);
        });
    });
}

