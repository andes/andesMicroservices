import { Microservice, MSRouter, Middleware } from './../bootstrap';
let pkg = require('./package.json');
import * as configPrivate from './config.private';
import * as ejecutaCDA from './controller/ejecutaCDA';

let ms = new Microservice(pkg);

const router = MSRouter();

// Empezar a codear como loco!!!!!!!!!

router.group('/cda', (group) => {
    // group.use(Middleware.authenticate());
    group.post('/ejecutar/:efector', (req: any, res) => {
        // console.log("Borye: ", req.body);
        let cs = configPrivate.efectores;
        let target = req.params.efector;
        let dni = req.body.data.documento;

        if (cs.indexOf(target, 0) >= 0) {
            ejecutaCDA.ejecutar(target, dni);
        } else {
            // console.log('Para ejecutar este proceso correctamente, deberá pasar como argumento algo de los siguientes: ', cs);
            // console.log('Ejemplo: node lib/scheduler.js heller');
        }
    });
    group.get('/all', (_req, res) => {
        res.json({ msg: 'ALL' });
    });
});

ms.add(router);
ms.start();
