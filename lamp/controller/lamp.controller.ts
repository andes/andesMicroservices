import * as sql from 'mssql';
import { fakeRequest } from '../config.private';
import { patch } from '../service/lamp.service';
import { make } from './queries/laboratorio';
import { log } from '@andes/log';
import * as moment from 'moment';

// ID 9373
const resultadoNegativo = ' No se detecta genoma de SARS-CoV-2';
// ID 9374
const resultadoPosivo = 'SE DETECTA GENOMA DE SARS-CoV-2';

export async function updateFichas(data) {
    const { lamps } = data;
    let updates = [];

    if (lamps?.length) {
        const resultados = await getResultadosLAMP(lamps);
        if (resultados.recordset?.length) {
            resultados.recordset.forEach(r => {
                let ficha = lamps.find(f => f.paciente.documento === String(r.documento) );
                const fields = updateResultadoFicha(ficha, r);
                if (fields) {
                    updates.push(patch(ficha._id, fields));
                }
            });
        }
    }

    return await Promise.all(updates);
}

function updateResultadoFicha(ficha, r) {
    const seccion = ficha.secciones.find(s => s.id === 'clasificacionFinal');
    let lamp = seccion.fields.find(f => Object.keys(f)[0] === 'lamp').lamp;
    let clasificacionfinal;
    let fields;

    if (r.resultado === resultadoPosivo || r.resultado === resultadoNegativo) {
        if (r.resultado === resultadoPosivo) {
            lamp.id = 'confirmado';
            lamp.nombre = 'Se detecta genoma de SARS-CoV-2';
            clasificacionfinal = 'Confirmado';
        } else if (r.resultado === resultadoNegativo) {
            lamp.id = 'descartado';
            lamp.nombre = 'No se detecta genoma de SARS-CoV-2';
            clasificacionfinal= 'Descartado';
        };
        fields = [{ lamp }, { clasificacionfinal }];
    }
    return fields;    
}

async function getResultadosLAMP(lamps) {
    const documentos = lamps.map(f => f.paciente.documento);
    const fechaTope = moment.min(lamps.map(f => moment(f.createdAt))).format('YYYY-MM-DD');
    const data = make(documentos, fechaTope);

    try {
        sql.close();
        let pool = await sql.connect(data.connectionString);
        return await new sql.Request(pool).query(data.query);
    } catch (error) {
        log(fakeRequest, 'lamp', null, 'getResultadosLAMP:error', { error, query: data.query });
        return error;
    }
}