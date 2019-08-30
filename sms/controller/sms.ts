import { SMS_USER, SMS_PASSWORD, SMS_SERVER } from '../config.private';
const request = require('request');

export function sendSms(data: any) {
    return new Promise((resolve: any, reject: any) => {
        const url = `${SMS_SERVER}/core/sms`;
        const options = {
            url,
            method: 'POST',
            auth: {
                user: SMS_USER,
                pass: SMS_PASSWORD
            },
            json: true,
            body: data
        };
        request(options, (body) => {
            let respuesta = {
                mensaje: body ? body.body.msj : '',
                estado: body ? body.statusCode : 422
            };
            return resolve(respuesta);

        });
    });
}
