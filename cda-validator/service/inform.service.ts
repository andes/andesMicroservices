import * as http from 'http';
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
export function getInforme(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (response: any) => {
            let chunks: any = [];
            response.on('data', (chunk) => {
                chunks.push(chunk);
            });
            response.on('end', () => {
                let informe = Buffer.concat(chunks);
                let i = 'data:application/pdf;base64,' + informe.toString('base64');
                return resolve(i);
            });
            response.on('error', async (err) => {
                await log(fakeRequest, 'microservices:integration:cda-validator', null, 'getInforme:error', null, { url }, err);
                return reject(err);
            });
        });
    });
}
