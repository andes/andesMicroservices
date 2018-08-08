import { Microservice, MSRouter, Middleware } from './../bootstrap';
let pkg = require('./package.json');
import * as configPrivate from './config.private';
import * as ejecutaCDA from './controller/ejecutaCDA';
import * as efectores from './constantes';

let ms = new Microservice(pkg);

const router = MSRouter();

// Empezar a codear como loco!!!!!!!!!

router.group('/cda', (group) => {
    // group.use(Middleware.authenticate());
    group.post('/ejecutar/:efector', (req: any, res) => {

        let target = req.params.efector;
        let paciente = req.body;
        
        let listaEfectores = Object.keys(efectores);
        var index = listaEfectores.indexOf(target);

        if (index !== -1) {
            ejecutaCDA.ejecutar(target, paciente);
        } else {
            console.log('Para ejecutar este proceso correctamente, deberá pasar como argumento algo de los siguientes: ', prop);
        }
    });
    group.get('/all', (_req, res) => {
        res.json({ msg: 'ALL' });
    });
});

ms.add(router);
ms.start();
