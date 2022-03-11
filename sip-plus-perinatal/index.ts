import { Microservice } from '@andes/bootstrap';
import { Connections } from '@andes/log';
import { logDatabase, fakeRequest } from './config.private';
import { getPaciente as getPacienteSP, postPaciente as postPacienteSP, getRegistros } from './controller/sip-plus';
import { getPaciente as getPacienteAndes } from './service/paciente';
import { log } from '@andes/log';

let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();


router.group('/perinatal', (group) => {
    // Conexión a la base de datos de logs: andesLogs
    Connections.initialize(logDatabase.log.host, logDatabase.log.options);
    group.post('/register', async (req: any, res) => {
        res.send({ message: 'ok' });
        try {
            const prestacion = req.body.data.prestacion;
            // Se asume que el registro de número de "embarazo" está incluido en todos los conceptConsultaEmbarazo.
            const conceptConsultaEmbarazo = ['1191000013107', '1141000013103',
                '1341000013100', '1201000013105', '1741000013104', '4501000013105', '1711000013103'];
            const conceptId = prestacion.solicitud.tipoPrestacion.conceptId;
            // verificamos si la prestación es algunas de las relacionadas a control de embarazo
            // si no lo es, entonces verificamos que contenga entre sus registros alguno de estos conceptos
            let mapeoSipPlus: boolean = conceptConsultaEmbarazo.includes(conceptId);
            const registros = getRegistros(prestacion.ejecucion.registros);
            if (!mapeoSipPlus) {
                // Se verifica que la prestación incluya algún registro relacionado a control de embarazo
                mapeoSipPlus = registros.find(reg => conceptConsultaEmbarazo.includes(reg.concepto.conceptId));
            }
            if (mapeoSipPlus) {
                let paciente: any = await getPacienteAndes(prestacion.paciente.id);
                if (paciente) {
                    // Obtenemos el paciente y sus gestas cargadas en sip plus
                    const resultSP = await getPacienteSP(paciente);
                    if (resultSP) {
                        // peticion válida
                        await postPacienteSP(paciente, prestacion, registros, resultSP.paciente || {});
                    }
                }
            }
        } catch (e) {
            log(fakeRequest, 'microservices:integration:sip-plus', { data: req.body.data }, 'postInitial:register', null, null, e);
        }
    });

});
ms.add(router);
ms.start();
