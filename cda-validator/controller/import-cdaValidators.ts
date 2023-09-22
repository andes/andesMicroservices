import { InformeCDA } from "../utils/informes/informe-cda";
import { getOrganizacion } from './../service/organizaciones.service';
import * as operations from './operations';
import * as fs from 'fs';
import moment = require("moment");

export async function importarCDA(datosCDA, paciente) {
    const organizacion: any = await getOrganizacion(datosCDA.datosExtra[0].efectorCodigoSisa);
    const informe = new InformeCDA(datosCDA, paciente, organizacion);
    fs.readFile((await informe.informe() as string), async (err, data) => {
        if (err) { throw err; }
        const adjunto64 = 'data:application/pdf;base64,' + data.toString('base64');
        const profesional = {
            nombre: datosCDA.medicoResp,
            apellido: ' '
        };

        const dto = {
            id: datosCDA.id,
            organizacion: organizacion._id,
            fecha: moment().toDate(),
            tipoPrestacion: '50849002',
            paciente,
            confidencialidad: 'N',
            profesional,
            cie10: datosCDA.diagnosticoPrincipal,
            file: adjunto64
        };
        return await operations.postCDA(dto);
    });
}