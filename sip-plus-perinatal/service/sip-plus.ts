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
    if (!documento) {
        return { paciente: null };
    }

    try {
        const response = await fetch(`${url}${documento}`, options('GET'));

        if (!response.ok) {
            if (response.status === 404) {
                // Paciente no encontrado
                return { paciente: null };
            }

            throw new Error(`HTTP ${response.status}`);
        }

        const responseJson = await response.json();

        return responseJson && Object.keys(responseJson).length
            ? { paciente: responseJson }
            : { paciente: null };

    } catch (error) {
        log.error(
            'getPacienteSP:error',
            { documento, url },
            error,
            fakeRequest
        );
        return { paciente: null };
    }
}

export async function postPacienteSP(documento: string = '', pacienteSP) {
    if (documento) {
        try {
            const body = JSON.stringify(pacienteSP);
            let optionsPost: any = options('POST', body);
            let response: any = await fetch(`${url}${documento}`, optionsPost);

            if (!response.ok) {
                if (response.status === 404) {
                    // Paciente no encontrado
                    return { paciente: null };
                }

                throw new Error(`HTTP ${response.status}`);
            }

            return { paciente: optionsPost.body };

        } catch (error) {
            log.error('postPacienteSP:error', { pacienteSP }, error, fakeRequest);
        }
    }
    return null;
}
