export function encode(patient) {
    let data = patient;
    if (data) {
        let identificadores = data.documento ? [{
            assigner: 'DU',
            value: data.documento
        }] : [];
        if (data.cuil) {
            identificadores.push({
                assigner: 'CUIL',
                value: data.cuil
            });
        }
        identificadores.push({
            assigner: 'andes',
            value: data._id
        });
        // Parsea contactos
        let contactos = data.contacto ? data.contacto.map(unContacto => {
            let cont = {
                resourceType: 'ContactPoint',
                value: unContacto.valor,
                rank: unContacto.ranking,
            };
            switch (unContacto.tipo) {
                case 'fijo':
                    cont['system'] = 'phone';
                    break;
                case 'celular':
                    cont['system'] = 'phone';
                    break;
                case 'email':
                    cont['system'] = 'email';
                    break;
            }
            return cont;
        }) : [];
        // Parsea direcciones
        let direcciones = data.direccion ? data.direccion.map(unaDireccion => {
            let direc = {
                resourceType: 'Address',
                postalCode: unaDireccion.codigoPostal ? unaDireccion.codigoPostal : '',
                line: [unaDireccion.valor],
                city: unaDireccion.ubicacion.localidad ? unaDireccion.ubicacion.localidad.nombre : '',
                state: unaDireccion.ubicacion.provincia ? unaDireccion.ubicacion.provincia.nombre : '',
                country: unaDireccion.ubicacion.pais ? unaDireccion.ubicacion.pais.nombre : '',
            };
            return direc;
        }) : [];
        // Parsea relaciones
        let relaciones = data.relaciones ? data.relaciones.map(unaRelacion => {
            let relacion = {
                relationship: [{
                    text: unaRelacion.relacion.nombre
                }], // The kind of relationship
                name: {
                    resourceType: 'HumanName',
                    family: unaRelacion.apellido, // Family name (often called 'Surname')
                    given: [unaRelacion.nombre], // Given names (not always 'first'). Includes middle names
                }
            };
            return relacion;
        }) : [];
        let genero;
        switch (data.genero) {
            case 'femenino':
                genero = 'female';
                break;
            case 'masculino':
                genero = 'male';
                break;
            case 'otro':
                genero = 'other';
                break;
        }
        let pacienteFHIR = {
            resourceType: 'Patient',
            identifier: identificadores,
            active: data.activo ? data.activo : null, // Whether this patient's record is in active use
            name: [{
                resourceType: 'HumanName',
                family: data.apellido, // Family name (often called 'Surname')
                given: data.nombre, // Given names (not always 'first'). Includes middle names
            }],
            gender: genero, // male | female | other | unknown
            birthDate: data.fechaNacimiento,
            deceasedDateTime: data.fechaFallecimiento ? data.fechaFallecimiento : null,
        };
        if (data.estadoCivil) {
            let estadoCivil;
            switch (data.estadoCivil) {
                case 'casado':
                    estadoCivil = 'Married';
                    break;
                case 'divorciado':
                    estadoCivil = 'Divorced';
                    break;
                case 'viudo':
                    estadoCivil = 'Widowed';
                    break;
                case 'soltero':
                    estadoCivil = 'unmarried';
                    break;
                default:
                    estadoCivil = 'unknown';
                    break;
            }
            pacienteFHIR['maritalStatus'] = {
                text: estadoCivil
            };
        }
        if (data.foto) { // Image of the patient
            pacienteFHIR['photo'] = [{
                data: data.foto
            }];
        }
        if (contactos.length > 0) { // A contact detail for the individual
            pacienteFHIR['telecom'] = contactos;
        }
        if (direcciones.length > 0) { // Addresses for the individual
            pacienteFHIR['address'] = direcciones;
        }
        if (relaciones.length > 0) { // A contact party (e.g. guardian, partner, friend) for the patient
            pacienteFHIR['contact'] = relaciones;
        }
        return pacienteFHIR;
    } else {
        return null;
    }
}
