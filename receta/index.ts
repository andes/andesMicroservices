import { Microservice } from '@andes/bootstrap';
import { prescriptionEncode } from './controller/prescription-conversion';

let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();

router.group('/receta', (group) => {
    group.post('/ejecutar', async (req: any, res) => {
        res.send({ message: 'ok' });
        const id = req.body.id;
        const webhookId = req.body.subscription;
        const event = req.body.event;
        const data = req.body.data;
        // Aca va a haber un switch con las distintas operaciones sobre la receta
        if (event === 'prestacion:receta:create') { // Caso de creación
            if (data.registro.elementoRUP === '5f601fbf49fe85f5830649f8') {
                prescriptionEncode(data);
            }

        }
    });
});

ms.add(router);
ms.start();
