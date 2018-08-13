import * as http from 'http';

export class InformBuilder {
    build(url) {
        return new Promise((resolve, reject) => {
            http.get(url, function (response: any) {
                let chunks: any = [];
                response.on('data', function (chunk) {
                    chunks.push(chunk);
                });
                response.on('end', function () {
                    let informe = Buffer.concat(chunks);
                    let i = 'data:application/pdf;base64,' + informe.toString('base64');
                    return resolve(i);
                });
            });
        });
    }
}
