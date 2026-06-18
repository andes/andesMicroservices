import * as moment from 'moment';
import { BaseRecetaService } from './BaseRecetaService';
import { RecetaInsumo } from '../models/receta-schema';
import { informarLog } from '../logs/recetaLogs';

export class RecetaInsumoService extends BaseRecetaService {

    async buscar(req: any) {
        const params = req.params.id ? req.params : req.query;
        const user = req.user;
        let options: any = {};

        try {
            options = this.buildPacienteOptions(params);

            if (params.tipo) options['insumo.tipo'] = params.tipo;
            if (params.estado) options['estadoActual.tipo'] = params.estado;

            this.buildEstadoDispensaOption(params, options);

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

            if (user?.type === 'app-token') {
                const sistema = user.app?.nombre?.toLowerCase();
                recetasInsumos = sistema ? await this.registrarAppNotificadas(req, recetasInsumos, sistema) : [];
            }

            return recetasInsumos;

        } catch (err) {
            await informarLog.error('buscarRecetasInsumos', { params, options }, err, req);
            return err;
        }
    }
}

export const recetaInsumoService = new RecetaInsumoService();
