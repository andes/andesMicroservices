import * as bodyParser from 'body-parser';
import * as HttpStatus from 'http-status-codes';
import { Express } from 'express';
// import * as config from './config';
// import { Auth } from './auth/auth.class';


export function initAPI(app: Express, router: any) {
    // Inicializa la autenticación con Passport/JWT
    // Auth.initialize(app);

    // Configura Express
    app.use(bodyParser.json({ limit: '150mb' }));
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(router);
    // Error handler
    app.use(function (err: any, req: any , res: any, next: any) {
        if (err) {
            // Parse err
            let e: Error;
            if (!isNaN(err)) {
                e = new Error(HttpStatus.getStatusText(err));
                (e as any).status = err;
                err = e;
            } else {
                if (typeof err === 'string') {
                    e = new Error(err);
                    (e as any).status = 400;
                    err = e;
                } else {
                    err.status = 500;
                }
            }

            // Send response
            res.status(err.status);
            res.send({
                message: err.message,
                error: (app.get('env') === 'development') ? err : null
            });
        }
    });
}
