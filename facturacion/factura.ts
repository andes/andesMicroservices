import * as configFacturacionAutomatica from './schemas/config-prestaciones';
import * as configJson from './configJson/configJson';

export class Factura {

    async facturar(pool, prestacion) {
        console.log("LLega prestacion a Facturar Nuevoooo: ", JSON.stringify(prestacion));
        /* Traigo colección de configFacturacionAutomatica */
        let datosConfiguracionAutomatica = await this.getConfigFacturacionAutomatica(prestacion);

        let process = await configJson.jsonFacturacion(pool, prestacion, datosConfiguracionAutomatica);
    }

    async getConfigFacturacionAutomatica(prestacion: any) {
        // return new Promise(async (resolve, reject) => {
        //     const query = configFacturacionAutomatica.find();
        //     query.exec((err, data) => {
        //         if (err) {
        //             return err;
        //         }
        //         console.log("Data Config: ", data);
        //         resolve(data);

        //     });
        // });
        // return new Promise(async (resolve, reject) => {
        //     let conceptId = prestacion.prestacion.conceptId;

        //     let datosConfigAutomatica = await configFacturacionAutomatica.find({ 'nomencladorRecuperoFinanciero': '42.01.01' });
        //     console.log("Data congiggg: ", datosConfigAutomatica);

        // });

        let conceptId = prestacion.prestacion.conceptId;


        // let datosConfigAutomatica = await configFacturacionAutomatica.find({}).where('snomed.conceptId').equals(conceptId);
        // console.log("Datos Config Automatica: ", datosConfigAutomatica);
        // query.exec((err, data) => {
        //     if (err) {
        //         return err;
        //     }
        //     console.log("Datos Config Automatica: ", data);
        //     return data[0];
        // });
        let datosConfigAutomatica = await configFacturacionAutomatica.find({ 'prestacionSnomed.conceptId': conceptId });
        console.log("Datos Config Automatica: ", datosConfigAutomatica);
        return datosConfigAutomatica[0];
    }
}