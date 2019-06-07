import { ANDES_HOST, ANDES_KEY } from './../config.private';
const request = require('request');

export function postLogin(data: any) {

    return new Promise((resolve: any, reject: any) => {
        const url = `${ANDES_HOST}/modules/mobileApp/login`;
        data = JSON.parse(data);
        let datos = {
            email: data.email,
            password: data.password
        };
        const options = {
            url,
            method: 'POST',
            json: true,
            body: datos,
            headers: {
                Authorization: `JWT ${ANDES_KEY}`
            }
        };
        request(options, (response, body) => {
            let respuesta = {
                mensaje: body ? body.body.msj : '',
                estado: body ? body.statusCode : 422
            };
            return resolve(respuesta);

        });
    });
}
