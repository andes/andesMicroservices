import { Microservice } from '@andes/bootstrap';
import { importarDatos } from './controller/import-labs';
import { Connections } from '@andes/log';
import { logDatabase } from './config.private';

const PQueue = require('p-queue');
let pkg = require('./package.json');

let ms = new Microservice(pkg);

const router = ms.router();
const queue = new PQueue({ concurrency: 5 });

router.group('/cda', (group) => {
    Connections.initialize(logDatabase.log.host, logDatabase.log.options);
    group.post('/labcentral/ejecutar', (req, res) => {
        res.send({ message: 'ok' });
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
        if (paciente) {
            queue.add(() => {
                return importarDatos(paciente);
            });
        }
    });
});

ms.add(router);
ms.start();
