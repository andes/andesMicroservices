// import { SipsDBConfiguration, mongoDB, logDatabase } from './config.private';
import * as ConfigPrivate from './config.private';
import { Factura } from './factura';
import { facturacionAutomatica } from './facturar/dto-facturacion';

import { Microservice } from '@andes/bootstrap';
let pkg = require('./package.json');
let ms = new Microservice(pkg);
import * as sql from 'mssql';

import { Connections, log } from '@andes/log';

const mongoose = require('mongoose');
const router = ms.router();

router.group('/facturacion', (group) => {
    Connections.initialize(ConfigPrivate.logDatabase.log.host, ConfigPrivate.logDatabase.log.options);
    mongoose.connect(ConfigPrivate.mongoDB.mongoDB_main.host, { useNewUrlParser: true });
    group.post('/facturar', async (req, res) => {
        try {
            sql.close();
            let pool = await sql.connect(ConfigPrivate.SipsDBConfiguration);
            let dtoFacturacion: any = await facturacionAutomatica(req.body.data);
            let factura = new Factura();
            await factura.facturar(pool, dtoFacturacion);
        } catch (e) {
            let fakeRequestSql1 = {
                user: {
                    usuario: 'msFacturacion',
                    app: 'facturacion_automatica',
                    organizacion: 'sss'
                },
                ip: '192.168.1.999',
                connection: {
                    localAddress: ''
                }
            };
            await log(fakeRequestSql1, 'microservices:factura:create', null, '/error en la conexión', null, null, e);
        }
        sql.close();
        res.json('OK');
    });
});

ms.add(router);
ms.start();
