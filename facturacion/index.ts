import { SipsDBConfiguration, mongoDB } from './config.private';
import { Factura } from './factura';

import { Microservice, Middleware } from '@andes/bootstrap';
let pkg = require('./package.json');
let ms = new Microservice(pkg);
// import { ConnectionPool } from 'mssql';
import * as sql from 'mssql';

const mongoose = require('mongoose');

const router = ms.router();

router.group('/facturacion', (group) => {
    group.post('/facturar', async (req, res) => {
        mongoose.connect(mongoDB.mongoDB_main.host, { useNewUrlParser: true });

        sql.close();
        let pool = await sql.connect(SipsDBConfiguration);

        let factura = new Factura();

        factura.facturar(pool, req.body.data);
    });
});

ms.add(router);
ms.start();
