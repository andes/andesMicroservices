import { HOST } from '../config';
import { FhirServerClass } from './fhir-server-class';

export async function federar(resource) {
    let fhirServer = new FhirServerClass();
    let path;
    let domain;
    let verb = 'POST';
    switch (resource.resourceType) {
        case 'Practitioner': {
            path = '/Practitioner';
            break;
        }
        case 'Patient': {
            path = '/Patient';
            break;
        }
        // acá en cada caso voy armando las rutas de los recursos
    }

    try {
        let identificador = resource.identifier.find(r => r.system === 'andes.gob.ar').value;
        if (identificador) {
            let id = '/?identifier[]=' + identificador.toString();
            let registryId = await fhirServer.search(HOST + path + id);
            if (registryId) {
                let _id = registryId;
                verb = 'PUT';
                return await fhirServer.populate(resource, HOST + path + '/' + _id, verb);
            } else {
                return await fhirServer.populate(resource, HOST + path, verb);
            }
        }
    } catch (error) {
        return error;
    }


}
