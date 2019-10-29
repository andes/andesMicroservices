import { jsonFacturacion } from './configJson/configJson';
import { IDtoFacturacion } from './interfaces/IDtoFacturacion';

export class Factura {

    async facturar(pool: any, dtoFacturacion: IDtoFacturacion) {
        await jsonFacturacion(pool, dtoFacturacion);
    }
}
