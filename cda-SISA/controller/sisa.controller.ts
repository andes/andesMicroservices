import { ANDES_KEY, ANDES_HOST } from '../config.private';
import { InformeLAB } from '../utils/informes/informe-lab';
import * as fs from 'fs';
import { userScheduler } from '../config.private';
import { msCDASisaLog } from '../logger/msCDASisa';
import * as moment from 'moment';

const log = msCDASisaLog.startTrace();
const cache = {};
const got = require('got');

export async function process(caso) {
    try {
        const fechaDiagnostico = moment(caso.fecha_DIAGNOSTICO).format('DD/MM/YYYY');
        const sisaCodeSSS = '10058035765691';
        const tipoPrestacion = '3031000246109'; //reporte de resultado de test de covid-19 proveniente de sistema de registro informático nacional
        const organizacion: any = await organizacionBySisaCode(sisaCodeSSS);
        const resultado = caso.clasif_RESUMEN;
        const paciente = {
            nombre: caso.nombre,
            apellido: caso.apellido,
            documento: caso.nro_DOC
        };
        const encabezado = {
            paciente,
            organizacion,
            emisor: caso.establecimiento_CARGA,
            validador: caso.estab_DIAGNOSTICO
        };

        const detalle = {
            resultado,
            metodo: 'Hisopado Nasofaríngeo',
            fecha_validacion: fechaDiagnostico,
        };

        const informe = new InformeLAB(encabezado, detalle, 'Laboratorio Central');
        fs.readFile((await informe.informe() as string), async (err, data) => {
            if (err) { throw err; }
            const adjunto64 = 'data:application/pdf;base64,' + data.toString('base64');
            const paciente = {
                documento: caso.nro_DOC,
                nombre: caso.nombre,
                apellido: caso.apellido,
                sexo: caso.sexo == 'M' ? 'masculino' : caso.sexo = 'F' ? 'femenino' : 'otro',
                fechaNacimiento: moment(caso.fecha_NACIMIENTO).format('DD/MM/YYYY')
            };
            const profesional = {
                nombre: 'NO INFORMADO',
                apellido: '-'
            };
            const dto = {
                id: caso.ideventocaso,
                organizacion: organizacion._id,
                fecha: caso.fecha_APERTURA,
                tipoPrestacion,
                paciente,
                profesional,
                confidencialidad: 'N',
                cie10: 'Z01.7',
                file: adjunto64,
                texto: resultado
            };
            await postCDA(dto);
        });
    } catch (error) {
        await log.error('cda-sisa:process', { error, caso }, error.message, userScheduler);
    }
}

export async function postCDA(data: any) {
    const url = `${ANDES_HOST}/modules/cda/create/sisa-covid`;
    const options = {
        json: data,
        headers: {
            Authorization: `JWT ${ANDES_KEY}`
        },
        responseType: 'json'
    };

    try {

        const { error, statusCode, body } = await got.post(url, options);
        if (statusCode >= 200 && statusCode < 300) {
            return body;
        }
        return (error || body);
    } catch (error) {
        return error;
    }

}

export async function organizacionBySisaCode(sisa) {
    let org;
    if (cache[sisa]) {
        org = cache[sisa];
    } else {
        const url = `${ANDES_HOST}/core/tm/organizaciones?sisa=${sisa}&token=${ANDES_KEY}`;
        const { error, statusCode, body } = await got(url, { responseType: 'json' });
        if (error) {
            return await log.error('cda-sisa:organizacionBySisaCode', { error, url }, error.message, userScheduler);
        } else if (statusCode >= 200 && statusCode < 300) {
            const orgs: any[] = body;
            if (orgs && orgs.length) {
                cache[sisa] = {
                    _id: orgs[0].id,
                    nombre: orgs[0].nombre,
                };
                org = cache[sisa];
            }
        }
    }
    return org;
}
