import { Microservice, Middleware } from '@andes/bootstrap';
let pkg = require('./package.json');

let ms = new Microservice(pkg);

const router = ms.router();

router.group('/example', (group) => {
    group.use(Middleware.authenticate());
    group.get('/', (_req, res) => {
        res.json({msg: 'This is an example'});
    });
    group.get('/all', (_req, res) => {
        res.json({msg: 'ALL'});
    });
});

ms.add(router);
ms.start();
