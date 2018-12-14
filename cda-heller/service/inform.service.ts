import * as http from 'http';

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
            response.on('error', (err) => {
                return reject(err);
            });
        });
    });
}
