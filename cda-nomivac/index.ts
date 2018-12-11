import { Microservice } from '@andes/bootstrap';
import { Connections } from '@andes/log';
import { logDatabase, database } from './config.private';
import { getVacunas } from './controller/sisa';
import * as Fhir from '@andes/fhir';

let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();

router.group('/cda', (group) => {
    // group.use(Middleware.authenticate());
    // Conexión a la base de datos de logs: andesLogs
    Connections.initialize(logDatabase.log.host, logDatabase.log.options);
    group.post('/nomivac', async (req: any, res) => {
        res.send({ message: 'ok' });
        try {
            const id = req.body.id;
            const webhookId = req.body.subscription;
            const event = req.body.event;
            const data = req.body.data;
            let paciente = Fhir.Patient.decode(data);
            if (paciente) {
                await getVacunas(paciente);
            }
        } catch (e) {
            throw e;
        }
    });
});
ms.add(router);
ms.start();
