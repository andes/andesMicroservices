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
    try {
        if (path === 'send-message') {
            body = req.body.data;
            turnoId = body.id;
            paciente = body.paciente;
            const mensaje = await cuerpoMensaje();
            const fechaMayor = moment(body.horaInicio).toDate() > moment().toDate();
            const tipoTurno = body.tipoTurno === 'gestion';
            const dataTurno = await verificarPrestacion(turnoId);
            if (mensaje && tipoTurno && fechaMayor && paciente.telefono && dataTurno.organizacion) {
                const message = replaceLabels(mensaje, body, dataTurno);
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
        const { status, statusText } = response;
        if (status < 200 || status >= 300) {
            log.error('send-message:request:statusError', { data: req.body.data, url }, { status, statusText }, config.userScheduler);
            return { status };
        } else {
            const responseJson = await response.json();
            log.info('send-message:request:sendMessage', responseJson);
            return responseJson;
        }
    }
    catch (error) {
        log.error('request:error', body, { error: error.message }, config.userScheduler);
        return error;
    }
}

async function verificarPrestacion(turnoId) {
    let profesionales = '';
    let organizacion;
    try {
        const agenda: any = await Agendas.findOne({ 'bloques.turnos._id': mongoose.Types.ObjectId(turnoId) });
        if (agenda) {
            if (agenda.profesionales.length) {
                profesionales = 'con el/los profesionales ';
                for (const prof of agenda.profesionales) {
                    profesionales += `${prof.nombre} ${prof.apellido}, `;
                }
            }
            organizacion = agenda.organizacion?.nombre;
            if (agenda.espacioFisico?.nombre) {
                organizacion += `, ${agenda.espacioFisico.nombre}`
            }
            return {
                profesionales,
                organizacion
            };
        }
        else {
            log.error('verificarPrestacion:agenda', { turno: turnoId, agenda }, { error: "agenda no encontrada" }, config.userScheduler);
        }
    } catch (error) {
        log.error('verificarPrestacion', { turno: turnoId, }, { error: error.message }, config.userScheduler);
    }
    return null;
}

async function cuerpoMensaje() {
    let constante;
    const key = 'turno-dacion';
    try {
        const constante: IConstante = await Constantes.findOne({ key });
        return constante.nombre;
    } catch (error) {
        log.error(`cuerpoMensaje`, { constante, key }, { error: error.message }, config.userScheduler);
        return '';
    }
}

function replaceLabels(texto: String, body: any, dataTurno) {
    let nombrePaciente = `${body.paciente.apellido}, `;
    nombrePaciente += body.paciente.alias ? body.paciente.alias : body.paciente.nombre;
    texto = texto.replace('#nombrePaciente#', nombrePaciente)
        .replace('#tipoPrestacion#', body.tipoPrestacion.nombre)
        .replace('#fecha#', moment(body.horaInicio).locale('es').format('dddd DD [de] MMMM [de] YYYY [a las] HH:mm [Hs.]'))
        .replace('#profesional#', dataTurno.profesionales)
        .replace('#organizacion#', dataTurno.organizacion);
    return texto;
}