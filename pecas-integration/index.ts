import { Microservice } from '@andes/bootstrap';
import { setInPecas } from './controller/export-data';
import { Connections } from '@andes/log';
import { logDatabase } from './config.private';

let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();

router.group('/bi', (group) => {
    // group.use(Middleware.authenticate());
    group.post('/pecas', async (req: any, res) => {
        res.send({ message: 'ok' });
        // Conexión a la base de datos de logs: andesLogs
        Connections.initialize(logDatabase.log.host, logDatabase.log.options);
        const id = req.body.id;
        const webhookId = req.body.subscription;
        const event = req.body.event;
        const data = req.body.data;

        let agenda = data;
        if (agenda) {
            await setInPecas(agenda);
        }
    });
});

ms.add(router);
ms.start();
