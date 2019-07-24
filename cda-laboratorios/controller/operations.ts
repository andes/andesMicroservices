
import * as sql from 'mssql';
import { ANDES_HOST, ANDES_KEY } from '../config.private';
import { log } from '@andes/log';
import { conSql } from '../config.private';
const request = require('request');
const cache = {};

let fakeRequest = {
    user: {
        usuario: conSql.auth.user,
        app: 'rup:prestacion:create',
        organizacion: 'sss'
    },
    ip: conSql.serverSql.server,
    connection: {
        localAddress: ''
    }
};
export async function organizacionBySisaCode(sisa) {
    return new Promise((resolve, reject) => {
        if (cache[sisa]) {
            return resolve(cache[sisa]);
        } else {
            const url = `${ANDES_HOST}/core/tm/organizaciones?sisa=${sisa}&token=${ANDES_KEY}`;
            request(url, async (error, response, body) => {
                if (!error && response.statusCode >= 200 && response.statusCode < 300) {
                    const orgs: any[] = JSON.parse(body);
                    if (orgs && orgs.length) {
                        cache[sisa] = {
                            _id: orgs[0].id,
                            nombre: orgs[0].nombre,
                        };
                        return resolve(cache[sisa]);
                    }
                }
                await log(fakeRequest, 'microservices:integration:cda-laboratorio', null, 'organizacionBySisaCode:error', null, body, error);
                return reject(error || body);
            });
        }
    });
}


export async function getEncabezados(pool, documento) {
    let query = '';
    try {
        query = 'select efector.codigoSisa as efectorCodSisa, efector.nombre as efector, encabezado.idEfector as idEfector, encabezado.apellido, encabezado.nombre, encabezado.fechaNacimiento, encabezado.sexo, ' +
            'encabezado.numeroDocumento, encabezado.fecha, encabezado.idProtocolo, encabezado.solicitante from LAB_ResultadoEncabezado as encabezado ' +
            'inner join Sys_Efector as efector on encabezado.idEfector = efector.idEfector ' +
            'where encabezado.numeroDocumento = ' + documento;
        return await new sql.Request(pool).query(query);
    } catch (ex) {
        await log(fakeRequest, 'microservices:integration:cda-laboratorio', null, 'getEncabezados:error', null, { documento, query }, ex);
        throw ex;
    }
}


export async function getDetalles(pool, idProtocolo, idEfector) {
    let query = '';
    try {
        query = 'select grupo, item, resultado, valorReferencia, observaciones, hiv, profesional_val ' +
            ' from LAB_ResultadoDetalle as detalle where esTitulo = \'No\' and detalle.idProtocolo = ' + idProtocolo + ' and detalle.idEfector = ' + idEfector;
        return await new sql.Request(pool).query(query);
    } catch (ex) {
        await log(fakeRequest, 'microservices:integration:cda-laboratorio', null, 'getDetalles:error', null, { protocolo: idProtocolo, efector: idEfector, query }, ex);
        throw ex;
    }

}

export function postCDA(data: any) {
    return new Promise((resolve: any, reject: any) => {
        const url = `${ANDES_HOST}/modules/cda/create`;
        const options = {
            url,
            method: 'POST',
            json: true,
            body: data,
            headers: {
                Authorization: `JWT ${ANDES_KEY}`
            }
        };
        request(options, async (error, response, body) => {
            if (response.statusCode >= 200 && response.statusCode < 300) {
                return resolve(body);
            }
            await log(fakeRequest, 'microservices:integration:cda-laboratorio', data.paciente.id, 'postCDA:error', null, { datos: data, body }, error);
            return resolve(error || body);
        });
    });
}
