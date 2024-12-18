import { Microservice } from '@andes/bootstrap';
import { crearGuardia } from './controller/ejecutaCDA';
import { userScheduler } from './config.private';
import { msCDAGuardiaHellerLog } from './logger/msCDAGuardiaHeller';

const logGuardia = msCDAGuardiaHellerLog.startTrace();

let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();

const efector = "heller";

router.group('/cda', (group) => {
    group.post('/guardia', async (req: any, res) => {
        const data = req.body.data;
        const token = req.headers.authorization;
        try {
            let paciente = data.paciente;
            const ex = await crearGuardia(efector, paciente, data, token);
            if (ex.verif) {
                res.status(200).json({ mensage: ex.msgError, cda: ex.data });
            } else {
                res.status(400).json(ex);
            }
        } catch (error) {
            logGuardia.error('guardia:index', { error }, error.message, userScheduler);
            res.status(500).json({ error: error.message });

        }
    });

});

ms.add(router);
ms.start();
