import { ANDES_HOST, ANDES_KEY, fakeRequest } from '../config.private';

import { log } from '@andes/log';
const fetch = require('node-fetch');


export async function getProfesional(idProfesional) {
    try {
        const url = `${ANDES_HOST}/core/tm/profesionales/${idProfesional}`;
        const options = {
            method: 'GET',
            headers: {
                Authorization: `JWT ${ANDES_KEY}`
            }
        };
        let response = await fetch(url, options);
        const responseJson = await response.json();
        if (responseJson._id) {
            return responseJson;
        } else {
            return null;
        }
    }
    catch (error) {
        log(fakeRequest, 'microservices:integration:profesional_sips', idProfesional, 'getProfesional:error', error);
    }
}

export async function getOrganizacion(idOrg): Promise<any> {
    try {
        const url = `${ANDES_HOST}/core/tm/organizaciones/${idOrg}`;
        const options = {
            method: 'GET',
            headers: {
                Authorization: `JWT ${ANDES_KEY}`
            }
        };
        let response = await fetch(url, options);
        const responseJson = await response.json();
        if (responseJson._id) {
            if (responseJson) {
                return {
                    organizacion: {
                        nombre: responseJson.nombre,
                        cuie: responseJson.codigo.cuie,
                        idSips: responseJson.codigo.sips
                    }
                }
            }
        } else {
            return null;
        }
    } catch (error) {
        log(fakeRequest, 'microservices:integration:profesional_sips', idOrg, 'getProfesional:error', {});
    }
}