
import * as sql from 'mssql';
import { ANDES_HOST, ANDES_KEY } from './../config.private';
const request = require('request');
const cache = {};
import { msCDALaboratoriosLog } from '../logger/msCDALaboratorios';
const log = msCDALaboratoriosLog.startTrace();
import { userScheduler,  efectoresFiltradosSIL2 } from './../config.private';

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


export async function getEncabezados(pool, paciente) {
    const documento = paciente.documento;
    const sexo = paciente.sexo === 'femenino' ? 'F' : paciente.sexo === 'masculino' ? 'M' : 'I';
    let filterEfectores = '';
  
    if(efectoresFiltradosSIL2?.length) {
        filterEfectores += `and (`;
        efectoresFiltradosSIL2.forEach(element => {
            if(element.fechaHasta != "") {
                //a fechaHasta sacar los guiones para que no falle la consulta
                element.fechaHasta = element.fechaHasta.replace(/-/g, '');
                filterEfectores += `  (encabezado.idEfector=${element.idSips} and encabezado.fecha1 <  '${element.fechaHasta}') or`;
            }
            
        });
        //Borro el ultimo 'or' agregado
        filterEfectores = filterEfectores.slice(0, -2);
        filterEfectores += ` )`;

    }
    const query = `select efector.codigoSisa as efectorCodSisa, efector.nombre as efector, encabezado.idEfector as idEfector, 
    encabezado.apellido, encabezado.nombre, encabezado.fechaNacimiento, encabezado.sexo, encabezado.numeroDocumento, 
    encabezado.fecha, encabezado.idProtocolo, encabezado.solicitante from LAB_ResultadoEncabezado as encabezado 
    inner join Sys_Efector as efector on encabezado.idEfector = efector.idEfector 
    where encabezado.numeroDocumento = '${documento}' and encabezado.sexo = '${sexo}' ${filterEfectores}`;
    try {
        return await new sql.Request(pool).query(query);
    } catch (error) {
        await log.error('cda-laboratorios:query:LAB_ResultadoEncabezado', { error, query, paciente }, error.message, userScheduler);
        return null;
    }

}

export async function getPacienteSIPS(conexion, paciente: any) {
    const documento = parseInt(paciente.documento, 10);
    const sexo = paciente.sexo === 'otro' ? 'indeterminado' : paciente.sexo;
    if (documento) {
        const query = `SELECT TOP 1 idPaciente, apellido, P.nombre, numeroDocumento,fechaNacimiento, Lower(S.nombre) as sexo
        FROM [SIPS].[dbo].[Sys_Paciente] as P inner join SIPS.dbo.Sys_Sexo as S on P.idSexo=S.idSexo
        where numeroDocumento = '${documento}' and activo=1`;
        try {
            const result = await conexion.request().query(query);
            return (result && result.recordset) ? result.recordset[0] : null;
        } catch (error) {
            await log.error('cda-laboratorios:query:LAB_getPacienteSIPS', { error, query, paciente }, error.message, userScheduler);
            return null;
        }
    } else {
        return null;
    }
}


export async function getDetalles(pool, idProtocolo, idEfector) {
    const query = 'select grupo, item, resultado, valorReferencia, observaciones, hiv, profesional_val ' +
        ' from LAB_ResultadoDetalle as detalle where esTitulo = \'No\' and detalle.idProtocolo = ' + idProtocolo + ' and detalle.idEfector = ' + idEfector;
    try {
        return await new sql.Request(pool).query(query);
    } catch (error) {
        await log.error('cda-laboratorios:query:LAB_ResultadoDetalle', { error, query }, error.message, userScheduler);
        return null;
    }
}

export async function getImpresionResultados(pool, idProtocolo, idEfector) {
    const query = `Select * from LAB_ImprimeResultado 
                    WHERE idProtocolo = ${idProtocolo} and idEfector = ${idEfector} 
                    order by ordenarea, orden , orden1, grupo`;
    try {
        return await new sql.Request(pool).query(query);
    } catch (error) {
        await log.error('cda-laboratorios:query:LAB_ImprimeResultado', { error, query }, error.message, userScheduler);
        return null;
    }
}

export function postCDA(data: any) {
    return new Promise(async (resolve: any, reject: any) => {
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
            if (error) {
                await log.error('cda-laboratorios:import:postCDA', { error, options }, error.message, userScheduler);
            }
            if (response.statusCode >= 200 && response.statusCode < 300) {
                return resolve(body);
            }
            return resolve(error || body);
        });
    });
}
