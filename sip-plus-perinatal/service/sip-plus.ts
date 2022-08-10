import { SIP_PLUS, fakeRequest } from '../config.private';
import { msSipPlusPerinatalLog } from '../logger/msSipPlusPerinatal';
const log = msSipPlusPerinatalLog.startTrace();
const fetch = require('node-fetch');


const url = `${SIP_PLUS.host}/record/AR/DNI/`;

interface optionsI {
    method: string;
    headers: {
        'Content-Type': string,
        Authorization: string
    };
    body?: string
}

const options = (method = 'GET', body = null) => {
    let options: optionsI = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + Buffer.from(`${SIP_PLUS.username}:${SIP_PLUS.password}`, 'binary').toString('base64')
        }
    }
    if (body) {
        options.body = body;
    }
    return options;
};

export async function getPacienteSP(paciente: any) {
    const documento = paciente.documento || '';
    if (documento) {
        try {
            let response = await fetch(`${url}${documento}`, options('GET'));
            try {
                if (response.status >= 200 && response.status < 300) {
                    let responseJson = await response.json();

                    const keyResponse = Object.keys(responseJson).length || null;
                    if (keyResponse) {
                        return { paciente: responseJson };
                    }
                    else {
                        return { paciente: null };

                    }
                }
                if (response.status === 404) {
                    // paciente no encontrado
                    return { paciente: null };

                }
            } catch (error) {
                log.error('getPacienteSP:error', { paciente, response }, error, fakeRequest);
                return null;
            }

        } catch (error) {
            log.error('getPacienteSP:error', { paciente }, error, fakeRequest);
        }
    }
    return null;
}

export async function postPacienteSP(documento: string = '', pacienteSP) {
    if (documento) {
        try {
            const body = JSON.stringify(pacienteSP);
            let optionsPost: any = options('POST', body);
            let response: any = await fetch(`${url}${documento}`, optionsPost);
            try {
                if (response.status >= 200 && response.status < 300) {
                    return { paciente: optionsPost.body };
                }
                if (response.status === 404) {
                    // paciente no encontrado
                    return { paciente: null };
                }
            } catch (error) {
                log.error('postPacienteSP:error', { pacienteSP, response }, error, fakeRequest);
                return null;
            }

        } catch (error) {
            log.error('postPacienteSP:error', { pacienteSP }, error, fakeRequest);
        }
    }
    return null;
}
