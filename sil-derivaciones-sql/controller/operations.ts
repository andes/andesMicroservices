
import * as sql from 'mssql';
import { ANDES_HOST, ANDES_KEY } from '../config.private';
const request = require('request');
const cache = {};

export async function organizacionBySisaCode(sisa) {
    return new Promise((resolve, reject) => {
        if (cache[sisa]) {
            return resolve(cache[sisa]);
        } else {
            const url = `${ANDES_HOST}/core/tm/organizaciones?sisa=${sisa}&token=${ANDES_KEY}`;
            request(url, (error, response, body) => {
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
                return reject(error || body);
            });
        }
    });
}


export async function getEncabezados(pool, documento) {
    const query = 'select efector.codigoSisa as efectorCodSisa, efector.nombre as efector, encabezado.idEfector as idEfector, encabezado.apellido, encabezado.nombre, encabezado.fechaNacimiento, encabezado.sexo, ' +
        'encabezado.numeroDocumento, encabezado.fecha, encabezado.idProtocolo, encabezado.solicitante from LAB_ResultadoEncabezado as encabezado ' +
        'inner join Sys_Efector as efector on encabezado.idEfector = efector.idEfector ' +
        'where encabezado.numeroDocumento = ' + documento;
    return await new sql.Request(pool).query(query);

}


export async function getDetalles(pool, idProtocolo, idEfector) {
    const query = 'select grupo, item, resultado, valorReferencia, observaciones, hiv, profesional_val ' +
        ' from LAB_ResultadoDetalle as detalle where esTitulo = \'No\' and detalle.idProtocolo = ' + idProtocolo + ' and detalle.idEfector = ' + idEfector;
    return await new sql.Request(pool).query(query);

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
        request(options, (error, response, body) => {
            if (response.statusCode >= 200 && response.statusCode < 300) {
                return resolve(body);
            }
            return resolve(error || body);
        });
    });
}
