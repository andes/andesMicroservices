import { ANDES_HOST, ANDES_KEY, fakeRequest } from '../config.private';
import { msSipPlusPerinatalLog } from '../logger/msSipPlusPerinatal';
const log = msSipPlusPerinatalLog.startTrace();
const fetch = require('node-fetch');

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
        const response = await fetch(url, options);
        const responseJson = await response.json();
        return responseJson[0] || null;
    } catch (error) {
        log.error('getOrganizacionAndes:error', { idOrganizacion, options }, error, fakeRequest);
        return null;
    }

}
