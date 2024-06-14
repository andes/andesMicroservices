import { HOST, userScheduler } from '../config.private';
import { notificacionesLog } from '../logger/notificacionesLog'

const log = notificacionesLog.startTrace();
const fetch = require('node-fetch');

export async function request(req: any, method: string, path: string) {
    const url = `${HOST}/${path}`;
    const options = {
        url,
        method,
        body: JSON.stringify(req.body),
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${req.headers.authorization}`
        }
    };
    try {
        let response = await fetch(url, options);
        const responseJson = await response.json();
        if (response.status >= 200 && response.status < 300) {
            return responseJson;
        } else {
            log.error(`notificaciones:${path}:statusError`, { data: req.body, url }, { status: responseJson.error, message: responseJson.message }, userScheduler);
            return responseJson;
        }
    }
    catch (error) {
        log.error(`notificaciones:${path}`, { error: error.message }, userScheduler);
        return error;
    }
}