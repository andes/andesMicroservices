import { verificarDatos } from '../controller/verificaCDA';
import { postCDA } from '../services/cda.service';
import { userScheduler } from './../config.private';
import { msCDAGuardiaHellerLog } from '../logger/msCDAGuardiaHeller';

const logGuardia = msCDAGuardiaHellerLog.startTrace();

export async function crearGuardia(efector: string, paciente: any, data: any, token: any) {
    let ret: any;
    try {
        let dataVerif = await verificarDatos(data, token);
        if (dataVerif.status == 200) {
            ret = await postCDA(dataVerif.dto, token);
            if (ret.cda) {
                //si devuelve paciente es porque lo crea, si no lo devuelve es porque ya existía el CDA
                return {
                    verif: true,
                    cda: ret.cda,
                    msgError: (ret.paciente) ? "CDA generado con exito" : "CDA existente",
                    data: (ret.paciente) ? dataVerif.dto : ret.cda
                };
            }
        } else {
            ret = { verif: false, msgError: dataVerif.msg, status: dataVerif.status };
        }
        return ret;
    } catch (error) {
        const msgError = error.message ? error.message : error
        logGuardia.error('guardia-heller:ejecutaCDA:crearGuardia', { paciente, efector, error }, msgError, userScheduler);
        return { dto: null, verif: false, msgError: msgError };
    }
}
