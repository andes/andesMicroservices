import { ANDES_HOST, ANDES_KEY } from '../config.private';
const fetch = require('node-fetch');

export async function postCDA(data: any) {
    const url = `${ANDES_HOST}/modules/cda/create`;

    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `JWT ${ANDES_KEY}`
        }
    });
    if (response.status >= 200 && response.status < 300) {
        return await response.json();
    }
}

