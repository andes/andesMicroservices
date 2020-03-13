import { Microservice } from '@andes/bootstrap';
import * as ejecutaCDA from './controller/ejecutaCDA';
import { Connections } from './connections';
let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();

router.group('/cda', (group) => {
    // Connections.initialize(logDatabase.log.host, logDatabase.log.options);
    Connections.initialize();
    // group.use(Middleware.authenticate());
    group.post('/ejecutar', async (req: any, res) => {
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
        if (paciente) {
            await ejecutaCDA.ejecutar(paciente);
            await ejecutaCDA.ejecutarMysql(paciente);
        }
    });
});

ms.add(router);
ms.start();
