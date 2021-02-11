import { Microservice } from '@andes/bootstrap';
import { Connections } from '@andes/log';
import { logDatabase } from './config.private';
import { getPaciente, savePaciente, updatePaciente } from './controller/sip-plus';

let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();


router.group('/perinatal', (group) => {
    // Conexión a la base de datos de logs: andesLogs
    Connections.initialize(logDatabase.log.host, logDatabase.log.options);
    group.post('/register', async (req: any, res) => {
        res.send({ message: 'ok' });
        try {
            const event = req.body.event;
            const registros = req.body.data[1];
            let paciente = req.body.data[2] || null;
            if (event === 'rup:perinatal:register') {
                if (paciente) {
                    // Obtenemos el paciente y sus gestas cargadas en sip plus
                    const resultSP = await getPaciente(paciente);
                    if (resultSP) { // peticion válida
                        if (resultSP.paciente) {
                            // paciente encontrado en SIP+
                            await updatePaciente(resultSP.paciente, paciente, registros);
                        }
                        else {
                            // paciente no encontrado en SIP+
                            // crea al paciente junto con la gesta actual
                            await savePaciente(paciente, registros);
                        }
                    }
                }
            }
        } catch (e) {
            throw e;
        }
    });

});
ms.add(router);
ms.start();
