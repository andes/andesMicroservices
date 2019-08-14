import { Microservice } from '@andes/bootstrap';
import * as ejecutaCDA from './controller/ejecutaCDA';
import { efectores } from './constantes';
import { queries } from './controller/queries/queries';

let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();

router.group('/cda', (group) => {
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
            for (const efector of efectores) {
                const factory = queries(efector, paciente);
                await ejecutaCDA.ejecutar(factory, paciente);
            }
        }
    });
});

ms.add(router);
ms.start();
