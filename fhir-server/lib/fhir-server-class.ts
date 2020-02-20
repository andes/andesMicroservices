import * as jwt from 'jsonwebtoken';
import { request } from './request';

export class FhirServerClass {

    private expiresIn = 60 * 15 * 1000;  /* 15 min */
    private secret: string;
    // Queda pendiente la parte de AUTH para la interacción con el servidor de ASYMMETRIK
    // private token = '';

    async populate(resource: any, url: string, method: string) {
        const options = {
            url,
            method,
            json: true,
            body: resource,
            headers: {
                'Content-Type': 'application/json+fhir',
                // Authorization: `Bearer ${this.token}`
            }
        };
        const [status, body] = await request(options);
        return status >= 200 && status <= 299;
    }

    async search(url: any) {
        const options = {
            url,
            method: 'GET',
            json: true,
            headers: {
                'Content-Type': 'application/json+fhir',
                // Aca va el token que quedo pendiente
                // Authorization: `Bearer ${this.token}`
            }
        };
        const [status, body] = await request(options);
        return (body.length > 0 ? body[0].id : null);
    }
}
