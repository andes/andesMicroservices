import * as jwt from 'jsonwebtoken';
import { request } from './request';

export class SaludDigitalClient {
    static SystemPatient = 'https://federador.msal.gob.ar/patient-id';

    private expiresIn = 60 * 15 * 1000;  /* 15 min */
    private token: string;
    private host: string;
    private dominio: string;
    private secret: string;

    constructor(dominio, host, secret) {
        this.dominio = dominio;
        this.host = host;
        this.secret = secret;
    }

    getDominio() {
        return this.dominio;
    }

    generacionTokenAut({ name, role, ident, sub }): any {
        const payload = { name, role, ident, sub };
        return jwt.sign(payload, this.secret, {
            expiresIn: this.expiresIn,
            issuer: this.dominio,
            audience: `${this.host}/bus-auth/auth`
        });
    }

    /**
     * Obtención de token de autenticacion
     */
    async obtenerToken(payload) {
        const token: any = this.generacionTokenAut(payload);
        const url = `${this.host}/bus-auth/auth`;

        const options = {
            url,
            method: 'POST',
            json: true,
            body: {
                grantType: 'client_credentials',
                scope: 'Patient/*.read,Patient/*.write',
                clientAssertionType: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
                clientAssertion: token
            },
        };
        const [status, body] = await request(options);
        this.token = body.accessToken;
        return this.token;

    }

    /**
     * Valida un accessToken
     */

    async validarToken(token: any) {
        const url = `${this.host}/bus-auth/tokeninfo`;
        const options = {
            url,
            method: 'POST',
            json: true,
            body: {
                accessToken: token
            },
        };
        const [status, body] = await request(options);
        return status >= 200 && status <= 299;
    }

    async federar(patient: any) {
        const url = `${this.host}/masterfile-federacion-service/fhir/Patient/`;
        const options = {
            url,
            method: 'POST',
            json: true,
            body: patient,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.token}`
            }
        };
        const [status, body] = await request(options);
        return status >= 200 && status <= 299;
    }

    async search(params: any) {
        const url = `${this.host}/masterfile-federacion-service/fhir/Patient/`;
        const options = {
            url,
            method: 'GET',
            qs: params,
            json: true,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.token}`
            }
        };
        const [status, bundle] = await request(options);
        return (bundle.total > 0 ? bundle.entry.map(e => e.resource) : []);
    }
}