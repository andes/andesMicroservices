import { Microservice } from '@andes/bootstrap';
import { encode } from './controller/encodePaciente';
let pkg = require('./package.json');

let ms = new Microservice(pkg);

const router = ms.router();

router.group('/paciente', (group) => {
    // group.use(Middleware.authenticate());
    group.post('/create', (_req, res) => {
        res.send({ message: 'ok' });
        let pacienteFhir = encode(_req.body.data);
        //llamamos a una funcion de llamadaFLebes

    });
    group.put('/update', (_req, res) => {
        res.send({ message: 'ok' });
        let pacienteFhir = encode(_req.body.data);
        //llamamos a una funcion de llamadaFLebes

    });

});

ms.add(router);
ms.start();
