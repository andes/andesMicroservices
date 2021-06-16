import { Microservice } from '@andes/bootstrap';
import { Connections } from '@andes/log';
import { logDatabase } from './config.private';
import { getPaciente as getPacienteSP, postPaciente as postPacienteSP } from './controller/sip-plus';
import { getPaciente as getPacienteAndes } from './service/paciente';

let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();


router.group('/perinatal', (group) => {
    // Conexión a la base de datos de logs: andesLogs
    Connections.initialize(logDatabase.log.host, logDatabase.log.options);
    group.post('/register', async (req: any, res) => {
        res.send({ message: 'ok' });
        try {
            const prestacion = req.body.data;
            // verificamos si la prestacion es "Consulta de control de embarazo"
            // "consulta de ginecología", "Consulta de obstetricia" o "Consulta de tocoginecología"
            const conceptConsultaEmbarazo = ['1191000013107', '721000013105', '1181000013109', '1141000013103'];
            const conceptId = prestacion.solicitud.tipoPrestacion.conceptId;

            if (conceptConsultaEmbarazo.includes(conceptId)) {
                let paciente: any = await getPacienteAndes(prestacion.paciente.id);
                if (paciente) {
                    // Obtenemos el paciente y sus gestas cargadas en sip plus
                    const resultSP = await getPacienteSP(paciente);
                    if (resultSP) {
                        // peticion válida
                        await postPacienteSP(paciente, prestacion, resultSP.paciente || {});
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
