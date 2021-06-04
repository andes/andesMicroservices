import { SIP_PLUS, fakeRequest } from '../config.private';
const fetch = require('node-fetch');
import { log } from '@andes/log';

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
            log(fakeRequest, 'microservices:integration:sip-plus', paciente, 'getPacienteSP:error', error);
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
            if (response.status >= 200 && response.status < 300) {
                return { paciente: optionsPost.body };
            }
            if (response.status === 404) {
                // paciente no encontrado
                return { paciente: null };
            }

        } catch (error) {
            log(fakeRequest, 'microservices:integration:sip-plus', pacienteSP, 'postPacienteSP:error', error);
        }
    }
    return null;
}