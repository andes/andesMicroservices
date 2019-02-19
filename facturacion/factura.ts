import { configFacturacionAutomaticaModel } from './schemas/config-prestaciones';
import { jsonFacturacion } from './configJson/configJson';

import { IDtoFacturacion } from './interfaces/IDtoFacturacion';

export class Factura {

    async facturar(pool: any, dtoFacturacion: IDtoFacturacion) {
        /* Traigo colección de configFacturacionAutomatica */
        let datosConfiguracionAutomatica = await this.getConfigFacturacionAutomatica(dtoFacturacion);

        await jsonFacturacion(pool, dtoFacturacion, datosConfiguracionAutomatica);
    }

    async getConfigFacturacionAutomatica(dtoFacturacion: IDtoFacturacion) {
        let conceptId = dtoFacturacion.prestacion.conceptId;

        let datosConfigAutomatica = await configFacturacionAutomaticaModel.findOne({ 'prestacionSnomed.conceptId': conceptId });

        return datosConfigAutomatica;
    }
}
