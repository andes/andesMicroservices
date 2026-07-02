import * as moment from 'moment';
import { BaseRecetaService } from './BaseRecetaService';
import { Receta, generarIdDesdeFecha } from '../models/receta-schema';
import { informarLog } from '../logs/recetaLogs';

export class RecetaService extends BaseRecetaService {

    async buscar(req: any): Promise<any> {
        const params = req.params.id ? req.params : req.query;
        const user = req.user;
        let options: any = {};

        try {
            options = this.buildPacienteOptions(params);
            this.buildEstadoDispensaOption(params, options);
            this.buildEstadoFechaOptions(params, options, user);

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

            if (user?.type === 'app-token') {
                const sistema = user.app?.nombre?.toLowerCase();
                recetas = sistema ? await this.registrarAppNotificadas(req, recetas, sistema) : [];
            }

            return recetas;

        } catch (err) {
            await informarLog.error('buscarRecetas', { params, options }, err, req);
            return err;
        }
    }

    async verificarRecetaExistente(req: any) {
        const { documento, conceptId, sexo } = req.query;

        try {
            if (!documento || !conceptId || !sexo) {
                throw new Error('Se requieren documento, conceptId y sexo');
            }

            const { RecetasParametros } = require('../models/receta-schema');
            const parametro: any = await RecetasParametros.findOne({ key: 'fechaLimite' });
            const days = (parametro && parametro.value) ? Number(parametro.value) : 30;
            const fechaLimite = moment().subtract(days, 'days').startOf('day').toDate();

            const receta: any = await Receta.findOne({
                'paciente.documento': documento,
                'paciente.sexo': sexo,
                'medicamento.concepto.conceptId': conceptId,
                'estadoActual.tipo': { $in: ['vigente', 'pendiente'] },
                'estadoDispensaActual.tipo': { $nin: ['dispensada'] },
                $or: [
                    { 'estadoActual.tipo': 'vigente', fechaRegistro: { $gte: fechaLimite } },
                    { 'estadoActual.tipo': 'pendiente', fechaRegistro: { $lte: moment().add(10, 'days').endOf('day').toDate() } }
                ]
            }).sort({ fechaRegistro: -1 });

            return { existe: !!receta, receta: receta || null };

        } catch (err) {
            await informarLog.error('verificarRecetaExistente', { documento, conceptId, sexo }, err, req);
            return err;
        }
    }

    async buscarPorProfesional(req: any) {
        const { id } = req.params;
        const { estadoReceta, desde, hasta, origenExternoApp, excluirEstado } = req.query;

        try {
            if (!id || !require('mongoose').Types.ObjectId.isValid(id)) {
                throw new Error('Id de profesional inválido');
            }

            const filter: any = { 'profesional.id': require('mongoose').Types.ObjectId(id) };

            if (estadoReceta) filter['estadoActual.tipo'] = estadoReceta;

            if (desde || hasta) {
                filter['fechaRegistro'] = {};
                if (desde) filter['fechaRegistro'].$gte = moment(desde).startOf('day').toDate();
                if (hasta) filter['fechaRegistro'].$lte = moment(hasta).endOf('day').toDate();
            }

            if (origenExternoApp) filter['origenExterno.app'] = origenExternoApp;

            if (excluirEstado) {
                const estados = typeof excluirEstado === 'string'
                    ? excluirEstado.split(',').map((e: string) => e.trim())
                    : Array.isArray(excluirEstado) ? excluirEstado : [excluirEstado];
                filter['estadoActual.tipo'] = { $nin: estados };
            }

            return await Receta.find(filter);

        } catch (err) {
            await informarLog.error('buscarPorProfesional', { id, query: req.query }, err, req);
            return err;
        }
    }
}

export const recetaService = new RecetaService();