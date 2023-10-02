import { getData } from './queries';
import { IMapping, IQueryGuardia } from 'cda-validator/schemas/queriesGuardia';
import { Matching } from '@andes/match';
import { ConnectionPool, close } from 'mssql';
import { importarCDA } from './import-cdaValidators';
import { msCDAValidatorLog } from '../logger/msCDAValidator';
import { userScheduler } from '../config.private';
let moment = require('moment');
const log = msCDAValidatorLog.startTrace();

/**
 * ----- GUARDIAS ------
 * @param efector donde ejecutan queries
 * @param queries listado de configuracion de queries
 * @param paciente Andes
 */
export async function ejecutarGuardias(efector: string, queries: IQueryGuardia[], paciente) {
    const documento = paciente.documento; // DNI ejemplo chosma 35864863 o  7569196
    if (queries && documento) {
        let dataCDA = null;
        try {
            close();
            let queryPaciente = queries.find(q => q.nombre === 'paciente');
            const pool = await new ConnectionPool(queryPaciente.connection).connect();
            queryPaciente = await execQueryPrincipal(pool, queryPaciente, documento);
            let pacienteSips = queryPaciente.result[0];
            paciente['direccion'] = pacienteSips.direccion;
            if (pacienteSips) {
                // MATCHING PACIENTE ANDES - SIPS
                const cota = 0.95;
                const match = matchPaciente(paciente, pacienteSips);
                // si el paciente de Sips coinciden con el paciente Andes, se obtienen los datos de guardia

                if (match >= cota) {
                    // INGRESOS en Guardias
                    let queryIngresos = queries.find(q => q.principal === true);
                    // PERIODOS para obtener guardias
                    // (si no se definen fechas considera los ultimos 3 meses)
                    const fechaDesde = queryIngresos.mapping.find(m => m.param === "fechaDesde")?.value || moment().subtract(3, 'months').toDate();
                    const fechaHasta = queryIngresos.mapping.find(m => m.param === "fechaHasta")?.value || moment().toDate();

                    queryIngresos = await execQueryPrincipal(pool, queryIngresos, documento, fechaDesde, fechaHasta);
                    let nameQueryOrigin = queryIngresos.nombre;
                    const getQueriesOrigin = (nombre: string) => queries.filter(q => q.mapping.find(m => m.queryOrigin === nombre));

                    // queries que dependen de la principal
                    const queriesEjecutar2 = getQueriesOrigin(nameQueryOrigin);
                    if (queryIngresos.result.length) {
                        for (let guardia of queryIngresos.result) {
                            dataCDA = JSON.parse(JSON.stringify(guardia));
                            // Se recorren y ejecutan todas las queries de nivel 2: dependen de la principal (ingresos)
                            // para cada query, se recorren y ejecutan sus dependientes (nivel 3)
                            // quizás se puede re-pensar esto de forma recursiva
                            const resultQuery = queriesEjecutar2.map(async unaQuery => {
                                const queriesEjecutar3 = getQueriesOrigin(unaQuery.nombre);
                                let resultQuery2 = [];
                                if (!queriesEjecutar3.length) {
                                    dataCDA = getDataQuery(dataCDA, guardia, unaQuery, nameQueryOrigin, null, pool);
                                }
                                else {
                                    resultQuery2 = queriesEjecutar3.map(async query => {
                                        dataCDA = getDataQuery(dataCDA, guardia, unaQuery, nameQueryOrigin, query, pool);
                                        return dataCDA;
                                    });
                                }
                                return dataCDA;
                            });
                            await Promise.all(resultQuery);
                            const infoCDA = await dataCDA;
                            await importarCDA(infoCDA, paciente);
                        }
                    } else {
                        await log.info('guardia:query:notResult', { matching: match, pacienteSips }, userScheduler);
                    }
                } else {
                    // si no matchea se guarda en logs
                    if (pacienteSips && match < cota) {
                        let pacienteAndes = {
                            id: paciente._id,
                            documento: paciente.documento,
                            estado: paciente.estado,
                            nombre: paciente.nombre,
                            apellido: paciente.apellido,
                            sexo: paciente.sexo,
                            genero: paciente.genero,
                            fechaNacimiento: paciente.fechaNacimiento
                        };
                        await log.info('guardia:importarDatos:notMatching', { matching: match, pacienteAndes, pacienteSips }, userScheduler);
                    }
                }
            } else {
                await log.info('guardia:pacienteSips:notFound', { pacienteSips }, userScheduler);
            }
            await close();
        } catch (error) {
            await log.error('guardia:import:guardias', { error, paciente }, error.message, userScheduler);
        }
    }
}

/**
 * Se ejecutan una query y de acuerdo a los datos obtenidos, 
 * se los completa con los que se obtienen mediante otra/s queries
 * ejemplo: cuando el resultado obtenido de la primer query necesita completarse con los datos del usuario
 * @param dataOrigin resultado de la query ejecutada
* @param dataQuery query a ejecutar
 * @param nameQueryOrigin 
 * @param dataQueryChild query a ejecutar para poder completar el resultado de ejecutar dataQuery
 */
