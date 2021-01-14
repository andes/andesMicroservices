import { Microservice } from '@andes/bootstrap';
import { exportSISA } from './controller/ejecutaConsulta';

import * as operaciones from './service/operaciones.service';
let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();

router.post('/profesionalSISA', async (_req: any, res) => {
    res.send({ message: 'ok' });
    const profesional = _req.body.data;
    if (profesional) {
        let prof = await operaciones.getProfesional(profesional._id);
        await exportSISA(prof);
    }
});

ms.add(router);
ms.start();
