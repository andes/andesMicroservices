import { ANDES_HOST, ANDES_KEY } from '../config.private';
const request = require('request');
import { log } from '@andes/log';


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
                resolve(JSON.parse(body));
            }
            let fakeRequest = {
                user: {
                    usuario: 'sipsYsumar',
                    app: 'integracion-sipsYsumar',
                    organizacion: 'sss'
                },
                ip: 'localhost',
                connection: {
                    localAddress: ''
                }
            };
            log(fakeRequest, 'microservices:integration:sipsYsumar', undefined, 'Get Paciente', body);
            resolve(error || body);
        });
    });
}



export function getCuie(nombreProvincia) {
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
                resolve(JSON.parse(body));
            }
            let fakeRequest = {
                user: {
                    usuario: 'sipsYsumar',
                    app: 'integracion-sipsYsumar',
                    organizacion: 'sss'
                },
                ip: 'localhost',
                connection: {
                    localAddress: ''
                }
            };
            log(fakeRequest, 'microservices:integration:sipsYsumar', undefined, 'Get provincia', body);
            resolve(error || body);
        });
    });
}
export function getLocalidad(nombreLocalidad) {
    return new Promise((resolve: any, reject: any) => {
        const url = `${ANDES_HOST}/core/tm/localidades/?nombre=${nombreLocalidad}`;
        const options = {
            url,
            method: 'GET',
            headers: {
                Authorization: `JWT ${ANDES_KEY}`
            }
        };
        request(options, (error, response, body) => {
            if (response.statusCode >= 200 && response.statusCode < 300) {
                resolve(JSON.parse(body));
            }
            let fakeRequest = {
                user: {
                    usuario: 'sipsYsumar',
                    app: 'integracion-sipsYsumar',
                    organizacion: 'sss'
                },
                ip: 'localhost',
                connection: {
                    localAddress: ''
                }
            };
            log(fakeRequest, 'microservices:integration:sipsYsumar', undefined, 'Get Localidad', body);
            resolve(error || body);
        });
    });
}