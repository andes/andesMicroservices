import { Microservice, MSRouter, Middleware } from './../bootstrap';
let pkg = require('./package.json');
import * as ejecutaCDA from './controller/ejecutaCDA';
import * as efectores from './constantes';

let ms = new Microservice(pkg);

const router = MSRouter();

router.group('/cda', (group) => {
    // group.use(Middleware.authenticate());
    group.post('/ejecutar/:efector', (req: any, res) => {

        let target = req.params.efector;
        let paciente = req.body.data;
        // Modificar aca y poner un foreach para hacer la consulta para cada efector
        let listaEfectores = Object.keys(efectores);
        var index = listaEfectores.indexOf(target);

        if (index !== -1) {
            ejecutaCDA.ejecutar(target, paciente);
        }
    });
});

ms.add(router);
ms.start();
