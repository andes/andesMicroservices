import { Microservice } from '@andes/bootstrap';
import { Connections } from '@andes/log';
import { logDatabase } from './config.private';
import { createFacturarPerinatal, updateFacturarPerinatal } from './controller/perinatal';

let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();


router.group('/perinatalSql', (group) => {

    // Conexión a la base de datos de logs: andesLogs
    group.post('/create', async (req: any, res) => {
        res.send({ message: 'ok' });
        try {
            const prestacion = req.body.data;
            // verificamos si la prestacion es "Consulta de control de embarazo"
            if (prestacion.solicitud.tipoPrestacion.conceptId === '1191000013107') {
                Connections.initialize(logDatabase.log.host, logDatabase.log.options);
                const cantValidaciones = prestacion.estados.filter(est => est.tipo === 'ejecucion').length;
                if (cantValidaciones < 2) {
                    //  si la prestación solo se validó una vez, entonces la creamos en sips
                    await createFacturarPerinatal(prestacion);
                }
                else {
                    // si la consulta es revalidada
                    await updateFacturarPerinatal(prestacion);
                }
            }
        } catch (e) {
            throw e;
        }
    });

});
ms.add(router);
ms.start();
