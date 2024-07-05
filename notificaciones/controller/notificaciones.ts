import moment = require('moment');
import * as config from './../config.private';
import { notificacionesLog } from '../logger/notificacionesLog';
import { Prestaciones, Agendas, Constantes, IConstante } from '../schemas/schemas';
import * as mongoose from 'mongoose';

mongoose.connect(config.MONGO_HOST, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log('Conexion Exitosa BD Mongo: ' + config.MONGO_HOST))
    .catch(err => console.log('Error Conexion BD Mongo', err));

const log = notificacionesLog.startTrace();
const fetch = require('node-fetch');

export async function request(req: any, method: string, path: string) {
    let body: any;
    let turnoId: any;
    let paciente: any;

    if (path === 'send-message') {
        body = req.body.data;
        turnoId = body.id;
        paciente = body.paciente;
    } else {
        body = req.body;
    }
    try {
        if (path === 'send-message') {
            if (body.tipoTurno === 'gestion') {
                const dataParaTurno = await verificarPrestacion(turnoId);
                if (dataParaTurno) {
                    const message = replaceLabels(await CuerpoMensaje(), body, dataParaTurno.profesionales, dataParaTurno.organizacion);
                    const chatId = `${config.codPais}${config.codWaApi}${paciente.telefono}@${config.codServChat}`;
                    body = { message, chatId };
                } else {
                    return 'Turno no es de top';
                }
            } else {
                return 'Turno no es con llave (gestión)';
            }
        }
        const url = `${config.HOST}/${path}`;
        const options = {
            url,
            method,
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${req.headers.authorization || config.WaApiKey}`
            }
        };
        let response = await fetch(url, options);
        const responseJson = await response.json();
        if (responseJson.data.status === 'error') {
            log.error(`notificaciones:${path}:statusError`, { data: req.body.data, url }, { status: responseJson.error, message: responseJson.message }, config.userScheduler);
            return responseJson;
        } else {
            if (response.status >= 200 && response.status < 300) {
                return responseJson;
            } else {
                log.error(`notificaciones:${path}:statusError`, { data: req.body, url }, { status: responseJson.error, message: responseJson.message }, config.userScheduler);
                return responseJson;
            }
        }
    }
    catch (error) {
        log.error(`notificaciones:${path}`, { error: error.message }, config.userScheduler);
        return error;
    }
}

async function verificarPrestacion(turnoId) {
    try {
        const agenda: any[] = await Agendas.find({ 'bloques.turnos._id': mongoose.Types.ObjectId(turnoId) });
        let profesionales = '';
        let organizacion = '';
        if (agenda[0].profesionales.length) {
            for (const prof of agenda[0].profesionales) {
                profesionales += `${prof.nombre} ${prof.apellido}, `;
            }
        } else {
            profesionales = '(no asignado), ';
        }
        organizacion = agenda[0].organizacion.nombre;
        const result: any[] = await Prestaciones.find({ 'solicitud.turno': turnoId });
        return result.length ? result[0].inicio === 'top' ? { profesionales, organizacion } : null : null;
    } catch (error) {
        log.error('notificaciones:verificarPrestacion', { error: error.message }, config.userScheduler);
        return null;
    }
}

async function CuerpoMensaje() {
    try {
        const result: IConstante = await Constantes.findOne({ key: 'turno-dacion' });
        return result.nombre;
    } catch (error) {
        log.error(`notificaciones:cuerpoMensaje`, { error: error.message }, config.userScheduler);
        return '';
    }
}

function replaceLabels(texto: String, body: any, profesionales: any, organizacion: any) {
    texto = texto.replace('#nombrePaciente#', body.paciente.nombreCompleto)
        .replace('#tipoPrestacion#', body.tipoPrestacion.nombre)
        .replace('#fecha#', moment(body.horaInicio).locale('es').format('dddd DD [de] MMMM [de] YYYY [a las] HH:mm [Hs.]'))
        .replace('#profesional#', profesionales ? profesionales : '(no asignado)')
        .replace('#organizacion#', organizacion ? organizacion : '(no definido)');
    return texto;
}