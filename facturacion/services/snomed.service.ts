import { ANDES_HOST, ANDES_KEY } from './../config.private';
import { promises } from 'fs';
const request = require('request');

export async function getSnomed(expression) {
    return new Promise((resolve, reject) => {
        const url = `${ANDES_HOST}/core/term/snomed/expression?expression=${expression}`;
        request(url, (error, response, body) => {
            if (!error && response.statusCode >= 200 && response.statusCode < 300) {
                const exp: any[] = JSON.parse(body);
                resolve(exp);
            }
            return reject(error || body);
        });
    });
}