import { getInforme } from './../service/inform.service';
import { getOrganizacion } from './../service/organizaciones.service';
import { Matching } from '@andes/match';

let moment = require('moment');


function vPaciente(registro, pacienteAndes) {
    const cota = 0.95;
    function matchPaciente(pacMpi, pac) {
        const weights = {
            identity: 0.55,
            name: 0.10,
            gender: 0.3,
            birthDate: 0.05
        };

        const pacDto = {
            documento: pacMpi.documento ? pacMpi.documento.toString() : '',
            nombre: pacMpi.nombre ? pacMpi.nombre : '',
            apellido: pacMpi.apellido ? pacMpi.apellido : '',
            fechaNacimiento: pacMpi.fechaNacimiento ? moment(pacMpi.fechaNacimiento, 'DD/MM/YYYY').format('YYYY-MM-DD') : '',
            sexo: pacMpi.sexo ? pacMpi.sexo : ''
        };
        const pacElastic = {
            documento: pac.documento ? pac.documento.toString() : '',
            nombre: pac.nombre ? pac.nombre : '',
            apellido: pac.apellido ? pac.apellido : '',
            fechaNacimiento: pac.fechaNacimiento ? moment(pac.fechaNacimiento, 'DD/MM/YYYY').format('YYYY-MM-DD') : '',
            sexo: pac.sexo
        };
        const match = new Matching();
        return match.matchPersonas(pacElastic, pacDto, weights, 'Levenshtein');
    }

    let paciente = {
        documento: registro.pacienteDocumento ? registro.pacienteDocumento.toString() : null,
        nombre: registro.pacienteNombre ? registro.pacienteNombre : null,
        apellido: registro.pacienteApellido ? registro.pacienteApellido : null,
        sexo: registro.pacienteSexo ? registro.pacienteSexo : null,
        fechaNacimiento: registro.pacienteFechaNacimiento ? registro.pacienteFechaNacimiento : null
    };
    if (paciente.nombre && paciente.apellido && paciente.sexo && paciente.fechaNacimiento && paciente.documento) {
        switch (paciente.sexo) {
            case 'femenino':
                paciente.sexo = 'femenino';
                break;
            case 'masculino':
                paciente.sexo = 'masculino';
                break;
            default:
                paciente.sexo = 'otro';
                break;
        }
        const value = matchPaciente(pacienteAndes, paciente);
        if (value >= cota) {
            return pacienteAndes;
        } else {
            return null;
        }
    } else {
        return null;
    }
}

function vProfesional(registro) {
    let profesional = {
        documento: registro.profesionalDocumento ? registro.profesionalDocumento.toString() : null,
        nombre: registro.profesionalNombre ? registro.profesionalNombre : null,
        apellido: registro.profesionalApellido ? registro.profesionalApellido : null,
    };
    if (profesional.nombre && profesional.apellido && profesional.documento) {
        return profesional;
    } else {
        return null;
    }
}

function vPrestacion(prestacionNombre) {
    // TODO Verificar que sea el código correspondiente y que existe en configuracionPrestaciones
    let prestacion = null;
    if (prestacionNombre) {
        prestacion = prestacionNombre;
    }
    return prestacion;
}

function vCie10(cie10) {
    // TODO verificar el código cie10 en configuraciónPrestaciones
    let c = null;
    if (cie10) {
        return cie10;
    } else {
        return c;
    }
}

export async function verificar(registro, pacienteAndes) {
    let dto = {
        organizacion: null,
        paciente: null,
        profesional: null,
        tipoPrestacion: null,
        fecha: null,
        id: null,
        cie10: null,
        file: null,
        texto: null
    };
    let notError = true;
    let msgError = '';
    let pacienteVerified: any = vPaciente(registro, pacienteAndes);

    if (pacienteVerified) {
        dto['paciente'] = pacienteVerified;
    } else {
        notError = false;
        msgError = msgError + '\n' + 'El paciente no ha sido verificado correctamente';
    }

    if (registro.sisa) {
        try {
            dto.organizacion = await getOrganizacion(registro.sisa);
            dto.organizacion = dto.organizacion._id;
        } catch (e) {
            notError = false;
            msgError = msgError + '\n' + 'SISA Code invalido';
        }
    }

    let profesionalVerified = vProfesional(registro);
    if (profesionalVerified && notError) {
        dto['profesional'] = profesionalVerified;
    } else {
        notError = false;
        msgError = msgError + '\n' + 'El profesional no ha sido verificado correctamente';
    }

    let prestacionVerified = vPrestacion(registro.prestacion);
    if (prestacionVerified && notError) {
        dto['tipoPrestacion'] = prestacionVerified;
    } else {
        notError = false;
        msgError = msgError + '\n' + 'La prestación no existe' + registro.prestacion;
    }

    notError = notError && registro.fecha ? true : false;
    notError = notError && registro.id ? true : false;

    if (notError) {
        dto['fecha'] = moment(registro.fecha).toDate();
        dto['id'] = registro.id;
    } else {
        msgError = msgError + '\n' + 'El registro no posee fecha de registro o id' + registro.fecha + registro.id;
    }

    if (notError) {
        let cie10Verified = vCie10(registro.cie10);
        if (cie10Verified) {
            if ((registro.cie10.indexOf('.')) === -1) {
                registro.cie10 = registro.cie10 + '.9';
            }
            dto['cie10'] = registro.cie10;
        } else {
            notError = false;
            msgError = msgError + '\n' + 'El código CIE10 no es válido' + registro.cie10;
        }
    }

    // No Obligatorio
    if (notError) {
        // Por ahora este ws sólo lo devuelve HPN
        if (registro.url) {
            dto['file'] = await getInforme(registro.url);
        }
    }

    // NO Obligatorios
    if (notError) {
        dto['texto'] = registro.texto ? registro.texto : null;
    }

    if (!notError) {
        dto = null;
        console.log('error', msgError);
    }


    return dto;
}
