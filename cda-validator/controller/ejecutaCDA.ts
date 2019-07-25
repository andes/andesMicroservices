import { getData } from './queries';
import * as Verificator from './verificaCDA';
import { postCDA } from './../service/cda.service';
const sql = require('mssql');
import { log } from '@andes/log';
let fakeRequest = {
    user: {
        usuario: '',
        app: 'rup:prestacion:create',
        organizacion: 'sss'
    },
    ip: '',
    connection: {
        localAddress: ''
    }
};
export async function ejecutar(factory, paciente, efector) {
    try {
        let data = await factory(paciente);
        if (data) {
            sql.close();
            let pool = await sql.connect(data.connectionString);
            let resultado = await getData(pool, data.query);
            const registros = resultado.recordset;
            if (registros.length > 0) {
                let ps = registros.map(async registro => {
                    let dto = await Verificator.verificar(registro, paciente, efector);
                    if (dto) {
                        await postCDA(dto, efector);
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
    } catch (e) {
        await log(fakeRequest, 'microservices:integration:cda-validator', paciente.id, 'ejecutar:error', null, { paciente, efector }, e);
    }
}
