import { Microservice } from '@andes/bootstrap';
import { sendSms } from './controller/sms';
import * as moment from 'moment';

let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();

router.group('/sms', (group) => {
    group.post('/send', async (_req: any, res) => {
        try {
            let data = _req.body.data;
            const myDate = new Date(data.horaInicio);
            let fechaTurno = moment(myDate).format('DD-MM-YYYY HH:mm');
            let turnoSMS = {
                Mensaje: `${data.paciente.apellido} ${data.paciente.nombre}, le recordamos su turno ${fechaTurno} de ${data.tipoPrestacion.nombre} en ${data.updatedBy.organizacion.nombre}`,
                Telefono: data.paciente.telefono,
                Carrier: '', // Tiene que estar vacío para que envíe a cualquier carrier (claro, telefonica, etc.)
            };
            const result = await sendSms(turnoSMS);
            res.json({ result });
        } catch (ex) {
            return ex;
        }
    });
});

ms.add(router);
ms.start();

