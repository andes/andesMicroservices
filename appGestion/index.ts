import { Microservice } from '@andes/bootstrap';
import { recuperaDatos } from './controller/recuperaDatos';

import { postLogin } from './service/login';
let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();

router.group('/mobile', (group) => {
    group.get('/migrar', async (_req: any, res) => {
        let lista = [];
        let usuario = _req.query.usuario;
        let login;
        try {
            login = await postLogin(usuario);
            if (login && login.estado >= 200 && login.estado < 300) {
                // migrar datos
                const registros = await recuperaDatos();
                if (registros.length > 0) {
                    registros.map(async registro => {
                        lista = lista.concat(registro);
                    });
                }
            }
            // devuelve un arreglo vacio en caso que no realizar la migración de datos
            res.json(lista);
        } catch (ex) {
            return ex;
        }


    });
});

ms.add(router);
ms.start();
