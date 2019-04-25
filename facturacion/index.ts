import { SipsDBConfiguration, mongoDB } from './config.private';
import { Factura } from './factura';
import { facturacionAutomatica } from './facturar/dto-facturacion';

import { Microservice } from '@andes/bootstrap';
let pkg = require('./package.json');
let ms = new Microservice(pkg);
import * as sql from 'mssql';

const mongoose = require('mongoose');
const router = ms.router();

router.group('/facturacion', (group) => {
    mongoose.connect(mongoDB.mongoDB_main.host, { useNewUrlParser: true });
    group.post('/facturar', async (req, res) => {
        try {
            sql.close();
            let pool = await sql.connect(SipsDBConfiguration);
            let dtoFacturacion: any = await facturacionAutomatica(req.body.data);
            let factura = new Factura();
            await factura.facturar(pool, dtoFacturacion);
        } catch (e) {
            console.log('ERROR:', e);
        }
        sql.close();
        res.json('OK');
    });
});

ms.add(router);
ms.start();
