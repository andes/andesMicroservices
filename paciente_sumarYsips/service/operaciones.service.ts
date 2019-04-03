import { ANDES_HOST, ANDES_KEY } from '../config.private';
const request = require('request');
export function getPaciente(idPaciente) {
    return new Promise((resolve: any, reject: any) => {
        const url = `${ANDES_HOST}/core/mpi/pacientes/${idPaciente}`;
        const options = {
            url,
            method: 'GET',
            headers: {
                Authorization: `JWT ${ANDES_KEY}`
            }
        };
        request(options, (error, response, body) => {
            if (response.statusCode >= 200 && response.statusCode < 300) {
                return resolve(JSON.parse(body));
            }
            return resolve(error || body);
        });
    });
}

export function getOrganizacion(idOrg) {
    return new Promise((resolve: any, reject: any) => {
        const url = `${ANDES_HOST}/core/tm/organizaciones/${idOrg}`;
        const options = {
            url,
            method: 'GET',
            headers: {
                Authorization: `JWT ${ANDES_KEY}`
            }
        };
        request(options, (error, response, body) => {
            if (response.statusCode >= 200 && response.statusCode < 300) {
                return resolve(JSON.parse(body));
            }
            return resolve(error || body);
        });
    });
}

export function getProv(nombreProvincia) {
    return new Promise((resolve: any, reject: any) => {
        const url = `${ANDES_HOST}/core/tm/provincias/?nombre=${nombreProvincia}`;
        const options = {
            url,
            method: 'GET',
            headers: {
                Authorization: `JWT ${ANDES_KEY}`
            }
        };
        request(options, (error, response, body) => {
            if (response.statusCode >= 200 && response.statusCode < 300) {
                return resolve(JSON.parse(body));
            }
            return resolve(error || body);
        });
    });
}

export function getLocalidad(nombreLocalidad, idProv) {
    return new Promise((resolve: any, reject: any) => {
        const url = `${ANDES_HOST}/core/tm/localidades/?nombre=${nombreLocalidad}&provincia=${idProv}`;
        const options = {
            url,
            method: 'GET',
            headers: {
                Authorization: `JWT ${ANDES_KEY}`
            }
        };
        request(options, (error, response, body) => {
            if (response.statusCode >= 200 && response.statusCode < 300) {
                return resolve(JSON.parse(body));
            }
            return resolve(error || body);
        });
    });
}
