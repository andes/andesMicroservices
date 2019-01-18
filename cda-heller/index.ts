import { Microservice } from '@andes/bootstrap';
import * as ejecutaCDA from './controller/ejecutaCDA';
import { Connections } from '@andes/log';
import { logDatabase } from './config.private';
import * as ConfigPrivate from './config.private';
import { log } from '@andes/log';
let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();
let fakeRequestSql = {
    user: {
        usuario: 'msHeller',
        app: 'integracion-heller',
        organizacion: 'sss'
    },
    ip: ConfigPrivate.staticConfiguration.heller.ip,
    connection: {
        localAddress: ''
    }
};
let fakeRequestMysql = {
    user: {
        usuario: 'msHeller',
        app: 'integracion-heller',
        organizacion: 'sss'
    },
    ip: ConfigPrivate.staticConfiguration.hellerMysql.ip,
    connection: {
        localAddress: ''
    }
};
router.group('/cda', (group) => {
    Connections.initialize(logDatabase.log.host, logDatabase.log.options);
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
            log(fakeRequestSql, 'microservices:integration:heller', paciente.id, '/ejecuta CDA exito', null);
            await ejecutaCDA.ejecutarMysql(paciente);
            log(fakeRequestMysql, 'microservices:integration:heller', paciente.id, '/ejecutaMysql CDA exito', null);

        }
    });
});

ms.add(router);
ms.start();
