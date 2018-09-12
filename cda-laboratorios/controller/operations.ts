
import * as URL from 'url';
import * as sql from 'mssql';
import * as https from 'http';
import { ANDES_HOST, ANDES_KEY } from '../config.private';

export async function organizacionBySisaCode(sisa) {
    return new Promise((resolve, reject) => {
        https.get(`${ANDES_HOST}/core/tm/organizaciones?sisa=${sisa}&token=${ANDES_KEY}`, (res) => {
            let chunks = [];
            res.on('end', () => {
                const body = Buffer.concat(chunks).toString();
                const orgs: any[] = JSON.parse(body);
                if (orgs && orgs.length) {
                    return resolve({
                        _id: orgs[0].id,
                        nombre: orgs[0].nombre,
                    });
                } else {
                    reject({});
                }
            });
            res.on('data', (buffer) => {
                chunks.push(buffer);
            });

            res.on('error', (err) => {
                // console.log(err);
            });
        }).end();
    });
}


export async function getEncabezados(documento) {
    const query = 'select efector.codigoSisa as efectorCodSisa, efector.nombre as efector, encabezado.idEfector as idEfector, encabezado.apellido, encabezado.nombre, encabezado.fechaNacimiento, encabezado.sexo, ' +
        'encabezado.numeroDocumento, encabezado.fecha, encabezado.idProtocolo, encabezado.solicitante from LAB_ResultadoEncabezado as encabezado ' +
        'inner join Sys_Efector as efector on encabezado.idEfector = efector.idEfector ' +
        'where encabezado.numeroDocumento = ' + documento;
    return await new sql.Request().query(query);

}


export async function getDetalles(idProtocolo, idEfector) {
    const query = 'select grupo, item, resultado, valorReferencia, observaciones, hiv, profesional_val ' +
        ' from LAB_ResultadoDetalle as detalle where esTitulo = \'No\' and detalle.idProtocolo = ' + idProtocolo + ' and detalle.idEfector = ' + idEfector;
    return await new sql.Request().query(query);

}

export function postCDA(data) {
    return new Promise((resolve: any, reject: any) => {
        let url = URL.parse(`${ANDES_HOST}/modules/cda/create`);
        let options = {
            host: url.hostname,
            port: url.port,
            path: url.pathname,
            method: 'POST',
            headers: {
                Authorization: `JWT ${ANDES_KEY}`,
                'Content-Type': 'application/json',
            }
        };
        let req = https.request(options, (res) => {
            res.on('data', (buffer) => {
                resolve(buffer.toString());
            });
        });
        req.on('error', (e) => {
            reject(e.message);
        });
            /*write data to request body*/

        req.write(JSON.stringify(data));
        req.end();
    });
}
