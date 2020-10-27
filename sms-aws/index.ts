import { Microservice } from '@andes/bootstrap';
import * as moment from 'moment';
import {isPhoneValid, sendSms, SmsOptions} from './controller/sms';
let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();

router.group('/sms', (group) => {
    group.post('/send', async (_req: any, res) => {
        try {
            const {telefono, mensaje, subject, prefijo} = _req.body;
            if (telefono && isPhoneValid(telefono)) {
                const smsOptions: SmsOptions = {
                    prefijo,
                    telefono,
                    mensaje,
                    subject
                };
            const resultado = await sendSms(smsOptions);
            res.json(resultado);
        } else {
            res.json({
                data : telefono,
                mensaje: 'Teléfono no válido',
                fecha: moment().format()
                });
        } 
        } catch (ex) {
            res.json({
                mensaje: ex
            })
        }
    });
});
ms.add(router);
ms.start();