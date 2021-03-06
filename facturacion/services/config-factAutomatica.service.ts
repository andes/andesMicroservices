import { ANDES_HOST, ANDES_KEY } from './../config.private';
const request = require('request');

export async function getConfigAutomatica(idPrestacionTurneable, idPrestacionEjecutada) {
    return new Promise((resolve, reject) => {
        const url = `${ANDES_HOST}/modules/facturacionAutomatica/configFacturacionAutomatica?idPrestacionTurneable=${idPrestacionTurneable}&idPrestacionEjecutada=${idPrestacionEjecutada}&token=${ANDES_KEY}`;
        request(url, (error, response, body) => {
            if (!error && response.statusCode >= 200 && response.statusCode < 300) {
                const confAuto: any[] = JSON.parse(body);
                if (confAuto && confAuto.length) {
                    resolve(confAuto[0]);
                } else {
                    resolve(null);
                }
            } else {
                reject('No se encuentra facturación: ' + body);
            }
        });
    });
}
