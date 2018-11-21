import { getData } from './queries';
import * as Verificator from './verificaCDA';
import { postCDA } from './../service/cda.service';
import * as factory from './queries/heller';
const sql = require('mssql');

export async function ejecutar(paciente) {
    let data = factory.make(paciente);
    if (data) {
        sql.close();
        let pool = await sql.connect(data.connectionString);
        let resultado = await getData(pool, data.query);
        const registros = resultado.recordset;
        if (registros.length > 0) {
            let ps = registros.map(async registro => {
                if (registro.grupal === 1) {
                    registro = await buscarProfesional(registro);
                }
                let dto = await Verificator.verificar(registro, paciente);
                if (dto) {
                    await postCDA(dto);
                }
            });
            await Promise.all(ps);
            return true;
        } else {
            return true;
        }
    } else {
        return true;
    }
}

async function buscarProfesional(registro) {
    let profesional = factory.profesionalGrupal();
    registro.profesional = {
        documento: profesional.profesionalDocumento ? profesional.profesionalDocumento.toString() : null,
        nombre: profesional.profesionalNombre ? profesional.profesionalNombre : null,
        apellido: profesional.profesionalApellido ? profesional.profesionalApellido : null,
    };
    if (registro.profesional.nombre && registro.profesional.apellido && registro.profesional.documento) {
        return registro;
    } else {
        registro.profesinal = null;
    }
}
