import { ANDES_HOST, ANDES_KEY, fakeRequest } from '../config.private';
import { msSipPlusPerinatalLog } from '../logger/msSipPlusPerinatal';
const log = msSipPlusPerinatalLog.startTrace();
const fetch = require('node-fetch');

export async function getPaciente(idPaciente) {
    const url = `${ANDES_HOST}/core-v2/mpi/pacientes/${idPaciente}`;
    const options = {
        url,
        method: 'GET',
        headers: {
            Authorization: `JWT ${ANDES_KEY}`
        }
    };
    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} - ${response.statusText}`);
        }

        const responseJson = await response.json();

        return responseJson?._id ? responseJson : null;

    } catch (error) {
        log.error(
            'getPaciente:error',
            { idPaciente, options, url },
            error,
            fakeRequest
        );
        return null;
    }

}
