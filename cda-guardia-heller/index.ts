import { Microservice } from '@andes/bootstrap';
import { ejecutar } from './controller/ejecutaCDA';
import { userScheduler } from './config.private';
import { msCDAValidatorLog } from './logger/msCDAValidator';

const logGuardia = msCDAValidatorLog.startTrace();

let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();
const efector = "heller";

router.group('/cda', (group) => {
    group.post('/guardia', async (req: any, res) => {
        const event = req.body.event;
        const data = req.body;
        const token = req.headers.authorization;
        let paciente: any;
        try {
            paciente = req.body.paciente;
            const validado = paciente && (!paciente.estado || paciente.estado === 'validado');
            if (validado && paciente.documento) {
                const ex = await ejecutar(efector, paciente, true, data, token);
                if (ex.verif) {
                    res.send({ status: "OK" });
                } else {
                    res.status(400).json(ex);
                }
            } else {
                logGuardia.info('cda-guardia-heller', { paciente, validado }, req);
                res.send({ cda: 'cda-guardia-heller', est: 'no validado !' });
            }
        } catch (error) {
            logGuardia.error('guardia:index', { error }, error.message, userScheduler);
            res.send({ error: error.message });
        }
    });

});

ms.add(router);
ms.start();
