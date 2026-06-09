import * as moment from 'moment';
import * as mongoose from 'mongoose';
import * as nodeFetch from 'node-fetch';
import { Receta, RecetaInsumo, generarIdDesdeFecha } from '../models/receta-schema';
import { informarLog } from '../logs/recetaLogs';
import { ParamsIncorrect } from './recetas.error';
import { sistemasExternos } from '../config.private';

const { Types } = mongoose;

// -------------------------
// HTTP GET con timeout usando node-fetch
// -------------------------

async function httpGet(url: string, token?: string) {
    const headers: any = {};
    if (token) headers['Authorization'] = `JWT ${token}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
        const response = await nodeFetch.default(url, {
            headers,
            signal: controller.signal
        } as any);

        if (!response.ok) return null;
        return await response.json();
    } catch (err: any) {
        if (err.name === 'AbortError') throw new Error(`timeout consultando ${url}`);
        throw err;
    } finally {
        clearTimeout(timeout);
    }
}

// -------------------------
// Consulta estado de dispensa en sifaho o recetar
// -------------------------

async function consultarEstadoExterno(receta: any, sistema: string) {
    try {
        const config = sistemasExternos[sistema];
        if (!config?.url) {
            await informarLog.error('consultarEstadoExterno', { recetaId: receta.id, sistema }, new Error(`Sin URL configurada para sistema: ${sistema}`));
            return { success: false, recetaDisp: null };
        }

        const pacienteId = receta.paciente?.id?.toString();
        const recetaId = (receta._id || receta.id).toString();
        const url = `${config.url}?id=${recetaId}&pacienteId=${pacienteId}`;
        const response: any = await httpGet(url, config.token);

        if (!response) return { success: false, recetaDisp: null };

        let dispensas = response.dispensas || [];
        const estado = response.estado || '';

        dispensas = dispensas.length ? dispensas.map((dis: any) => ({
            dispensa: {
                idDispensaApp: dis.dispensa.id,
                fecha: dis.dispensa.fecha,
                medicamentos: dis.dispensa.medicamentos,
                organizacion: dis.dispensa.organizacion
            },
            estado: dis.op || estado,
        })) : [];

        const tipo = response.estado || 'sin-dispensa';
        const dispensada = ['dispensada', 'dispensa-parcial'].includes(tipo);

        return {
            success: true,
            recetaDisp: { dispensas, tipoDispensaActual: tipo },
            tipo,
            dispensada
        };
    } catch (error) {
        await informarLog.error('consultarEstadoExterno', { recetaId: receta.id, sistema }, error);
        return { success: false, error };
    }
}

// -------------------------
// Actualiza estado de dispensa en la receta
// -------------------------

async function dispensar(receta: any, operacion: string, dataDispensa: any, sistema: string) {
    const operacionMap: any = {
        dispensar: 'dispensada',
        'dispensa-parcial': 'dispensa-parcial'
    };

    const tipoDispensa = operacionMap[operacion] || null;
    const idDispensaApp = dataDispensa.id;
    if (!tipoDispensa || !dataDispensa || !idDispensaApp) return receta;

    const dispensaExistente = receta.dispensa.find((d: any) => d.idDispensaApp === idDispensaApp);
    if (!dispensaExistente) {
        const dispensa: any = { idDispensaApp };
        const tipo = operacion === 'dispensar' ? 'finalizada' : receta.estadoActual.tipo;
        dispensa.fecha = dataDispensa.fecha ? moment(dataDispensa.fecha).toDate() : moment().toDate();

        if (dataDispensa?.medicamentos?.length) {
            dispensa.medicamentos = dataDispensa.medicamentos.map((med: any) => ({
                medicamento: med.medicamento || {},
                descripcion: (med.medicamento?.nombre || '') + (med.cantidadEnvases || ''),
                unidades: med.unidades || null,
                cantidad: med.cantidad || null,
                cantidadEnvases: med.cantidadEnvases || null,
                presentacion: med.presentacion || null,
            }));
        } else if (dataDispensa?.insumos?.length) {
            dispensa.insumos = dataDispensa.insumos.map((ins: any) => ({
                insumo: ins.insumo || {},
                descripcion: ins.insumo?.nombre || '',
                cantidad: ins.cantidad || null,
                cantidadEnvases: ins.cantidadEnvases || null,
                observacion: ins.observacion || null,
            }));
        }

        dispensa.organizacion = dataDispensa.organizacion || null;
        receta.dispensa.push(dispensa);
        receta.estados.push({ tipo });
        receta.estadosDispensa.push({ tipo: tipoDispensa, idDispensaApp, fecha: dispensa.fecha, sistema });
    }

    return receta;
}

// -------------------------
// Registra la app que consultó y controla doble dispensa
// -------------------------

async function registrarAppNotificadas(req: any, recetas: any[], sistema: string) {
    const resultado: any[] = [];

    for (let receta of recetas) {
        let incluirReceta = true;
        const appN = { app: sistema, fecha: moment().toDate() };
        const arrayApps = receta.appNotificada;

        if (arrayApps.length) {
            const indiceApp = arrayApps.findIndex((a: any) => a.app === sistema);

            if (indiceApp !== -1) {
                // mismo sistema — actualizar fecha
                arrayApps[indiceApp].fecha = moment().toDate();
            } else {
                // otro sistema — verificar si ya dispensó
                const indiceOtro = arrayApps.findIndex((a: any) => a.app !== sistema);
                const sistema2 = arrayApps[indiceOtro].app;
                const resultadoExterno = await consultarEstadoExterno(receta, sistema2);

                if (resultadoExterno.success) {
                    const { recetaDisp, tipo, dispensada } = resultadoExterno;
                    if (dispensada) {
                        for (const d of recetaDisp.dispensas) {
                            if (d.estado) receta = await dispensar(receta, d.estado, d.dispensa, sistema2);
                        }
                        incluirReceta = false;
                    } else {
                        if (tipo === 'sin-dispensa') {
                            receta.appNotificada = arrayApps.filter((a: any) => a.app !== sistema2);
                            receta.appNotificada.push(appN);
                        } else {
                            arrayApps[indiceOtro].fecha = moment().toDate();
                            incluirReceta = false;
                        }
                    }
                } else {
                    incluirReceta = false;
                }
            }
        } else {
            receta.appNotificada.push(appN);
            incluirReceta = true;
        }

        await receta.save();
        if (incluirReceta) resultado.push(receta);
    }

    return resultado;
}

// -------------------------
// Funciones auxiliares compartidas
// -------------------------

function buildPacienteOptions(params: any): any {
    const pacienteId = params.pacienteId || null;
    const documento = params.documento || null;
    const sexo = params.sexo || null;

    if ((!pacienteId && (!documento || !sexo)) || (pacienteId && !Types.ObjectId.isValid(pacienteId))) {
        throw new ParamsIncorrect();
    }

    const options: any = {};
    const paramMap: any = {
        id: '_id',
        pacienteId: 'paciente.id',
        documento: 'paciente.documento',
        sexo: 'paciente.sexo'
    };

    for (const key of Object.keys(paramMap)) {
        if (params[key]) {
            options[paramMap[key]] = key === 'id' ? Types.ObjectId(params[key]) : params[key];
        }
    }

    if (Object.keys(options).length === 0) throw new ParamsIncorrect();
    return options;
}

function buildEstadoDispensaOption(params: any, options: any) {
    if (params.estadoDispensa) {
        const estadoDispensaArray = params.estadoDispensa.replace(/ /g, '').split(',');
        options['estadoDispensaActual.tipo'] = { $in: estadoDispensaArray };
    } else {
        options['estadoDispensaActual.tipo'] = 'sin-dispensa';
    }
}

// -------------------------
// Buscar recetas de un paciente
// -------------------------

export async function buscarRecetas(req: any) {
    const params = req.params.id ? req.params : req.query;
    const fechaVencimiento = moment().subtract(30, 'days').startOf('day').toDate();
    const user = req.user;
    let options: any = {};

    try {
        options = buildPacienteOptions(params);
        buildEstadoDispensaOption(params, options);

        const estadoArray = params.estado ? params.estado.replace(/ /g, '').split(',') : [];
        const fechaFin = params.fechaFin
            ? moment(params.fechaFin).endOf('day').toDate()
            : moment().endOf('day').toDate();
        const fechaInicio = params.fechaInicio
            ? moment(params.fechaInicio).startOf('day').toDate()
            : moment(fechaFin).subtract(1, 'years').startOf('day').toDate();

        if (estadoArray.length) {
            const condiciones: any[] = [];

            if (estadoArray.includes('pendiente')) {
                condiciones.push({
                    'estadoActual.tipo': 'pendiente',
                    fechaRegistro: {
                        $gte: fechaInicio,
                        $lte: params.fechaFin ? fechaFin : moment().add(10, 'days').endOf('day').toDate()
                    }
                });
            }

            if (estadoArray.includes('vigente')) {
                const fInicio = params.fechaInicio ? fechaInicio : fechaVencimiento;
                condiciones.push({
                    'estadoActual.tipo': 'vigente',
                    fechaRegistro: params.fechaFin ? { $gte: fInicio, $lte: fechaFin } : { $gte: fInicio }
                });
            }

            const includeOtros = estadoArray.filter((e: string) => e !== 'pendiente' && e !== 'vigente');
            if (includeOtros.length) {
                condiciones.push({
                    'estadoActual.tipo': { $in: includeOtros },
                    fechaRegistro: { $gte: fechaInicio, $lte: fechaFin }
                });
            }

            if (condiciones.length) options['$or'] = condiciones;
        } else {
            options['estadoActual.tipo'] = { $nin: ['eliminada'] };
            if (user?.type === 'app-token') {
                options['fechaRegistro'] = { $gte: fechaInicio, $lte: fechaFin };
            }
        }

        let recetas: any = await Receta.find(options);
        if (!recetas.length) return [];

        // Asegurar idReceta en todos los documentos
        const recetasActualizadas = [];
        for (const receta of recetas) {
            if (!receta.idReceta) {
                receta.idReceta = generarIdDesdeFecha(receta.createdAt || new Date());
                await receta.save();
            }
            recetasActualizadas.push(receta);
        }
        recetas = recetasActualizadas;

        // Registrar app notificada si es sifaho o recetar
        if (user?.type === 'app-token') {
            const sistema = user.app?.nombre?.toLowerCase();
            recetas = sistema ? await registrarAppNotificadas(req, recetas, sistema) : [];
        }

        return recetas;

    } catch (err) {
        await informarLog.error('buscarRecetas', { params, options }, err, req);
        return err;
    }
}

// -------------------------
// Buscar recetas de insumos de un paciente
// -------------------------

export async function buscarRecetasInsumos(req: any) {
    const params = req.params.id ? req.params : req.query;
    const user = req.user;
    let options: any = {};

    try {
        options = buildPacienteOptions(params);

        if (params.tipo) options['insumo.tipo'] = params.tipo;
        if (params.estado) options['estadoActual.tipo'] = params.estado;

        buildEstadoDispensaOption(params, options);

        if (params.fechaInicio || params.fechaFin) {
            const fechaInicio = params.fechaInicio
                ? moment(params.fechaInicio).startOf('day').toDate()
                : moment().subtract(1, 'years').startOf('day').toDate();
            const fechaFin = params.fechaFin
                ? moment(params.fechaFin).endOf('day').toDate()
                : moment().endOf('day').toDate();
            options['fechaRegistro'] = { $gte: fechaInicio, $lte: fechaFin };
        }

        let recetasInsumos: any = await RecetaInsumo.find(options);
        if (!recetasInsumos.length) return [];

        // Registrar app notificada si es sifaho o recetar
        if (user?.type === 'app-token') {
            const sistema = user.app?.nombre?.toLowerCase();
            recetasInsumos = sistema ? await registrarAppNotificadas(req, recetasInsumos, sistema) : [];
        }

        return recetasInsumos;

    } catch (err) {
        await informarLog.error('buscarRecetasInsumos', { params, options }, err, req);
        return err;
    }
}