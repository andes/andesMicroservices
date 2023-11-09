import { InformeCDA } from "../utils/informes/informe-cda";
import { getOrganizacion } from './../service/organizaciones.service';
import { postCDA } from './operations';
import { readFile } from 'fs';
import { userScheduler } from '../config.private';
import { msCDAValidatorLog } from '../logger/msCDAValidator';
const log = msCDAValidatorLog.startTrace();

export async function importarCDA(datosCDA, paciente) {
    const datosEfector = datosCDA.datosExtra[0];
    try {
        if (datosEfector.efectorCodigoSisa) {
            const organizacion: any = await getOrganizacion(datosEfector.efectorCodigoSisa);
            if (organizacion._id && organizacion.nombre) {
                const informe = new InformeCDA(datosCDA, paciente, organizacion);
                readFile((await informe.informe() as string), async (err, data) => {
                    if (err) {
                        await log.error('guardia:importarCDA:readFile_informe', { err, datosCDA, paciente }, err.message, userScheduler);
                        return null;
                    }
                    const adjunto64 = 'data:application/pdf;base64,' + data.toString('base64');
                    const profesional = {
                        nombre: datosCDA.medicoResp || 'Sin datos',
                        apellido: ' '
                    };

                    const dto = {
                        id: datosCDA.id,
                        organizacion: organizacion._id,
                        fecha: datosCDA.fechaIngreso,
                        tipoPrestacion: '50849002',
                        paciente,
                        confidencialidad: 'N',
                        profesional,
                        cie10: datosCDA.diagnosticoPrincipal || '',
                        file: adjunto64
                    };
                    return await postCDA(dto);
                });
            }
            else {
                await log.info('guardia:importarCDA:organizacionInvalida', { info: "Organización Andes incorrecta", organizacionSIPS: datosEfector, organizacionAndes: organizacion }, userScheduler);
            }
        }
        else {
            await log.info('guardia:importarCDA:faltaCodigoSISA', { info: "Organización sin código SISA de SIPS", organizacionSIPS: datosEfector }, userScheduler);
        }
    } catch (error) {
        await log.error('guardia:importarCDA', { error, datosCDA }, error.message, userScheduler);
    }
}