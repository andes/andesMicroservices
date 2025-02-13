import * as config from './../config.private';
import { notificacionesLog } from '../logger/notificacionesLog';
import { Constantes, IConstante } from '../schemas/schemas';

import * as mongoose from 'mongoose';
mongoose.connect(config.MONGO_HOST, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log('Conexion Exitosa BD Mongo'))
    .catch(err => console.log('Error Conexion BD Mongo', err));

const log = notificacionesLog.startTrace();
const fetch = require('node-fetch');

export async function request(req: any, method: string, path: string) {
    let url: string;
    let body: any;
    let ultNum: string;
    const paths = ['send-message', 'send-reminder', 'send-survey']
    let host: string;
    try {
        if (paths.includes(path)) {
            body = req.body.data;
            const constante = await cuerpoMensaje(body.mensaje);
            const message = replaceTemplate(constante, body);
            const chatId = `${config.codPais}${config.codWaApi}${body.telefono}@${config.codServChat}`;
            ultNum = body.telefono.slice(-1);
            body = { message, chatId };
            path = paths[0];
        } else {
            body = req.body;
            ultNum = body.chatId.slice(-6).substring(0, 1);
        }
        host = ['0', '1', '2'].includes(ultNum) ? config.HOST1 : ['3', '4', '5'].includes(ultNum) ? config.HOST2 : config.HOST3;
        url = `${host}/${path}`;
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
        const responseJson = await response.json();
        if (status < 200 || status >= 300) {
            log.error(`${path}:request:statusError`, { data: req.body.data, url }, { status, statusText }, config.userScheduler);
            return { status };
        } else {
            if (responseJson.data.status === 'error') {
                log.error('send-message:request:error', { data: req.body.data, url }, responseJson.data, config.userScheduler);
                return { status };
            } else {
                responseJson.idTurno = req.body?.data?.idTurno;
                responseJson.idPaciente = req.body?.data?.idPaciente;
                const data = {
                    idTurno: req.body?.data?.idTurno,
                    idPaciente: req.body?.data?.idPaciente,
                    status: responseJson.data.status,
                    tipoMensaje: req.body?.data?.mensaje,
                    mensaje: responseJson.data.data.body,
                    instanceId: responseJson.data.instanceId,
                    telefono: req.body?.data?.telefono,
                    nombrePaciente: req.body?.data?.nombrePaciente,
                    tipoPrestacion: req.body?.data?.tipoPrestacion,
                    fecha: req.body?.data?.fecha,
                    profesional: req.body?.data?.profesional,
                    organizacion: req.body?.data?.organizacion,

                }
                log.info('send-message:request:sendMessage', data);
                return responseJson;
            }
        }
    }
    catch (error) {
        log.error('request:error', body, { error: error.message }, config.userScheduler);
        return error;
    }
}

async function cuerpoMensaje(keyMensaje) {
    const key = keyMensaje;
    try {
        const constante: IConstante = await Constantes.findOne({ key });
        return constante.nombre;
    } catch (error) {
        log.error(`cuerpoMensaje`, { key }, { error: error.message }, config.userScheduler);
        return '';
    }
}

function replaceTemplate(template, variables) {
    const mens = template.replace(/#(.*?)#/g, (_match: any, p1: any) => variables[p1.trim()]);
    return mens;
}
