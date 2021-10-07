import { ANDES_HOST, ANDES_KEY, fakeRequest } from './../config.private';
import { log } from '@andes/log';

const request = require('request');

export function patch(id, fields) {
    return new Promise((resolve: any, reject: any) => {
        const seccion = 'Tipo de confirmación y Clasificación Final';
        const url = `${ANDES_HOST}/modules/forms/forms-epidemiologia/formEpidemiologia/${id}/secciones/fields`;
        const options = {
            url,
            method: 'PATCH',
            json: true,
            body: { seccion, fields },
            headers: {
                Authorization: `JWT ${ANDES_KEY}`
            }
        };
        
        request(options, (error, response, body) => {
            if (response.statusCode >= 200 && response.statusCode < 300) {
                return resolve(body);
            }
            return resolve(error || body);
        });
    });
}
