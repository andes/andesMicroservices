import { Microservice } from '@andes/bootstrap';
import { setInPecas } from './controller/export-data';
import { Connections } from '@andes/log';
import { logDatabase, database } from './config.private';
let pkg = require('./package.json');
let ms = new Microservice(pkg);
const PQueue = require('p-queue');
const router = ms.router();

router.group('/bi', (group) => {
    // group.use(Middleware.authenticate());
    // Conexión a la base de datos de logs: andesLogs
    Connections.initialize(logDatabase.log.host, logDatabase.log.options);
    // Creamos la cola, con concurrencia de 1 solo request
    const queue = new PQueue({ concurrency: 1 });

    group.post('/pecas', async (req: any, res) => {
        res.send({ message: 'ok' });
        const id = req.body.id;
        const webhookId = req.body.subscription;
        const event = req.body.event;
        const data = req.body.data;

        let agenda = data;
        let condicionPecas = agenda && agenda.estado !== 'planificacion' && agenda.estado !== 'borrada' && agenda.bloques !== null && !agenda.bloques.some(b => b.turnos === null);

        if (condicionPecas) {
            queue.add(async () => {
                let rta = await setInPecas(agenda);
            });

            // setInPecas(agenda);
        }
    });
});

ms.add(router);
ms.start();
