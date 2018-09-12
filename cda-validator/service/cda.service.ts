import * as http from 'http';
import * as ConfigPrivate from './../config.private';

declare const Promise;

export class CdaBuilder {
    build(data: any) {
        return new Promise((resolve: any, reject: any) => {
            let options = {
                host: ConfigPrivate.staticConfiguration.network.host,
                port: ConfigPrivate.staticConfiguration.network.port,
                Authentication: ConfigPrivate.staticConfiguration.secret.token,
                path: ConfigPrivate.staticConfiguration.URL.cda + '/create',
                method: 'POST',
                headers: {
                    Authorization: ConfigPrivate.staticConfiguration.secret.token,
                    'Content-Type': 'application/json',
                }
            };
            let req = http.request(options, (res) => {
                res.on('data', (body) => {
                    resolve(body.toString());
                });
            });
            req.on('error', (e) => {
                reject(e.message);
            });
            /*write data to request body*/

            req.write(JSON.stringify(data));
            req.end();
        });
    }
}
