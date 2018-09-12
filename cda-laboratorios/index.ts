import { Microservice, MSRouter, Middleware } from './../bootstrap';
import { importarDatos } from './controller/import-labs';
let pkg = require('./package.json');

let ms = new Microservice(pkg);

const router = MSRouter();

router.group('/cda', (group) => {
    // group.use(Middleware.authenticate());
    group.post('/mpi', (req, res) => {
        importarDatos(req.body.paciente);
    });

    group.post('/citas', (req, res) => {
        importarDatos(req.body.turno.paciente);
    });
});

ms.add(router);
ms.start();
