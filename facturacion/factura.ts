// import { configFacturacionAutomaticaModel } from './schemas/config-prestaciones';
import { jsonFacturacion } from './configJson/configJson';
import { getConfigAutomatica } from './services/config-factAutomatica.service';
import { IDtoFacturacion } from './interfaces/IDtoFacturacion';

export class Factura {

    async facturar(pool: any, dtoFacturacion: IDtoFacturacion) {
        await jsonFacturacion(pool, dtoFacturacion);
    }
}
