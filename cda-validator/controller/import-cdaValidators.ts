import { InformeCDA } from "../utils/informes/informe-cda";
import { getOrganizacion } from './../service/organizaciones.service';
import { postCDA } from './operations';
import { readFile } from 'fs';
import { userScheduler } from '../config.private';
import { msCDAValidatorLog } from '../logger/msCDAValidator';
import moment = require("moment");
const log = msCDAValidatorLog.startTrace();

export async function importarCDA(datosCDA, paciente) {
    try {
        const organizacion: any = await getOrganizacion(datosCDA.datosExtra[0].efectorCodigoSisa);
        const informe = new InformeCDA(datosCDA, paciente, organizacion);
        readFile((await informe.informe() as string), async (err, data) => {
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
            return await postCDA(dto);
        });
    } catch (error) {
        await log.error('guardia:importarCDA', { error, datosCDA }, error.message, userScheduler);
    }
}