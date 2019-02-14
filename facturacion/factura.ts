import { configFacturacionAutomaticaModel } from './schemas/config-prestaciones';
import { jsonFacturacion } from './configJson/configJson';

export class Factura {

    async facturar(pool, prestacion) {
        /* Traigo colección de configFacturacionAutomatica */
        let datosConfiguracionAutomatica = await this.getConfigFacturacionAutomatica(prestacion);

        await jsonFacturacion(pool, prestacion, datosConfiguracionAutomatica);
    }

    async getConfigFacturacionAutomatica(prestacion: any) {
        let conceptId = prestacion.prestacion.conceptId;

        let datosConfigAutomatica = await configFacturacionAutomaticaModel.findOne({ 'prestacionSnomed.conceptId': conceptId });

        return datosConfigAutomatica;
    }
}
