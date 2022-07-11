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

export async function getOrganizacion(idOrganizacion): Promise<any> {
    try {
        const url = `${ANDES_HOST}/core/tm/organizaciones/${idOrganizacion}`;
        const options = {
            method: 'GET',
            headers: {
                Authorization: `JWT ${ANDES_KEY}`
            }
        };
        let response = await fetch(url, options);
        const responseJson = await response.json();
        let organizacion;
        if (responseJson._id) {
            organizacion = {
                nombre: responseJson.nombre,
                cuie: responseJson.codigo.cuie,
                idSips: responseJson.codigo.sips,
                sisa: responseJson.codigo.sisa || '0'
            };
        }
        return organizacion || null;
    } catch (error) {
        log(fakeRequest, 'microservices:integration:profesional_sips', idOrganizacion, 'getOrganizacion:error', {});
    }
}

export async function getTipoProfesional(idProfesion): Promise<any> {
    try {
        const url = `${ANDES_HOST}/core/tm/profesiones/${idProfesion}`;
        const options = {
            method: 'GET',
            headers: {
                Authorization: `JWT ${ANDES_KEY}`
            }
        };
        let response = await fetch(url, options);
        const responseJson = await response.json();
        if (responseJson && responseJson._id) {
            if (responseJson) {
                let codigo = responseJson.identificadores.find(codigo => codigo.entidad === 'SIPS');
                return codigo ? codigo.valor : 1;
            }
        } else {
            return 1;
        }
    } catch (error) {
        log(fakeRequest, 'microservices:integration:profesional_sips', idProfesion, 'getProfesion:error', {});
    }
}