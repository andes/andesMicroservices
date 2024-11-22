import { IGuardia } from 'cda-guardia-heller/schemas/guardia';
import { getPacienteAndes } from '../services/paciente';
import { userScheduler } from '../config.private';
import { msCDAGuardiaHellerLog } from '../logger/msCDAGuardiaHeller';
import * as moment from 'moment';

const logGuardia = msCDAGuardiaHellerLog.startTrace();


export async function verificarDatos(registro: any, token: any) {

    let dto: IGuardia = {
        id: null,
        paciente: null,
        profesional: null,
        fecha: null,
        file: null,
        organizacion: null,
        cie10: null,
        tipoPrestacion: '50849002',
        confidencialidad: 'N'
    };
    let respuesta = { status: 200, msg: "", dto };
    try {
        if (registro.idGuardia && registro.fechaIngreso && registro.file && registro.cie10 && registro.paciente && registro.profesional) {
            let fecha = moment(registro.fechaIngreso) || null;
            if (fecha.isValid()) {
                dto['fecha'] = fecha.toDate();
                let pacienteVerified = await vPaciente(registro.paciente, token);
                if (pacienteVerified.paciente) {
                    dto['paciente'] = pacienteVerified.paciente;
                    let profesionalVerified = vProfesional(registro);
                    if (profesionalVerified) {
                        dto['profesional'] = profesionalVerified;
                        dto['id'] = registro.idGuardia ? (registro.idGuardia).toString() : null;
                        dto['file'] = registro.file;
                        dto['cie10'] = registro.cie10;

                    } else {
                        respuesta.msg = 'Error en datos del profesional incompletos';
                        respuesta.status = 404;
                    }
                } else {
                    respuesta.msg = pacienteVerified.error;
                    respuesta.status = pacienteVerified.status;
                }
            } else {
                respuesta.status = 404;
                respuesta.msg = "FechaIngreso incorrecta (YYYY-MM-DD)";
            }
        } else {
            let respError;
            if (!registro.idGuardia) {
                respError = 'idGuardia';
            }
            if (!registro.fechaIngreso) {
                respError = 'fechaIngreso';
            }
            if (!registro.file) {
                respError = 'file';
            }
            if (!registro.cie10) {
                respError = 'cie10';
            }
            if (!registro.paciente) {
                respError = 'paciente';
            }
            if (!registro.profesional) {
                respError = 'profesional';
            }
            respuesta.status = 404;
            respuesta.msg = `Error en datos: falta atributo ${respError}`;

        }
    } catch (error) {
        respuesta.status = 500;
        respuesta.msg = "Error al procesar datos: " + error;
        logGuardia.error('guardia-heller:verificarCDA:verificarDatos', { dto, error }, error.message, userScheduler);
    }
    return respuesta;
}

async function vPaciente(pacienteH: any, token: any) {
    let pacienteVerificado = { paciente: null, error: "Paciente incompleto", status: 404 };
    if (pacienteH) {
        let paciente = {
            id: pacienteH.idAndes || null,
            nombre: pacienteH.nombre,
            apellido: pacienteH.apellido,
            documento: pacienteH.documento,
            sexo: pacienteH.sexo,
            fechaNacimiento: pacienteH.fechaNacimiento
        };
        if (paciente.id || (paciente.documento && paciente.sexo)) {
            let sexo = paciente.sexo.toString().toLowerCase();
            if (sexo === 'femenino' || sexo === 'f') {
                paciente.sexo = 'femenino';
            }
            if (sexo === 'masculino' || sexo === 'm') {
                paciente.sexo = 'masculino';
            }
            if (sexo === 'no binario' || sexo === 'x') {
                paciente.sexo = 'otro';
            }
            const respuesta = await getPacienteAndes({ id: paciente.id, documento: paciente.documento, sexo: paciente.sexo }, token);
            if (respuesta.paciente) {
                paciente.id = respuesta.paciente.id;
                pacienteVerificado.paciente = paciente;
            }
            else {
                if (respuesta.status < 500) {
                    pacienteVerificado.error = "Paciente no encontrado, revise los datos enviados";
                    pacienteVerificado.status = 404;
                }
                else {
                    pacienteVerificado.status = respuesta.status;
                    pacienteVerificado.error = respuesta.message;
                }
            }
        }
    }
    return pacienteVerificado;
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