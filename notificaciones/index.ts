import { Microservice } from '@andes/bootstrap';
import { notificacionesLog } from './logger/notificacionesLog'
import { request } from './controller/notificaciones';

let pkg = require('./package.json');
let ms = new Microservice(pkg);

const fetch = require('node-fetch');
const log = notificacionesLog.startTrace();
const router = ms.router();

router.group('/notificaciones', (group) => {

    group.post('/sendMessage', async (req, res) => {
        res.json(await request(req, "POST", "send-message"));
    });

    group.get('/fetchMessages', async (req, res) => {
        res.json(await request(req, 'POST', 'fetch-messages'))
    });

    group.post('/sendMedia', async (req, res) => {
        res.json(await request(req, 'POST', 'send-media'));
    });

    group.post('/sendLocation', async (req, res) => {
        res.json(await request(req, "POST", 'send-location'))
    });

});

ms.add(router);
ms.start();