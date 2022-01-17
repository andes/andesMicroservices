
import * as sql from 'mssql';
import { ANDES_HOST, ANDES_KEY, IP_LABCENTRAL, SISA_LAB } from '../config.private';
import { userScheduler } from '../config.private';
import { msCDALaboratoriosLog } from '../logger/msCDALaboratorioCentral';
const log = msCDALaboratoriosLog.startTrace();
const got = require('got');
const cache = {};

export const fakeRequest = {
    user: {
        usuario: 'msLabCentral',
        app: 'integracion-labcentral',
        organizacion: 'sss'
    },
    ip: IP_LABCENTRAL,
    connection: {
        localAddress: ''
    }
}

export async function organizacionBySisaCode(sisa) {
    return new Promise( async (resolve, reject) => {
        if (cache[sisa]) {
            return resolve(cache[sisa]);
        } else {
            const url = `${ANDES_HOST}/core/tm/organizaciones?sisa=${sisa}&token=${ANDES_KEY}`;
            const {error, statusCode, body} = await got(url, { responseType: 'json' });
            if (error) {
                await log.error('cda-laboratorio-central:organizacionBySisaCode', { error, url }, error.message, userScheduler);
            } else if (statusCode >= 200 && statusCode < 300) {
                const orgs: any[] = body;
                if (orgs && orgs.length) {
                    cache[sisa] = {
                        _id: orgs[0].id,
                        nombre: orgs[0].nombre,
                    };
                    return resolve(cache[sisa]);
                }
            }
            return reject(error || body);
        }
    });
}


// hardcodear el codigo sisa

export async function getEncabezados(pool, paciente) {
    const query = `select ${SISA_LAB} as efectorCodSisa, efector.nombre as efector, encabezado.idEfector as idEfector, paciente.apellido as pacienteApellido, paciente.nombre as pacienteNombre, FORMAT(paciente.fechaNacimiento, 'dd/MM/yyyy') as fechaNacimiento, encabezado.sexo,  
        paciente.numeroDocumento as numeroDocumento, FORMAT(encabezado.fechaTomaMuestra, 'dd/MM/yyyy') as fecha, encabezado.idProtocolo , solicitante.nombre as solicitante from LAB_Protocolo as encabezado  
        inner join Sys_Efector as efector on encabezado.idEfector = efector.idEfector
        inner join Sys_Efector as solicitante on encabezado.idEfectorSolicitante = solicitante.idEfector
        inner join Sys_Paciente as paciente on encabezado.idPaciente = paciente.idPaciente
        where fechaRegistro > '2020-01-01'
        AND paciente.numeroDocumento = ${paciente.documento}`;
    try {
        return await new sql.Request(pool).query(query);
    } catch (error) {
        await log.error('cda-laboratorio-central:getEncabezados', { error, query, paciente }, error.message, userScheduler);
        return error;
    }
}

export async function getDetalles(pool, idProtocolo) {
    const query = `select _item.nombre, resultadoCar  as resultado,detalle.metodo as metodo, observaciones, FORMAT(detalle.fechaValida, 'dd/MM/yyyy') as fecha_validacion, usuarioValida.apellido as profesional_validacion, usuarioValida.firmaValidacion as profesional_firma
        from LAB_DetalleProtocolo as detalle
        inner join LAB_Item as _item on _item.idItem = detalle.idItem
        inner join Sys_Usuario as usuarioValida on usuarioValida.idUsuario = detalle.idUsuarioValida
        where (detalle.idItem = 3174 or detalle.idItem = 3172)
        and detalle.idUsuarioValida <> 0
        and detalle.idProtocolo = ${idProtocolo}`;
    try {
        return await new sql.Request(pool).query(query);
    } catch (error) {
        await log.error('cda-laboratorio-central:getDetalles', { error, query }, error.message, userScheduler);
        return error;
    }
}

export async function postCDA(data: any) {
    const url = `${ANDES_HOST}/modules/cda/create`;
    const options = {
        json: data,
        headers: {
            Authorization: `JWT ${ANDES_KEY}`
        },
        responseType: 'json'
    };

    try {
        const { error, statusCode, body } = await got.post(url, options);

        if (statusCode >= 200 && statusCode < 300) {
            return body;
        }
        return (error || body);
    } catch (error) {
        if (!error.response.body?.error?.error?.includes('prestacion_existente')) {
            await log.error('cda-laboratorio-central:postCDA', { error, options, payload: error.response?.body }, error.message, userScheduler);
        }
        return error;
    }
    
}
