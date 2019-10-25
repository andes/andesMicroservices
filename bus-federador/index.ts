import { Microservice } from '@andes/bootstrap';
import { federar } from './lib/federar';

const pkg = require('./package.json');

const ms = new Microservice(pkg);
const router = ms.router();

router.post('/federar', async (req: any, res) => {
    try {
        const id = req.body.id;
        const webhookId = req.body.subscription;
        const event = req.body.event;
        const data = req.body.data;

        if (data.estado === 'validado') {
            federar(data);
        }

        res.json({ status: 'OK' });
    } catch (ex) {
        return ex;
    }
});

ms.add(router);
ms.start();

