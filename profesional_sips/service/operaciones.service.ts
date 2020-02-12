import { ANDES_HOST, ANDES_KEY, fakeRequest } from '../config.private';
const request = require('request');

import { log } from '@andes/log';

export function getProfesional(idProfesional) {
    return new Promise((resolve: any, reject: any) => {
        const url = `${ANDES_HOST}/core/tm/profesionales/${idProfesional}`;
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
            log(fakeRequest, 'microservices:integration:sipsYsumar', idProfesional, 'getProfesional:error', { error, body });
            return resolve(error || body);
        });
    });
}

export function getOrganizacion(idOrg): any {
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
                const orgs: any = JSON.parse(body);
                const organizacion: any = {};
                if (orgs) {
                    return resolve({
                        organizacion: {
                            nombre: orgs.nombre,
                            cuie: orgs.codigo.cuie,
                            idSips: orgs.codigo.sips
                        }
                    });
                }
            }
            log(fakeRequest, 'microservices:integration:sipsYsumar', null, 'getOrganizacion:error', { error, body });
            return resolve(error || body);
        });
    });
}