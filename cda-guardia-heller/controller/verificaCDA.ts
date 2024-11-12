import { IGuardia } from 'cda-guardia-heller/schemas/guardia';
import { getPacienteAndes } from '../services/paciente';

let moment = require('moment');

export async function verificar(registro: IGuardia, token: any) {

    let dto: IGuardia = {
        id: registro.id,
        paciente: null,
        profesional: null,
        fecha: null,
        file: null,
        organizacion: null,
        cie10: null,
        tipoPrestacion: '50849002',
        confidencialidad: 'N'
    };

    let verif: boolean;
    let msgError = '';
    let pacienteVerified: any = await vPaciente(registro, token);
    if (registro.organizacion) {
        // *** VER id o codigo SISA ***
        dto['organizacion'] = registro.organizacion;
    } else {
        msgError = 'Código organización inválido | ';
    }

    if (pacienteVerified) {
        dto['paciente'] = pacienteVerified;
    } else {
        msgError += 'El paciente no ha sido verificado correctamente | ';
    }

    let profesionalVerified = vProfesional(registro);
    if (profesionalVerified) {
        dto['profesional'] = profesionalVerified;
    } else {
        msgError += 'El profesional no ha sido verificado correctamente | ';
    }

    if (registro.fecha) {
        dto['fecha'] = moment(registro.fecha).toDate();
    } else {
        msgError += 'El registro no posee fecha de ingreso | ';
    }

    if (registro.file) {
        dto['file'] = registro.file;
    } else {
        msgError += 'El registro no posee el archivo adjunto | ';
    }

    if (registro.cie10) {
        dto['cie10'] = registro.cie10
    } else {
        msgError += 'El registro no posee el código cie10';
    }

    verif = registro.organizacion && pacienteVerified && profesionalVerified && registro.fecha && registro.file && registro.cie10 ? true : false;
    return { dto, verif, msgError };
}

async function vPaciente(registro: IGuardia, token: any) {
    let paciente = {
        id: registro.paciente.id,
        nombre: registro.paciente.nombre,
        apellido: registro.paciente.apellido,
        documento: registro.paciente.documento,
        sexo: registro.paciente.sexo,
        fechaNacimiento: registro.paciente.fechaNacimiento
    };
    if (registro.paciente) {
        if (paciente.id) {
            paciente.id = await getPacienteAndes({ id: paciente.id }, token);
        } else {
            paciente.id = await getPacienteAndes({ documento: paciente.documento, sexo: paciente.sexo }, token);
        }
    }
    if (paciente.id && paciente.nombre && paciente.apellido && paciente.sexo && paciente.documento) {
        return paciente;
    }
    return null;
}

function vProfesional(registro: IGuardia) {
    let profesional = {
        documento: registro.profesional.documento ? registro.profesional.documento : null,
        nombre: registro.profesional.nombre ? registro.profesional.nombre : null,
        apellido: registro.profesional.apellido ? registro.profesional.apellido : null,
    };
    if (profesional.nombre && profesional.apellido && profesional.documento) {
        return profesional;
    }
    return null;
}