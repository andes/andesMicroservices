import * as sql from 'mssql';
import { SIPS_SQL } from '../config.private';

export function getVacunasNomivac(consulta: string) {
    let connection = SIPS_SQL;
    let listaRegistros: any[] = [];
    return new Promise(async (resolve: any, reject: any) => {
        try {
            await sql.connect(connection);
            let request = new sql.Request();
            request.stream = true;
            request.query(consulta);
            request.on('row', (row) => {
                listaRegistros.push(row);
            });
            request.on('error', (err) => {
                // TODO log error
                reject(err);
            });
            request.on('done', () => {
                sql.close();
                resolve(listaRegistros);
            });
        } catch (err) {
            // TODO log de errores
            reject(err);
        }
    });
}
