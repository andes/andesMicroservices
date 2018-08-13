import { Microservice, MSRouter, Middleware } from './../bootstrap';
let pkg = require('./package.json');
import * as ejecutaCDA from './controller/ejecutaCDA';
import * as efectores from './constantes';
import * as bodyParser from 'body-parser';

let ms = new Microservice(pkg);

const router = MSRouter();

router.group('/cda', (group) => {
    // group.use(Middleware.authenticate());
    group.post('/ejecutar', (req: any, res) => {

        let paciente = req.body.data;
        let listaEfectores = Object.keys(efectores);
        // verificar que funcione bien en forma asincrona
        listaEfectores.forEach(e => {
            if (e) {
                ejecutaCDA.ejecutar(e, paciente);
            }
        });
    });
});

ms.add(router);
ms.start();
