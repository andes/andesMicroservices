// import { configFacturacionAutomaticaModel } from './schemas/config-prestaciones';
import { jsonFacturacion } from './configJson/configJson';
import { getConfigAutomatica } from './services/config-factAutomatica.service';
import { IDtoFacturacion } from './interfaces/IDtoFacturacion';

export class Factura {

    async facturar(pool: any, dtoFacturacion: IDtoFacturacion) {
        /* Traigo colección de configFacturacionAutomatica */
        // let datosConfiguracionAutomatica = await this.getConfigFacturacionAutomatica(dtoFacturacion);
        // console.log("Datos Config Automa: ", datosConfiguracionAutomatica);

        let datosConfiguracionAutomatica = await getConfigAutomatica(dtoFacturacion.prestacion.conceptId);
        // console.log("Datos Config Automa API: ", datosConfiguracionAutomatica);

        await jsonFacturacion(pool, dtoFacturacion, datosConfiguracionAutomatica[0]);
    }

    /* TODO: llamar a la api */
    // async getConfigFacturacionAutomatica(dtoFacturacion: IDtoFacturacion) {
    //     let conceptId = dtoFacturacion.prestacion.conceptId;

    //     let datosConfigAutomatica = await configFacturacionAutomaticaModel.findOne({ 'prestacionSnomed.conceptId': conceptId });

    //     return datosConfigAutomatica;
    // }
}
