import { Microservice } from '@andes/bootstrap';
import { ejecutar } from './controller/ejecutaCDA';
import { ejecutarGuardias } from './controller/ejecutaCDAGuardia';
import { efectores } from './constantes';
import { queries } from './controller/queries/queries';
import { IQueryGuardia } from './schemas/queriesGuardia';
import { getQueriesGuardia } from './controller/queries/queryEfector';
import { efectoresGuardia, } from './config.private'
import { msCDAValidatorLog } from './logger/msCDAValidator';

const logGuardia = msCDAValidatorLog.startTrace();

let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();

router.group('/cda', (group) => {
    // group.use(Middleware.authenticate());
    /**
     * Se generan los CDAS de atenciones realizadas al paciente 
     * en ambito AMBULATORIO SIPS
     * */
    group.post('/ejecutar', async (req: any, res) => {
        res.send({ message: 'ok' });
        const id = req.body.id;
        const webhookId = req.body.subscription;
        const event = req.body.event;
        const data = req.body.data;
        let paciente;
        let efector = null;
        switch (event) {
            case 'mobile:patient:login':
                paciente = data.pacientes[0];
                break;
            case 'mpi:patient:update':
            case 'mpi:patient:create':
                paciente = data;
                break;
            default:
                paciente = data.paciente;
                break;
        }
        if (paciente) {
            const invalidarCache = event === 'monitoreo:cda:create'; // un hack por ahora
            for (efector of efectores) {
                const factory = queries(efector, paciente);
                await ejecutar(efector, factory, paciente, invalidarCache);
            }
        }
    });

    /** 
     * Se generan los CDAS de atenciones realizadas al paciente 
     * en el ámbito GUARDIA SIPS
    */
    group.post('/guardias', async (req: any, res) => {
        res.send({ message: 'ok' });
        const event = req.body.event;
        const data = req.body.data;
        let paciente;
        switch (event) {
            case 'mobile:patient:login':
                paciente = data.pacientes[0];
                break;
            case 'mpi:pacientes:update':
            case 'mpi:pacientes:create':
                paciente = data;
                break;
            default:
                paciente = data.paciente;
                break;
        }
        try {
            const validado = paciente && (!paciente.estado || paciente.estado === 'validado');
            if (validado && paciente.documento) {
                for (const efector of efectoresGuardia) {
                    const queriesGuardia: IQueryGuardia[] = await getQueriesGuardia(efector);
                    await ejecutarGuardias(efector, queriesGuardia, paciente);
                }
            }
        } catch (error) {
            // logGuardia.error('guardia:index', { error }, error.message, userScheduler);
        }
    });
});

ms.add(router);
ms.start();
