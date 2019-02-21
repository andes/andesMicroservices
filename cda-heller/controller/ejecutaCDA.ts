import { getData } from './queries';
import * as Verificator from './verificaCDA';
import { postCDA } from './../service/cda.service';
import * as factory from './queries/heller';
import * as sql from 'mssql';
import * as mysql from 'promise-mysql';
import * as ConfigPrivate from '../config.private';
import { log } from '@andes/log';

let fakeRequestSql = {
    user: {
        usuario: 'msHeller',
        app: 'integracion-heller',
        organizacion: 'sss'
    },
    ip: ConfigPrivate.staticConfiguration.heller.ip,
    connection: {
        localAddress: ''
    }
};
let fakeRequestMysql = {
    user: {
        usuario: 'msHeller',
        app: 'integracion-heller',
        organizacion: 'sss'
    },
    ip: ConfigPrivate.staticConfiguration.hellerMysql.ip,
    connection: {
        localAddress: ''
    }
};
export async function ejecutar(paciente) {
    try {
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
                log(fakeRequestSql, 'microservices:integration:heller', paciente.id, '/ejecuta CDA exito', null);

                return true;
            } else {
                return true;
            }
        } else {
            return true;
        }

    } catch (ex) {
        let fakeRequest = {
            user: {
                usuario: 'msHeller',
                app: 'integracion-heller',
                organizacion: 'sss'
            },
            ip: ConfigPrivate.staticConfiguration.heller.ip,
            connection: {
                localAddress: ''
            }
        };
        log(fakeRequest, 'microservices:integration:heller', paciente.id, 'Error en /ejecuta', ex);
        throw ex;
    }
}

export async function ejecutarMysql(paciente) {
    try {
        let data = factory.makeMysql(paciente);
        if (data) {
            let pool = await mysql.createConnection(data.connectionString);
            const registros = await pool.query(data.query);
            if (registros.length > 0) {
                let ps = registros.map(async registro => {
                    let dto = await Verificator.verificar(registro, paciente);
                    if (dto) {
                        await postCDA(dto);
                    }
                });
                await Promise.all(ps);
                pool.end();
                log(fakeRequestMysql, 'microservices:integration:heller', paciente.id, '/ejecutaMysql CDA exito', null);

                return true;
            } else {
                pool.end();
                return true;
            }

        } else {
            return true;
        }
    } catch (ex) {
        let fakeRequest = {
            user: {
                usuario: 'msHeller',
                app: 'integracion-heller',
                organizacion: 'sss'
            },
            ip: ConfigPrivate.staticConfiguration.heller.ip,
            connection: {
                localAddress: ''
            }
        };
        log(fakeRequest, 'microservices:integration:heller', paciente.id, 'Error en /ejecutarMysql', ex);
        throw ex;
    }
}

