import moment = require('moment');
import * as config from './../config.private';
import { notificacionesLog } from '../logger/notificacionesLog';
import { Constantes, IConstante } from '../schemas/schemas';
import * as mongoose from 'mongoose';

mongoose.connect(config.MONGO_HOST, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log('Conexion Exitosa BD Mongo: ' + config.MONGO_HOST))
    .catch(err => console.log('Error Conexion BD Mongo', err));

const log = notificacionesLog.startTrace();
const fetch = require('node-fetch');


export async function request(req: any, method: string, path: string) {
    let body: any;
    try {
        if (path === 'send-message') {
            body = req.body.data;
            const constante = await cuerpoMensaje(body.mensaje)

            const message = replaceTemplate(constante, body);
            const chatId = `${config.codPais}${config.codWaApi}${body.telefono}@${config.codServChat}`;
            body = { message, chatId };

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
    const mens = template.replace(/#(.*?)#/g, (match, p1) => variables[p1.trim()] || match);
    return mens;
}
