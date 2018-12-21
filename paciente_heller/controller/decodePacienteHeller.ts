// Por ahora no se usa
export function decode(patient) {
    let Sexo;
    let pacienteHeller = {};
    let Ecivil = null;
    pacienteHeller['HC_HHH'] = null;
    pacienteHeller['Número de Documento'] = parseInt(patient.identifier[0].value, 10);
    pacienteHeller['Tipo de Documento'] = patient.identifier[0].assigner;
    pacienteHeller['Apellido y Nombre'] = patient.name[0].family + ', ' + patient.name[0].given;
    if (patient.maritalStatus) {
        switch (patient.maritalStatus['text']) {
            case 'Married':
                Ecivil = 'casado';
                break;
            case 'Divorced':
                Ecivil = 'divorciado';
                break;
            case 'Widowed':
                Ecivil = 'viudo';
                break;
            case 'unmarried':
                Ecivil = 'soltero';
                break;
            default:
                Ecivil = 'otro';
                break;
        }
    }
    pacienteHeller['Ecivil'] = Ecivil;
    pacienteHeller['Lnacimiento'] = 'SIN IDENTIFICAR';
    pacienteHeller['Fecha de Nacimiento'] = patient.birthDate;
    pacienteHeller['Fecha de Fallecimiento'] = patient.deceasedDateTime;
    switch (patient.gender) {
        case 'female':
            Sexo = 'F';
            break;
        case 'male':
            Sexo = 'M';
            break;
        case 'other':
            Sexo = 'I';
            break;
    }
    pacienteHeller['Sexo'] = Sexo;
    pacienteHeller['Domicilio'] = patient.address[0].line;
    pacienteHeller['Barrio'] = 'Sin Barrio';
    pacienteHeller['Dependencia'] = null;
    pacienteHeller['Localidad'] = patient.address[0].city;
    pacienteHeller['Provincia'] = patient.address[0].state;
    pacienteHeller['Nacionalidad'] = patient.address[0].country.substr(0, 3);
    pacienteHeller['Código Postal'] = patient.address[0].postalCode;
    pacienteHeller['Teléfono'] = patient.telecom[0].value;
    pacienteHeller['Fecha Registro'] = new Date();
    pacienteHeller['Apellido Madre'] = null;
    pacienteHeller['Nombre Madre'] = null;
    pacienteHeller['Documento Madre'] = null;
    pacienteHeller['Obra_Social'] = 'a -VERIFICAR';
    pacienteHeller['Numero'] = null;
    pacienteHeller['Carga'] = null;
    pacienteHeller['repa'] = null;
    pacienteHeller['verificadoISSN'] = 0;
    pacienteHeller['Observaciones'] = 'DATOS INGRESADOS DESDE ANDES, MAS INFO VER ANDES.';
    pacienteHeller['Usuario'] = 'Aandes';
    pacienteHeller['cuenta'] = '999';
    pacienteHeller['subcue'] = '999';
    pacienteHeller['ConsAnuales'] = null;
    pacienteHeller['AbandonoProg'] = null;
    pacienteHeller['FeIngProg'] = null;
    pacienteHeller['IngPor'] = null;
    pacienteHeller['CodBarrio'] = null;
    pacienteHeller['verificado'] = 0;
    pacienteHeller['okbarrio'] = null;
    pacienteHeller['coddiag'] = null;
    pacienteHeller['Activo'] = patient.active;
    pacienteHeller['HC_Pasiva'] = 0;
    pacienteHeller['APELLIDOS'] = patient.name[0].family;
    pacienteHeller['NOMBRES'] = patient.name[0].given;
    pacienteHeller['TelCel'] = patient.telecom[0].value;
    pacienteHeller['id_OperadorCel'] = null;
    return pacienteHeller;
}
