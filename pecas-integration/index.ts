import { Microservice } from '@andes/bootstrap';
import { setInPecas } from './controller/export-data';

let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();

router.group('/bi', (group) => {
    // group.use(Middleware.authenticate());
    group.post('/pecas', async (req: any, res) => {
        res.send({ message: 'ok' });

        const id = req.body.id;
        const webhookId = req.body.subscription;
        const event = req.body.event;
        const data = req.body.data;

        let agenda = data;
        // console.log('La agenda es: ', agenda);
        if (agenda) {
            await setInPecas(agenda);
        }

    });
});

ms.add(router);
ms.start();
