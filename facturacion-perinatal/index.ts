import { Microservice } from '@andes/bootstrap';
import { Connections } from '@andes/log';
import { logDatabase } from './config.private';
import { createFacturarPerinatal, updateFacturarPerinatal, getRegistros } from './controller/perinatal';

let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();


router.group('/perinatalSql', (group) => {

    // Conexión a la base de datos de logs: andesLogs
    group.post('/create', async (req: any, res) => {
        res.send({ message: 'ok' });
        try {
            const prestacion = req.body.data.prestacion;
            const conceptConsultaEmbarazo = ['1191000013107', '1141000013103',
                '1341000013100', '1201000013105', '1741000013104', '4501000013105', '1711000013103'];
            const conceptId = prestacion.solicitud.tipoPrestacion.conceptId;
            // verificamos si la prestación es algunas de las relacionadas a control de embarazo
            // si no lo es, entonces verificamos que contenga entre sus registros alguno estos conceptos
            let enviarFacturacion: boolean = conceptConsultaEmbarazo.includes(conceptId);

            if (!enviarFacturacion) {
                const registros = getRegistros(prestacion.ejecucion.registros);
                // Cuando se registra concepto número de "embarazo" de cualquier otra prestación.
                enviarFacturacion = registros.find(reg => conceptConsultaEmbarazo.includes(reg.concepto.conceptId));
            }
            if (enviarFacturacion) {
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
            console.log("ERROR => ", e);
            throw e;
        }
    });

});
ms.add(router);
ms.start();
