import { ANDES_HOST, userScheduler } from './../config.private';
const fetch = require('node-fetch');
import { msCDAGuardiaHellerLog } from '../logger/msCDAGuardiaHeller';

const logGuardia = msCDAGuardiaHellerLog.startTrace();


export async function getPacienteAndes(params, token) {
    let qs;
    let res = { paciente: null, status: null, message: "ok" };
    if (params.id) {
        qs = `/${params.id}`;
    } else {
        if (params.documento && params.sexo) {
            qs = `?documento=${params.documento}&sexo=${params.sexo}&activo=true`;
        }
    }
    const url = `${ANDES_HOST}/core-v2/mpi/pacientes${qs}`;
    const options = {
        url,
        method: 'GET',
        headers: {
            Authorization: `JWT ${token}`
        }
    };
    try {
        const response = await fetch(url, options);
        if (response.status >= 200 && response.status < 300) {
            const respuesta = await response.json();
            if (!params.id) {
                res.paciente = respuesta.length ? respuesta[0] : null;
            } else {
                res.paciente = respuesta;
            }
        } else {
            res.message = `Error al ejecutar ${url}`;
            logGuardia.error('getPacienteAndes', { params, status: response.status }, 'no se pudo obtener paciente', userScheduler);
        }
        res.status = response.status;
    }
    catch (error) {
        logGuardia.error('getPacienteAndes', { params }, error.message, userScheduler);
        res.message = error.message;
        res.status = 500;
    }
    return res;
}