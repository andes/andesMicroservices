import { Microservice, MSRouter, Middleware } from './../bootstrap';
import * as ejecutaCDA from './controller/ejecutaCDA';
import * as efectores from './constantes';

let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = MSRouter();

router.group('/cda', (group) => {
    // group.use(Middleware.authenticate());
    group.post('/ejecutar', async (req: any, res) => {
        let paciente = req.body.data;
        let listaEfectores: any = Object.keys(efectores);

        for (let i = 0; i < listaEfectores.length; i++) {
            await ejecutaCDA.ejecutar(listaEfectores[i], paciente);
        }
        res.send({ message: 'ok' });
    });
});

ms.add(router);
ms.start();
