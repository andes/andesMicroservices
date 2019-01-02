import { Microservice } from '@andes/bootstrap'
import { postFederador } from './../controller/postFederador';
import * as Fhir from '@andes/fhir';

let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();


router.group('/paciente', (group) => {
    group.post('/create', async (req, res) => {
        res.send({ message: 'ok' });
        const pacienteFhir = req.body.data;
        console.log('llega create', pacienteFhir);
        const pacienteFederado = Fhir.federar(pacienteFhir);
        console.log('federado', pacienteFederado);
        if (pacienteFederado) {
            await postFederador(pacienteFederado);
        }
    });
    group.put('/update', async (req, res) => {
        res.send({ message: 'ok' });
        const pacienteFhir = req.body.data;
        console.log('llega update', pacienteFhir);
        const pacienteFederado = Fhir.federador(pacienteFhir);
        console.log('federado', pacienteFederado);
        if (pacienteFederado) {
            await postFederador(pacienteFederado);
        }
    });
});

ms.add(router);
ms.start();
