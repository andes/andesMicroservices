import { Microservice } from '@andes/bootstrap';
import { Connections } from '@andes/log';
import { logDatabase } from './config.private';
import { conexionPaciente } from './controller/ejecutaConsulta';

import * as operaciones from './service/operaciones.service';
let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();
const PQueue = require('p-queue');
router.group('/pacienteSumar', (group) => {
    Connections.initialize(logDatabase.log.host, logDatabase.log.options);
    const queue = new PQueue({ concurrency: 1 });
    group.post('/create', async (_req: any, res) => {
        res.send({ message: 'ok' });
        const paciente = _req.body.data;
        if (paciente) {
            let idAndes = paciente.identifier.find((ids) => ids.assigner === 'andes');
            let pac = await operaciones.getPaciente(idAndes.value);
            await conexionPaciente(pac);
        }

    });
    group.put('/update', async (_req: any, res) => {
        res.send({ message: 'ok' });
        const paciente = _req.body.data;
        if (paciente) {
            let idAndes = paciente.identifier.find((ids) => ids.assigner === 'andes'); // PROX VERSION VA A CAMBIAR
            let pac = await operaciones.getPaciente(idAndes.value);
            await conexionPaciente(pac);
        }
    });


});

ms.add(router);
ms.start();
