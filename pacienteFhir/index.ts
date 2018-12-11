import { Microservice } from '@andes/bootstrap';
import { llamadaFlebes } from './controller/llamadaFlebes';
let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();


router.group('/paciente', (group) => {
    // group.use(Middleware.authenticate());
    group.post('/create', (_req, res) => {
        res.send({ message: 'ok' });
        console.log('llega', _req.body.data);
        if (_req.body.data) {
            llamadaFlebes(_req.body.data);
        }

    });
    group.put('/update', (_req, res) => {
        res.send({ message: 'ok' });

        console.log('llega', _req.body.data);
        if (_req.body.data) {
            llamadaFlebes(_req.body.data);
        }

    });

});
ms.add(router);
ms.start();
