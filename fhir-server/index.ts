import { Microservice } from '@andes/bootstrap';
import { federar } from './lib/federar';

const pkg = require('./package.json');

const ms = new Microservice(pkg);
const router = ms.router();

router.post('/asymmetrik', async (req: any, res) => {
    try {
        /*
        Analizara si necesito esta información del evento más adelante.
        const id = req.body.id;
        const webhookId = req.body.subscription;
        const event = req.body.event;
        */
        const data = req.body.data;

        if (data.active === true) {
            federar(data);
        }
        res.json({ status: 'OK' });
    } catch (ex) {
        return ex;
    }
});

ms.add(router);
ms.start();

