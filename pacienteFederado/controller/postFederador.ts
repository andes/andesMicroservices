import { pacienteFederado } from '../schemas/pacienteFederado';
import { log } from '@andes/log';
const request = require('request');

export function postFederador(data: any) {
    return new Promise((resolve: any, reject: any) => {
        const url = 'https://testapp.hospitalitaliano.org.ar/masterfile-federacion-service/fhir/Patient/';
        const options = {
            url,
            method: 'POST',
            json: true,
            body: data,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        request(options, (error, response, body) => {
            let respuesta = '';
            if (response && response.statusCode >= 200 && response.statusCode < 300) {
                respuesta = response.caseless.get('location');
                return resolve(body);
            }
            if (error != null) {
                let fakeRequest = {
                    user: {
                        usuario: 'Federador',
                        app: 'federador',
                        organizacion: 'Nah'
                    },
                    ip: 'localhost',
                    connection: {
                        localAddress: ''
                    }
                };
                log(fakeRequest, 'federador', data, 'postFederador', body, error);
            }
            let bodyResponse;
            if (response && response.body) {
                bodyResponse = response.body;
            }

            // const pac_federado = new pacienteFederado({
            //     idPaciente: pacienteFederado.identifier[0].value,
            //     respuesta,
            //     body: bodyResponse

            // });
            // pac_federado.save();
            return resolve(error || body);
        });
    });
}
