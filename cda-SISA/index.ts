import { Microservice } from '@andes/bootstrap';
import { process } from './controller/sisa.controller';

const PQueue = require('p-queue');
let pkg = require('./package.json');

let ms = new Microservice(pkg);

const router = ms.router();
const queue = new PQueue({ concurrency: 5 });

router.group('/cda', (group) => {
    group.post('/sisa', (req, res) => {
        res.send({ message: 'ok' });
        const data = req.body.data;
        const caso = data.caso;
        queue.add(() => {
            return process(caso);
        });
    })
});


ms.add(router);
ms.start();
