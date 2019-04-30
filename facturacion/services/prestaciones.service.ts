import { ANDES_HOST, ANDES_KEY } from './../config.private';
const request = require('request');

/**
 *
 *
 * @export
 * @param {*} idPrestacion
 * @returns
 */
export async function getPrestacion(idPrestacion) {
    return new Promise((resolve, reject) => {
        const url = `${ANDES_HOST}/modules/rup/prestaciones/${idPrestacion}?token=${ANDES_KEY}`;
        // request.get();
        request(url, (error, response, body) => {
            if (!error && response.statusCode >= 200 && response.statusCode < 300) {
                const prestacion: any[] = JSON.parse(body);
                if (prestacion) {
                    return resolve(prestacion);
                }
            }
            return reject('No se encuentra prestaciones: ' + error);
        });
    });
}

export async function getDatosTurno(idTurno) {
    return new Promise((resolve, reject) => {
        const url = `${ANDES_HOST}/modules/turnos/turno/${idTurno}?token=${ANDES_KEY}`;
        // request.get();
        request(url, (error, response, body) => {
            if (!error && response.statusCode >= 200 && response.statusCode < 300) {
                const datosTurno: any[] = JSON.parse(body);
                console.log("Adneto de datos turn: ", datosTurno);
                if (datosTurno) {
                    return resolve(datosTurno[0]);
                } else {
                    return resolve(null);
                }
            }
            return reject('No se encuentran Turnos: ' + error);
        });
    });
}


/**
 *
 *
 * @export
 * @param {*} idPrestacion
 * @returns
 */
export async function updateEstadoFacturacionConTurno(agendaId, bloqueId, turnoId, _estadoFacturacion) {
    return new Promise((resolve, reject) => {
        const url = `${ANDES_HOST}/modules/turnos/turno/${turnoId}/${bloqueId}/${agendaId}/`;
        const options = {
            url,
            method: 'PATCH',
            json: true,
            body: { estadoFacturacion: _estadoFacturacion },
            headers: {
                Authorization: `JWT ${ANDES_KEY}`
            }
        };

        request(options, (error, response, body) => {
            if (!error && response.statusCode >= 200 && response.statusCode < 300) {
                resolve(body.body);
            } else {

                return reject('No se encuentra prestaciones: ' + error);
            }
        });
    });
}

/**
 *
 *
 * @export
 * @param {*} idPrestacion
 * @returns
 */
export async function updateEstadoFacturacionSinTurno(codificacionId, _estadoFacturacion) {
    return new Promise((resolve, reject) => {
        const url = `${ANDES_HOST}/modules/rup/codificacion/estadoFacturacion/${codificacionId}`;
        const options = {
            url,
            method: 'PATCH',
            json: true,
            body: { estadoFacturacion: _estadoFacturacion },
            headers: {
                Authorization: `JWT ${ANDES_KEY}`
            }
        };

        request(options, (error, response, body) => {
            if (!error && response.statusCode >= 200 && response.statusCode < 300) {
                resolve(body.body);
            } else {
                return reject('No se encuentra prestaciones: ' + error);
            }
        });
    });
}
