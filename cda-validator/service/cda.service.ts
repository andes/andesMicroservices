import { ANDES_HOST, ANDES_KEY } from './../config.private';
const request = require('request');
import { log } from '@andes/log';
let fakeRequest = {
    user: {
        usuario: '',
        app: 'rup:prestacion:create',
        organizacion: 'sss'
    },
    ip: '',
    connection: {
        localAddress: ''
    }
};
export function postCDA(data: any, efector) {
    return new Promise((resolve: any, reject: any) => {
        const url = `${ANDES_HOST}/modules/cda/create`;
        const options = {
            url,
            method: 'POST',
            json: true,
            body: data,
            headers: {
                Authorization: `JWT ${ANDES_KEY}`
            }
        };
        request(options, async (error, response, body) => {
            if (response.statusCode >= 200 && response.statusCode < 300) {
                return resolve(body);
            }
            await log(fakeRequest, 'microservices:integration:cda-validator', data.paciente.id, 'postCDA:error', null, { datos: data, body, efector }, error);

            return resolve(error || body);
        });
    });
}
