import * as bodyParser from 'body-parser';
import * as HttpStatus from 'http-status-codes';
import { Express } from 'express';
import * as express from 'express';
import { initialize } from './auth';
import * as debug from 'debug';

const log = debug('bootstrap');

interface MSRouter extends express.Router {
    group (path:String, callback: (router: MSRouter) => void) : void;
    group (callback: (router: MSRouter) => void) : void;
}

export function MSRouter () : MSRouter {
    let r = express.Router.apply(this, arguments);
    r.group = function (arg1, arg2) {
        let fn, path;
        if (arg2 === undefined) {
            path = '/';
            fn = arg1;
        } else {
            path = arg1;
            fn = arg2
        }
    
        let router = MSRouter();
        fn(router);
        this.use(path, router);
        return router;
    };
    return r;
}

export function Router () : express.Router {
    return express.Router();
}

export { Middleware } from './auth';

export class Microservice {
    private _app: Express;
    private _routes: any[] = [];
    constructor () {

    }

    add (router) {
        this._routes.push(router);
    }

    start () {
        const port = process.env.PORT || 3000;
        const app = this._app = express();

        initialize(app);

        // Configura Express
        app.use(bodyParser.json({ limit: '150mb' }));
        app.use(bodyParser.urlencoded({
            extended: true
        }));

        app.get('/alive', (_req, res) => {
            res.json({ status: 'OK' });
        });

        for (let router of this._routes) {
            app.use(router);
        }

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

        app.listen(port, () => {
            log(`Listening on port ${port}`);
        });
        return app;
    }


}
