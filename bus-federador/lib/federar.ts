import { DOMINIO, HOST, SECRET } from '../config';
import { Patient, initialize } from '@andes/fhir';
import { SaludDigitalClient } from './salud-digital-cliente';
import moment = require('moment');

export async function login() {
    const saludDigitalClient = new SaludDigitalClient(DOMINIO, HOST, SECRET);

    const payload = {
        name: 'Andes',
        role: 'federador',
        ident: '1',
        sub: 'Ministerio de Salud'
    };

    await saludDigitalClient.obtenerToken(payload);
    return saludDigitalClient;
}

export async function federar(paciente) {
    delete paciente.cuil;
    delete paciente.foto;
    delete paciente.contacto;
    delete paciente.direccion;
    delete paciente.relaciones;
    delete paciente.estadoCivil;

    paciente.fechaNacimiento = moment(paciente.fechaNacimiento);

    initialize({ dominio: DOMINIO });

    const saludDigitalClient = await login();

    const patientFhir = Patient.encode(paciente);


    const status = await saludDigitalClient.federar(patientFhir);


    return status;

}
