import { SipsDBConfiguration, mongoDB } from './config.private';
import { Factura } from './factura';

import { Microservice, Middleware } from '@andes/bootstrap';
let pkg = require('./package.json');

let ms = new Microservice(pkg);

import { ConnectionPool } from 'mssql';

const mongoose = require('mongoose');

const router = ms.router();

router.group('/facturacion', (group) => {
    group.post('/facturar', (req, res) => {
        // mongoose.connect('mongodb://localhost:27017/andes', { useNewUrlParser: true });
        // mongoose.connect('mongodb://admin:golitoMon04@10.1.62.19:27017/andes?authSource=admin', { useNewUrlParser: true });
        mongoose.connect(mongoDB.mongoDB_main.host, mongoDB.mongoDB_main.options, { useNewUrlParser: true });

        let pool = new ConnectionPool(SipsDBConfiguration);
        pool.connect(err => {
            if (err) {
                return err;
            }

        });

        let factura = new Factura();

        factura.facturar(pool, req.body.data);
    });
});

ms.add(router);
ms.start();
