import { ANDES_HOST, fakeRequest } from '../config.private';
const fetch = require('node-fetch');

import { log } from '@andes/log';

export async function getPacienteAndes(params, token) {
    let qs
    if (params.id) {
        qs = `/${params.id}`;
    } else {
        if (params.documento && params.sexo) {
            qs = `?documento=${params.documento}&sexo=${params.sexo}&activo=true`;
        }
    }
    const url = `${ANDES_HOST}/core-v2/mpi/pacientes${qs}`;
    const options = {
        url,
        method: 'GET',
        headers: {
            Authorization: `JWT ${token}`
        }
    };
    try {
        const response = await fetch(url, options);
        const body = await response.json();
        return body ? body.length ? body[0]._id : body._id : null;
    }
    catch (error) {
        await log(fakeRequest, 'microservices:cda-guardia-heller', params, 'getPacienteAndes:error', error);
        return null;
    }

}