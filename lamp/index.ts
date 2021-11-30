import { userScheduler } from './config.private';
import { Microservice } from '@andes/bootstrap';
import { updateFichas } from './controller/lamp.controller';
let pkg = require('./package.json');
let ms = new Microservice(pkg);
import * as sql from 'mssql';
import { Connections, log } from '@andes/log';
import { lampLog } from '../lamp/logger/lampLog';
const logLamp = lampLog.startTrace();
const router = ms.router();

router.group('/lamp', (group) => {
    group.post('/ejecutar', async (req, res) => {
        try {
            const data = req.body.data;
            await updateFichas(data);
        } catch (error) {
            await logLamp.error('lamp:ejecutar', req.body, error.message, userScheduler);
        }
        sql.close();
        res.json('OK');
    });
});

ms.add(router);
ms.start();
