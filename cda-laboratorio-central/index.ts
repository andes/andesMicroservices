import { Microservice } from '@andes/bootstrap';
import { importarDatos } from './controller/import-labs';
import { Connections } from '@andes/log';
import { logDatabase } from './controller/config.private';

const PQueue = require('p-queue');
let pkg = require('./package.json');

let ms = new Microservice(pkg);

const router = ms.router();
const queue = new PQueue({ concurrency: 5 });

router.group('/cda', (group) => {
    Connections.initialize(logDatabase.log.host, logDatabase.log.options);

    group.post('/labcentral/ejecutar', (req, res) => {
        res.send({ message: 'ok' });

        const data = req.body.data;
        const paciente = data.paciente;
        if (paciente) {
            queue.add(() => {
                return importarDatos(paciente);
            });
        }
    });
});

ms.add(router);
ms.start();
