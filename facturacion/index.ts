import { logDatabase, SipsDBConfiguration, fakeRequestSql } from './config.private';
import { Factura } from './factura';
import { facturaBuscador, facturaTurno, facturaRup } from './facturar/dto-facturacion';

import { Microservice } from '@andes/bootstrap';
let pkg = require('./package.json');
let ms = new Microservice(pkg);
import * as sql from 'mssql';

import { Connections, log } from '@andes/log';

const router = ms.router();

router.group('/facturacion', (group) => {
    Connections.initialize(logDatabase.log.host, logDatabase.log.options);

    group.post('/facturar', async (req, res) => {
        try {
            sql.close();
            let pool = await sql.connect(SipsDBConfiguration);
            console.log("LLegaaaa: ");
            const event = req.body.event;
            const data = req.body.data;

            let dtoFacturacion: any;
            switch (event) {
                case 'facturacion:factura:buscador':
                    dtoFacturacion = await facturaBuscador(data);
                    break;
                case 'facturacion:factura:recupero_financiero':
                    dtoFacturacion = await facturaTurno(data);
                    break;
                case 'rup:prestacion:validate':
                    dtoFacturacion = await facturaRup(data);
                    break;
                default:
                    await log(fakeRequestSql, 'microservices:factura:create', null, '/Origen facturación inválido', null, error);
                    break;
            }

            let factura = new Factura();
            for (let x = 0; x < dtoFacturacion.length; x++) {
                await factura.facturar(pool, dtoFacturacion[x]);
            }
        } catch (error) {
            console.log("Error: ", error);
            await log(fakeRequestSql, 'microservices:factura:create', null, '/error en la conexión sql', null, error);
        }
        sql.close();
        res.json('OK');
    });
});

ms.add(router);
ms.start();
