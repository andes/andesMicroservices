import { InformBuilder } from './../service/inform.service';
import './utils/stringExtensions';

let moment = require('moment');

function vPaciente(registro) {

    let paciente = {
        documento: registro.pacienteDocumento ? registro.pacienteDocumento.toString() : null,
        nombre: registro.pacienteNombre ? registro.pacienteNombre : null,
        apellido: registro.pacienteApellido ? registro.pacienteApellido : null,
        sexo: registro.pacienteSexo ? registro.pacienteSexo : null,
        fechaNacimiento: registro.pacienteFechaNacimiento ? registro.pacienteFechaNacimiento : null
    };
    if (paciente.nombre && paciente.apellido && paciente.sexo && paciente.fechaNacimiento && paciente.documento) {
        paciente.sexo = (paciente.sexo === 'Femenino') ? 'femenino' : 'masculino';
        return paciente;
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

String.prototype.reemplazar = function (str1, str2, ignore) {
    console.log('entro al llamado');
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, '\\$&'), (ignore ? 'gi' : 'g')), (typeof (str2) === 'string') ? str2.replace(/\$/g, '$$$$') : str2);
};

async function getInform(url) {
    return new Promise(async (resolve, reject) => {
        try {
            let informBuilder = new InformBuilder();
            let informe = await informBuilder.build(url);
            resolve(informe);
        } catch (err) {
            reject(err);
        }
    });
}


export async function verificar(registro) {
    let dto = {
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
    let pacienteVerified: any = vPaciente(registro);
    if (pacienteVerified) {
        dto['paciente'] = pacienteVerified;
    } else {
        notError = false;
        msgError = 'El paciente no ha sido verificado correctamente';
    }
    let profesionalVerified = vProfesional(registro);
    if (profesionalVerified && notError) {
        dto['profesional'] = profesionalVerified;
    } else {
        notError = false;
        msgError = 'El profesional no ha sido verificado correctamente';
    }

    let prestacionVerified = vPrestacion(registro.prestacion);
    if (prestacionVerified && notError) {
        dto['tipoPrestacion'] = prestacionVerified;
    } else {
        notError = false;
        msgError = 'La prestación no existe';
    }

    notError = registro.fecha ? true : false;
    notError = registro.id ? true : false;

    if (notError) {
        dto['fecha'] = moment(registro.fecha).toDate();
        dto['id'] = registro.id;
    } else {
        msgError = 'El registro no posee fecha de registro o id';
    }

    if (notError) {
        let cie10Verified = vCie10(registro.cie10);
        if (cie10Verified && notError) {
            dto['cie10'] = registro.cie10;
        } else {
            msgError = 'El código CIE10 no es válido';
        }
    }

    // No Obligatorio
    if (notError) {
        // Por ahora este ws sólo lo devuelve HPN
        if (registro.url) {
            dto['file'] = await getInform(registro.url);
        }
    }

    // NO Obligatorios
    if (notError) {
        if (registro.texto) {
            let text = registro.texto;
            // limpiamos caracteres raros usados en el texto de la evolución
            text = text.reemplazar('<', 'menor');
            text = text.reemplazar('>', 'mayor');
            dto['texto'] = text;
        } else {
            dto['texto'] = null;
        }
    }

    if (!notError) {
        dto = null;
    }



    return dto;
}
