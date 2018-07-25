import { Microservice, MSRouter, Middleware } from 'bootstrap';

let ms = new Microservice();

const router = MSRouter();

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
