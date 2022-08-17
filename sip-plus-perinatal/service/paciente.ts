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
        let response = await fetch(url, options);
        try {
            const responseJson = await response.json();
            if (responseJson._id) {
                return responseJson;
            } else {
                return null;
            }
        }catch (error) {
            log.error('getPaciente:error', { idPaciente, options, response }, error, fakeRequest);
        }
    }
    catch (error) {
        log.error('getPaciente:error', { idPaciente, options }, error, fakeRequest);
    }

}
