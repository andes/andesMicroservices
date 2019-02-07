import * as configFacturacionAutomatica from './schemas/config-prestaciones';
import * as configJson from './configJson/configJson';

export class Factura {

    async facturar(pool, prestacion) {
        /* Traigo colección de configFacturacionAutomatica */
        let datosConfiguracionAutomatica = await this.getConfigFacturacionAutomatica(prestacion);

        let process = await configJson.jsonFacturacion(pool, prestacion, datosConfiguracionAutomatica);
    }

    async getConfigFacturacionAutomatica(prestacion: any) {
        let conceptId = prestacion.prestacion.conceptId;

        let datosConfigAutomatica = await configFacturacionAutomatica.find({ 'prestacionSnomed.conceptId': conceptId });

        return datosConfigAutomatica[0];
    }
}
