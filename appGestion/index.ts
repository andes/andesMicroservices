import { Microservice, Middleware } from '@andes/bootstrap';
import { recuperaDatos } from './controller/recuperaDatos';
let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();

router.group('/mobile', (group) => {
    // group.use(Middleware.authenticate());
    group.get('/migrar', async (_req, res) => {
        let lista = [];
        const registros = await recuperaDatos();
        if (registros.length > 0) {
            registros.map(async registro => {
                lista = lista.concat(registro);
            });
        }
        res.json(lista);
    });
});

ms.add(router);
ms.start();
