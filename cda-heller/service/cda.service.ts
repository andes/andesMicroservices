import { ANDES_HOST, ANDES_KEY } from './../config.private';
const request = require('request');
import { log } from '@andes/log';


import * as ConfigPrivate from './../config.private';

export function postCDA(data: any) {
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
        request(options, (error, response, body) => {
            if (response.statusCode >= 200 && response.statusCode < 300) {
                return resolve(body);
            }

            let fakeRequestSql = {
                user: {
                    usuario: 'msHeller',
                    app: 'integracion-heller',
                    organizacion: 'sss'
                },
                ip: ConfigPrivate.staticConfiguration.heller.ip,
                connection: {
                    localAddress: ''
                }
            };
            log(fakeRequestSql, 'microservices:integration:heller', undefined, 'postCDA:heller', body, error);
            return resolve(error || body);
        });
    });
}
