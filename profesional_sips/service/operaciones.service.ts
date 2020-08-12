import { ANDES_HOST, ANDES_KEY, fakeRequest } from '../config.private';

import { log } from '@andes/log';

export function getProfesional(idProfesional) {
    try {
        const url = `${ANDES_HOST}/core/tm/profesionales/${idProfesional}`;
        const options = {
            url,
            method: 'GET',
            headers: {
                Authorization: `JWT ${ANDES_KEY}`
            }
        };
        let response = await fetch(url, options);
        const responseJson = await response.json();
        if (responseJson.statusCode >= 200 && responseJson.statusCode < 300) {
            return responseJson.body;
        }
        return null;
    }
    catch (error) {
        log(fakeRequest, 'microservices:integration:sipsYsumar', idProfesional, 'getProfesional:error', { body);
    }
}

export function getOrganizacion(idOrg): any {
    try {
        const url = `${ANDES_HOST}/core/tm/organizaciones/${idOrg}`;
        const options = {
            url,
            method: 'GET',
            headers: {
                Authorization: `JWT ${ANDES_KEY}`
            }
        };
        let response = await fetch(url, options);
        const responseJson = await response.json();
        if (responseJson.statusCode >= 200 && responseJson.statusCode < 300) {
            const orgs: any = JSON.parse(responseJson.body);
            if (orgs) {
                return {
                    organizacion: {
                        nombre: orgs.nombre,
                        cuie: orgs.codigo.cuie,
                        idSips: orgs.codigo.sips
                    }
                }
            }
        }
        return null;
    } catch (error) {
        log(fakeRequest, 'microservices:integration:sipsYsumar', idOrg, 'getProfesional:error', {});
    }
}