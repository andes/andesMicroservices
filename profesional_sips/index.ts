import { Microservice } from '@andes/bootstrap';
import { Connections } from '@andes/log';
import { logDatabase } from '../config.private';
import { conexionProfesional } from './controller/ejecutaConsulta';

import * as operaciones from './service/operaciones.service';
let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();

router.group('/profesionalSips', (group) => {
    Connections.initialize(logDatabase.log.host, logDatabase.log.options);

    group.post('/create', async (_req: any, res) => {
        res.send({ message: 'ok' });
        const profesional = _req.body.data;
        if (profesional) {
            let prof = await operaciones.getProfesional(profesional.id);
            await conexionProfesional(prof);
        }

    });
});

ms.add(router);
ms.start();
