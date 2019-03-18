import { Microservice } from '@andes/bootstrap';
import { Connections } from '@andes/log';
import { logDatabase } from './config.private';
import { conexionPaciente } from './controller/ejecutaConsulta';
let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();
const PQueue = require('p-queue');
router.group('/pacienteSumar', (group) => {
    Connections.initialize(logDatabase.log.host, logDatabase.log.options);
    const queue = new PQueue({ concurrency: 1 });
    group.post('/create', async (_req: any, res) => {
        res.send({ message: 'ok' });
        const paciente = _req.body.data;
        if (paciente) {
            await conexionPaciente(paciente);
        }
    });
    group.put('/update', async (_req: any, res) => {
        res.send({ message: 'ok' });
        const paciente = _req.body.data;
        if (paciente) {
            await conexionPaciente(paciente);
        }
    });


});

ms.add(router);
ms.start();
