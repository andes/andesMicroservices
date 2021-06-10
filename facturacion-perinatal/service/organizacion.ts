import { ANDES_HOST, ANDES_KEY, fakeRequest } from '../config.private';
const fetch = require('node-fetch');

import { log } from '@andes/log';

export async function getOrganizacionAndes(idOrganizacion) {
    const url = `${ANDES_HOST}/core/tm/organizaciones?ids=${idOrganizacion}`;
    const options = {
        url,
        method: 'GET',
        headers: {
            Authorization: `JWT ${ANDES_KEY}`
        }
    };
    try {
        let response = await fetch(url, options);

        const responseJson = await response.json();

        return responseJson[0] || null;
    }
    catch (error) {
        log(fakeRequest, 'microservices:integration:facturacion-perinatal', idOrganizacion, 'getOrganizacionAndes:error', error);
    }

}