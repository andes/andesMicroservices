import { Microservice, MSRouter, Middleware } from './../bootstrap';
import { importarDatos } from './controller/import-labs';
let pkg = require('./package.json');

let ms = new Microservice(pkg);

const router = MSRouter();

router.group('/cda', (group) => {
    // group.use(Middleware.authenticate());
    group.post('/ejecutar', (req, res) => {
        res.send({ message: 'ok' });

        importarDatos(req.body.paciente);
    });


});

ms.add(router);
ms.start();
