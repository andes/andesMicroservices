import { Microservice } from '@andes/bootstrap';
import { postFederador } from './controller/postFederador';
import * as Fhir from '@andes/fhir';

let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();


router.group('/paciente', (group) => {
    group.post('/create', async (req, res) => {
        res.send({ message: 'ok' });
        const pacienteFhir = req.body.data;
        const pacienteFederado = Fhir.Patient.federar(pacienteFhir);
        if (pacienteFederado) {
            await postFederador(pacienteFederado);
        }
    });
    group.put('/update', async (req, res) => {
        res.send({ message: 'ok' });
        const patientFhir = req.body.data;
        const pacienteFederado = Fhir.Patient.federar(patientFhir);
        if (pacienteFederado) {
            await postFederador(pacienteFederado);
        }
    });
});

ms.add(router);
ms.start();
