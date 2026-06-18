import * as moment from 'moment';
import { BaseRecetaService } from './BaseRecetaService';
import { Receta, generarIdDesdeFecha } from '../models/receta-schema';
import { informarLog } from '../logs/recetaLogs';

export class RecetaService extends BaseRecetaService {

    async buscar(req: any) {
        const params = req.params.id ? req.params : req.query;
        const fechaVencimiento = moment().subtract(30, 'days').startOf('day').toDate();
        const user = req.user;
        let options: any = {};

        try {
            options = this.buildPacienteOptions(params);
            this.buildEstadoDispensaOption(params, options);

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
}

export const recetaService = new RecetaService();
