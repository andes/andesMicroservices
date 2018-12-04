import { Microservice } from '@andes/bootstrap';
import { setInPecas } from './controller/export-data';
import { Connections } from '@andes/log';
import { logDatabase, database } from './config.private';

let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();

router.group('/bi', (group) => {
    // group.use(Middleware.authenticate());
    group.post('/pecas', async (req: any, res) => {
        res.send({ message: 'ok' });
        const id = req.body.id;
        const webhookId = req.body.subscription;
        const event = req.body.event;
        const data = req.body.data;

        let agenda = data;
        if (agenda) {
            // Conexión a la base de datos de logs: andesLogs
            await Connections.initialize(logDatabase.log.host, logDatabase.log.options);
            await setInPecas(agenda);
            // Cierra la conexión a la bd
            await Connections.close(database);
        }
    });
});

ms.add(router);
ms.start();
