import { Microservice, Middleware } from '@andes/bootstrap';
import { importarDatos } from './controller/import-labs';
let pkg = require('./package.json');

let ms = new Microservice(pkg);

const router = ms.router();

router.group('/cda', (group) => {
    // group.use(Middleware.authenticate());
    group.post('/ejecutar', (req, res) => {
        res.send({ message: 'ok' });

        const id = req.body.id;
        const webhookId = req.body.subscription;
        const event = req.body.event;
        const data = req.body.data;

        let paciente;
        switch (event) {
            case 'mobile:patient:login':
                paciente = data.pacientes[0];
                break;
            default:
                paciente = data.paciente;
                break;
        }

        // Esperamos el paciente desde una prestación.
        if (paciente) {
            importarDatos(paciente);
        }
    });


});

ms.add(router);
ms.start();
