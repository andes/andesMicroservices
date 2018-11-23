import { getData } from './queries';
import * as Verificator from './verificaCDA';
import { postCDA } from './../service/cda.service';
import * as factory from './queries/heller';
import * as sql from 'mssql';

export async function ejecutar(paciente) {
    let data = factory.make(paciente);
    if (data) {
        sql.close();
        let pool = await sql.connect(data.connectionString);
        let resultado = await getData(pool, data.query);
        const registros = resultado.recordset;
        if (registros.length > 0) {
            let ps = registros.map(async registro => {
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
