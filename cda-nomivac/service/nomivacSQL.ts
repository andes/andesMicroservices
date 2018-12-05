import * as sql from 'mssql';

export async function getVacunasNomivac(pool, consulta: string) {
    const result = await new sql.Request(pool)
        .query(consulta);
    return result;
}
