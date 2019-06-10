import { logDatabase, mongoDB, SipsDBConfiguration, fakeRequestSql } from './config.private';
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
    Connections.initialize(logDatabase.log.host, logDatabase.log.options);
    mongoose.connect(mongoDB.mongoDB_main.host, { useNewUrlParser: true });
    group.post('/facturar', async (req, res) => {
        try {
            sql.close();
            let pool = await sql.connect(SipsDBConfiguration);
            let dtoFacturacion: any = await facturacionAutomatica(req.body.data);
            let factura = new Factura();

            for (let x = 0; x < dtoFacturacion.length; x++) {
                await factura.facturar(pool, dtoFacturacion[x]);
            }
        } catch (error) {
            await log(fakeRequestSql, 'microservices:factura:create', null, '/error en la conexión sql', null, error);
        }
        sql.close();
        res.json('OK');
    });
});

ms.add(router);
ms.start();
