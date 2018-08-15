import { Microservice, MSRouter, Middleware } from './../bootstrap';
let pkg = require('./package.json');
import * as ejecutaCDA from './controller/ejecutaCDA';
import * as efectores from './constantes';

let ms = new Microservice(pkg);
const router = MSRouter();

router.group('/cda', (group) => {
    // group.use(Middleware.authenticate());
    group.post('/ejecutar', (req: any, res) => {

        let paciente = req.body.data;
        let listaEfectores = Object.keys(efectores);
        // verificar que funcione bien en forma asincrona
        listaEfectores.forEach(async e => {
            if (e) {
                console.log('por cada efector: ', e);
                await ejecutaCDA.ejecutar(e, paciente);
                console.log('luego de ejecutar el efector: ', e);
            }
        });
    });
});

ms.add(router);
ms.start();
