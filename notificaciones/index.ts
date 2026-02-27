import { Microservice } from '@andes/bootstrap';
import { request } from './controller/notificaciones';
import * as config from './config.private';
import * as crypto from 'crypto';

let pkg = require('./package.json');
let ms = new Microservice(pkg);

const router = ms.router();

router.group('/notificaciones', (group) => {

    group.post('/sendMessage', async (req, res) => {
        res.send({ message: 'ok' });
        await request(req, "POST", "send-message");
    });

    group.post('/sendReminder', async (req, res) => {
        res.send({ message: 'ok' });
        await request(req, "POST", "send-reminder");
    });

    group.post('/sendSurvey', async (req, res) => {
        res.send({ message: 'ok' });
        await request(req, "POST", "send-survey");
    });

    group.get('/fetchMessages', async (req, res) => {
        res.json(await request(req, 'POST', 'fetch-messages'));
    });

    group.post('/sendMedia', async (req, res) => {
        res.json(await request(req, 'POST', 'send-media'));
    });

    group.post('/sendLocation', async (req, res) => {
        res.json(await request(req, "POST", 'send-location'))
    });

    group.post('/webhook', async (req, res) => {
        console.log('webhook', req.body);
        let signature = req.headers['x-webhook-signature'] as string;
        if (!signature) {
            return res.status(401).send({ status: 'error', message: 'Missing signature' });
        }
        signature = signature.replace('sha256=', '');
        if (req.body?.event && req.body?.event === 'test') {
            return res.status(200).send({ status: 'ok' });
        }

        const hmac = crypto.createHmac('sha256', config.WEBHOOK_SECRET);
        const digest = hmac.update(JSON.stringify(req.body)).digest('hex');

        if (signature !== digest) {
            return res.status(401).send({ status: 'error', message: 'Invalid signature' });
        }

        res.status(200).send({ status: 'ok' });
        return await request(req, "POST", "webhook");
    });

});

ms.add(router);
ms.start();