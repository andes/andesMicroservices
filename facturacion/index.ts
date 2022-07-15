import { logDatabase, SipsDBConfiguration } from './config.private';
import { Factura } from './factura';
import { facturaBuscador, facturaTurno } from './facturar/dto-facturacion';

import { Microservice } from '@andes/bootstrap';
let pkg = require('./package.json');
let ms = new Microservice(pkg);
import * as sql from 'mssql';

import { Connections } from '@andes/log';
import { userScheduler } from './config.private';
import { msFacturacionLog } from './logger/msFacturacion';
const log = msFacturacionLog.startTrace();

const router = ms.router();

router.group('/facturacion', (group) => {
    Connections.initialize(logDatabase.log.host, logDatabase.log.options);

    group.post('/facturar', async (req, res) => {
        res.json('OK');
        let _pool;
        new sql.ConnectionPool(SipsDBConfiguration)
            .connect()
            .then( async (pool) => {
                _pool = pool;
                const data = req.body.data;
                let dtoFacturacion: any;
        
                const event = req.body.event;

                switch (event) {
                    case 'facturacion:factura:buscador':
                        dtoFacturacion = await facturaBuscador(data);
                        break;
                    case 'facturacion:factura:recupero_financiero':
                        dtoFacturacion = await facturaTurno(data);
                        break;
                    /* Queda comentado para cuando se habilite la facturación desde RUP*/
                    // case 'rup:prestacion:validate':
                    //     dtoFacturacion = await facturaRup(data);
                    //     break;
                    default:
                        log.error('facturacion:create', { event, data }, 'Origen facturación inválido', userScheduler);
                        break;
                }
    
                let factura = new Factura();
                for (let x = 0; x < dtoFacturacion.length; x++) {
                    await factura.facturar(pool, dtoFacturacion[x]);
                }
                pool.close();
    
            }).catch(error => {
                // PATCH: en caso ocurrir una excepción no handleada y quedar abierta la conexión
                if (_pool?._connected) {
                    _pool.close();
                }
                return log.error('facturacion:create:error', { data: req.body, error }, userScheduler);
            });
    });
});

ms.add(router);
ms.start();
