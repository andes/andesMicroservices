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
        request(url, (error, response, body) => {
            if (!error && response.statusCode >= 200 && response.statusCode < 300) {
                const prestacion: any[] = JSON.parse(body);
                if (prestacion) {
                    resolve(prestacion);
                }
            }
            reject('No se encuentra prestaciones: ' + error);
        });
    });
}

export async function getDatosTurno(idTurno) {
    return new Promise((resolve, reject) => {
        const url = `${ANDES_HOST}/modules/turnos/agenda/turno/${idTurno}?token=${ANDES_KEY}`;
        request(url, (error, response, body) => {
            if (!error && response.statusCode >= 200 && response.statusCode < 300) {
                const datosTurno: any[] = JSON.parse(body);
                if (datosTurno) {
                    resolve(datosTurno[0]);
                } else {
                    resolve(null);
                }
            }
            reject('No se encuentran Turnos: ' + error);
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
                reject('No hace patch con turno: ' + error);
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
export async function updateEstadoFacturacionSinTurno(idPrestacion, _estadoFacturacion) {
    return new Promise((resolve, reject) => {
        const url = `${ANDES_HOST}/modules/rup/codificacion/estadoFacturacion/${idPrestacion}`;
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
                resolve(body);
            } else {
                reject('No hace patch sin turno: ' + error);
            }
        });
    });
}

export async function getDatosReportables(prestacion) {
    const idPrestacionTurneable = prestacion.solicitud.tipoPrestacion.conceptId;
    const configAutomatica = [];
    for (const registro of prestacion.ejecucion.registros) {
        const idPrestacionEjecutada = registro.concepto.conceptId;
        const config: any = await getConfigAutomatica(idPrestacionTurneable, idPrestacionEjecutada)

        if (config && !configAutomatica.find(c => c._id === config._id)) {
            configAutomatica.push(config);
        }
    }
    return configAutomatica;
} 

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
