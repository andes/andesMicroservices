import { SipsDBConfiguration, mongoDB } from './config.private';
import { Factura } from './factura';

import { Microservice } from '@andes/bootstrap';
let pkg = require('./package.json');
let ms = new Microservice(pkg);
import * as sql from 'mssql';

import { IDtoFacturacion } from './interfaces/IDtoFacturacion';

const mongoose = require('mongoose');

const router = ms.router();

router.group('/facturacion', (group) => {
    mongoose.connect(mongoDB.mongoDB_main.host, { useNewUrlParser: true });
    group.post('/facturar', async (req, res) => {
        sql.close();
        let pool = await sql.connect(SipsDBConfiguration);

        let dtoFacturacion: IDtoFacturacion = req.body.data;
        let factura = new Factura();

        factura.facturar(pool, dtoFacturacion);
    });
});

ms.add(router);
ms.start();
