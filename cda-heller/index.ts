import { Microservice } from '@andes/bootstrap';
import * as ejecutaCDA from './controller/ejecutaCDA';
let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();
import { userScheduler } from './config.private';
import { msCDAHellerLog } from './logger/msCDAHeller';
const log = msCDAHellerLog.startTrace();

router.group('/cda', (group) => {
    // group.use(Middleware.authenticate());
    group.post('/ejecutar', async (req: any, res) => {
        try {
            res.send({ message: 'ok' });

            const id = req.body.id;
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
            if (paciente && paciente.estado && paciente.estado === 'validado') {
                await ejecutaCDA.ejecutar(paciente);
                await ejecutaCDA.ejecutarMysql(paciente);
            }
        } catch (error) {
            log.error('cda-heller:post:ejecutar', { req }, error, userScheduler)
        }
    });
});

ms.add(router);
ms.start();
