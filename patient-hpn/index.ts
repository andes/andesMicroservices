import { Microservice, Middleware } from '@andes/bootstrap';
import * as Operations from './controller/operations';
import { Connections } from '@andes/log';
import * as ConfigPrivate from './config.private';
import * as Fhir from '@andes/fhir';
let pkg = require('./package.json');

let ms = new Microservice(pkg);

const router = ms.router();

router.group('/paciente', (group) => {
    // group.use(Middleware.authenticate());
    Connections.initialize(ConfigPrivate.logDatabase.log.host, ConfigPrivate.logDatabase.log.options);
    group.post('/hpn', async (req: any, res) => {
        res.send({ message: 'ok' });

        const id = req.body.id;
        const webhookId = req.body.subscription;
        const event = req.body.event;
        const paciente = req.body.data;
        if (paciente) {
            let idAndes = paciente.identifier.find((ids) => ids.assigner === 'andes');
            let pac = Fhir.Patient.decode(paciente);
            pac['id'] = idAndes.value; // recupero el id de andes para poder guardarlo en la bd como referencia
            await Operations.integrar(pac);
        }
    });
});

ms.add(router);
ms.start();
