import { Microservice } from '@andes/bootstrap';
import { decode } from './controller/decodePacienteHeller';
import { Connections } from '@andes/log';
import { logDatabase } from './config.private';
import { conexionPaciente } from './controller/consultas';
import * as ConfigPrivate from './config.private';
let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();

import { log } from '@andes/log';
const PQueue = require('p-queue');
import * as Fhir from '@andes/fhir';

let fakeRequest = {
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
router.group('/paciente', (group) => {
    Connections.initialize(logDatabase.log.host, logDatabase.log.options);
    const queue = new PQueue({ concurrency: 1 });
    group.post('/create', async (_req: any, res) => {
        res.send({ message: 'ok' });
        const paciente = _req.body.data;
        if (paciente) {
            let idAndes = paciente.identifier.find((ids) => ids.assigner === 'andes');
            let pac = Fhir.Patient.decode(paciente);
            pac['id'] = idAndes.value;
            queue.add(() => conexionPaciente(pac).then(() => {
            }));
            log(fakeRequest, 'microservices:integration:heller', idAndes.value, '/create exito', null);

        }
    });
    group.put('/update', async (_req: any, res) => {
        res.send({ message: 'ok' });

        const paciente = _req.body.data;
        if (paciente) {
            let idAndes = paciente.identifier.find((ids) => ids.assigner === 'andes');
            let pac = Fhir.Patient.decode(paciente);
            pac['id'] = idAndes.value;
            queue.add(() => conexionPaciente(pac).then(() => {
            }));
            log(fakeRequest, 'microservices:integration:heller', idAndes.value, '/update exito', null);

        }


    });

});

ms.add(router);
ms.start();