async function getDataQuery(dataCDA: any, dataOrigin: any, dataQuery: IQueryGuardia, nameQueryOrigin: string, dataQueryChild: IQueryGuardia, pool) {
    const nameQuery = dataQuery.nombre;
    dataOrigin = await executeQuery(dataOrigin, dataQuery, nameQueryOrigin, pool, nameQuery);
    if (dataQueryChild) {
        dataCDA[nameQuery] = [];
        // se ejecuta la query que indica "nameQuery" para completar el resultado
        for (const data of dataOrigin[nameQuery]) {
            const dataResult = await executeQuery(data, dataQueryChild, nameQuery, pool);
            dataCDA[nameQuery].push(dataResult);
        }
    }
    else {
        dataCDA = dataOrigin;
    }
    return dataCDA;
}
/**
 * Ejecuta la query que realiza un filtro de fecha sobre los ingresos de guardia para un paciente
 */
async function execQueryPrincipal(pool, queryPrincipal: IQueryGuardia, documento, fechaDesde = null, fechaHasta = null) {
    const formatDate = queryPrincipal.connection.formatDate || 'MM-DD-YY';
    queryPrincipal.mapping = queryPrincipal.mapping.map((map) => {
        if (map.param === 'documento') { map.value = documento }
        if (map.param === 'fechaDesde' && fechaDesde) { map.value = moment(fechaDesde).format(formatDate) }
        if (map.param === 'fechaHasta' && fechaHasta) { map.value = moment(fechaHasta).format(formatDate) }
        if (map.value) {
            queryPrincipal.query = replaceDataQuery(queryPrincipal.query, map);
        }
        return map;
    });
    const resultado = await getData(pool, queryPrincipal.query);
    queryPrincipal.result = resultado.recordset as any[] || [];
    return queryPrincipal;
}

/**
 * Se completan los datos de cada elemento del arreglo de mapeos (mapping) para una query determinada
 * que dependa (o no) de los datos de una query ya ejecutada.
 * @param dataQuery contiene los datos de la query a analizar => PODRIA ENVIARSE SOLO EL ARRAY DE MAPPING
 * @param dataOrigin resultado de la query ejecutada
 * @param nombreQueryOrigin nombre de la query de donde es dataOrigin
 * @returns arreglo mapping con sus valores correspondientes
 */
async function executeQuery(dataOrigin: any, dataQuery: IQueryGuardia, nombreQueryOrigin: string, pool, nombreResult = '') {
    const mapping = dataQuery.mapping.map(async map => {
        const elem = (map.nombreOrigin || '') as string;
        const queryOrigin = map.queryOrigin || '';
        if (dataOrigin && elem && queryOrigin === nombreQueryOrigin) {
            map.value = dataOrigin[elem] || null;
        }
        if (map.value && map.queryOrigin === nombreQueryOrigin) {
            const query = replaceDataQuery(dataQuery.query, map);
            const result = await getData(pool, query);
            const nombre = (nombreResult || map.nombreVisual || map.nombreOrigin) as string;
            dataOrigin[nombre] = result?.recordset as any[] || [];
        }
        return map;
    });
    await Promise.all(mapping);
    return dataOrigin;
}

function replaceDataQuery(query: string, map: IMapping) {
    if (map.type === 'string' || map.type === 'date') {
        query = query.replace("#" + map.param, "\'" + map.value.toString() + "\'");
    }
    if (map.type === 'number') {
        query = query.replace("#" + map.param, map.value);
    }
    return query;
}

function matchPaciente(pacAndes, pacSIPS) {
    const weights = {
        identity: 0.60,
        name: 0.05,
        gender: 0.3,
        birthDate: 0.05
    };
    const pacDto = {
        documento: pacAndes.documento ? pacAndes.documento.toString() : '',
        nombre: pacAndes.nombre ? pacAndes.nombre : '',
        apellido: pacAndes.apellido ? pacAndes.apellido : '',
        fechaNacimiento: pacAndes.fechaNacimiento ? moment(new Date(pacAndes.fechaNacimiento)).format('YYYY-MM-DD') : '',
        sexo: pacAndes.sexo ? pacAndes.sexo : ''
    };
    const pacienteSips = {
        documento: pacSIPS.numeroDocumento ? pacSIPS.numeroDocumento.toString() : '',
        nombre: pacSIPS.nombre ? pacSIPS.nombre : '',
        apellido: pacSIPS.apellido ? pacSIPS.apellido : '',
        fechaNacimiento: pacSIPS.fechaNacimiento ? moment(pacSIPS.fechaNacimiento, 'DD/MM/YYYY').format('YYYY-MM-DD') : '',
        sexo: pacSIPS.sexo === 'indeterminado' ? 'otro' : pacSIPS.sexo
    };
    const match = new Matching();
    return match.matchPersonas(pacienteSips, pacDto, weights, 'Levenshtein');
}