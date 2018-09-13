import { Microservice } from '@andes/bootstrap';
import * as ejecutaCDA from './controller/ejecutaCDA';
import * as efectores from './constantes';

let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();

router.group('/cda', (group) => {
    // group.use(Middleware.authenticate());
    group.post('/ejecutar', async (req: any, res) => {
        res.send({ message: 'ok' });

        const id = req.body.id;
        const webhookId = req.body.subscription;
        const event = req.body.event;
        const data = req.body.data;
        const paciente = data.paciente;

        if (paciente) {
            const listaEfectores: any = Object.keys(efectores);
            for (let i = 0; i < listaEfectores.length; i++) {
                await ejecutaCDA.ejecutar(listaEfectores[i], paciente);
            }
        }
    });
});

ms.add(router);
ms.start();
