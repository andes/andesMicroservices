import { fakeRequest, logDatabase } from './config.private';
import { Microservice } from '@andes/bootstrap';
import { updateFichas } from './controller/lamp.controller';
let pkg = require('./package.json');
let ms = new Microservice(pkg);
import * as sql from 'mssql';

import { Connections, log } from '@andes/log';

const router = ms.router();

router.group('/lamp', (group) => {
    Connections.initialize(logDatabase.log.host, logDatabase.log.options);
    group.post('/ejecutar', async (req, res) => {
        try {
            const data = req.body.data;
            await updateFichas(data);
        } catch (error) {
            log(fakeRequest, 'lamp:ejecutar', null, '/error en la conexión sql', null, error);
        }
        sql.close();
        res.json('OK');
    });
});

ms.add(router);
ms.start();
