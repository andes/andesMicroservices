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

let profesionales: any;
let organizacion: any;

export async function request(req: any, method: string, path: string) {
    let body: any;
    let turnoId: any;
    let paciente: any;
    try {
        if (path === 'send-message') {
            body = req.body.data;
            turnoId = body.id;
            paciente = body.paciente;
            if (body.tipoTurno === 'gestion' && moment(body.horaInicio).toDate() > moment().toDate() && paciente.telefono && await verificarPrestacion(turnoId)) {
                const message = replaceLabels(await CuerpoMensaje(), body);
                const chatId = `${config.codPais}${config.codWaApi}${paciente.telefono}@${config.codServChat}`;
                body = { message, chatId };
            } else {
                return;
            }
        } else {
            body = req.body;
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
            log.error(`notificaciones:${path}:statusError`, { data: req.body.data, url }, { status: responseJson.data.status, message: responseJson.data }, config.userScheduler);
            return responseJson;
        } else {
            if (response.status >= 200 && response.status < 300) {
                log.info('notificaciones:sendMessage', responseJson);
                return responseJson;
            } else {
                log.error(`notificaciones:${path}:statusError`, { data: req.body, url }, { status: response.status, message: responseJson.data }, config.userScheduler);
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
        const agenda: any = await Agendas.findOne({ 'bloques.turnos._id': mongoose.Types.ObjectId(turnoId) });
        profesionales = 'con el profesional ';
        if (agenda.profesionales.length) {
            for (const prof of agenda.profesionales) {
                profesionales += `${prof.nombre} ${prof.apellido}, `;
            }
        } else {
            profesionales = '';
        }
        organizacion = agenda.organizacion.nombre;
        if (agenda.espacioFisico.nombre) {
            organizacion += `, ${agenda.espacioFisico.nombre}`
        }
        const result: any = await Prestaciones.findOne({ 'solicitud.turno': turnoId });
        return result ? result.inicio === 'top' ? true : false : false;
    } catch (error) {
        log.error('notificaciones:verificarPrestacion', { error: error.message }, config.userScheduler);
        return false;
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

function replaceLabels(texto: String, body: any) {
    let nombrePaciente = `${body.paciente.apellido}, `;
    nombrePaciente += body.paciente.alias ? body.paciente.alias : body.paciente.nombre;
    texto = texto.replace('#nombrePaciente#', nombrePaciente)
        .replace('#tipoPrestacion#', body.tipoPrestacion.nombre)
        .replace('#fecha#', moment(body.horaInicio).locale('es').format('dddd DD [de] MMMM [de] YYYY [a las] HH:mm [Hs.]'))
        .replace('#profesional#', profesionales)
        .replace('#organizacion#', organizacion);
    return texto;
}