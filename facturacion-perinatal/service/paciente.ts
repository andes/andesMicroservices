import { ANDES_HOST, ANDES_KEY, fakeRequest } from '../config.private';
const fetch = require('node-fetch');

import { log } from '@andes/log';

export async function getPacienteAndes(idPaciente) {
    const url = `${ANDES_HOST}/core-v2/mpi/pacientes/${idPaciente}`;
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
        return (responseJson._id) ? responseJson : null;

    }
    catch (error) {
        log(fakeRequest, 'microservices:integration:sip-plus', idPaciente, 'getPaciente:error', error);
    }

}