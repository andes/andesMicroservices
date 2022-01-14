import { Microservice, Middleware } from '@andes/bootstrap';
import { importarDatos } from './controller/import-labs';
const PQueue = require('p-queue');
let pkg = require('./package.json');

let ms = new Microservice(pkg);

const router = ms.router();
const queue = new PQueue({ concurrency: 5 });

router.group('/cda', (group) => {
    // group.use(Middleware.authenticate());
    group.post('/ejecutar', async (req, res) => {
        res.send({ message: 'ok' });
        const id = req.body.id;
        const event = req.body.event;
        const data = req.body.data;

        let paciente;
        switch (event) {
            case 'mobile:patient:login':
                paciente = data.pacientes[0];
                break;
            case 'mpi:patient:update':
            case 'mpi:patient:create':
            case 'mpi:pacientes:update':
            case 'mpi:pacientes:create':
                paciente = data;
                break;
            default:
                paciente = data.paciente;
                break;
        }

        // Esperamos el paciente desde una prestación.
        if (paciente?.documento) {
            queue.add(() => {
                return importarDatos(paciente);
            });
        }
    });


});

ms.add(router);
ms.start();
