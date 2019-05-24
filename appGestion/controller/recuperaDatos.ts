import * as sql from 'mssql';
import * as configPrivate from '../config.private';


export async function recuperaDatos() {
    const connectionString = {
        user: configPrivate.staticConfiguration.aplicacion.user,
        password: configPrivate.staticConfiguration.aplicacion.password,
        server: configPrivate.staticConfiguration.aplicacion.server,
        database: configPrivate.staticConfiguration.aplicacion.database,
        connectionTimeout: 10000,
        requestTimeout: 45000
    };
    try {
        let conexion = await new sql.ConnectionPool(connectionString).connect();
        const query = `SELECT ef.*, app.Camas, app.Consultas, app.Egresos, app.Guardia_con, app.Periodo, app.RH
        FROM [Efectores] as ef INNER JOIN [App_Datos] as app ON ef.IdEfector=app.idEfector`;
        /*CONSULTA PARA RECUPERAR EL ULTIMO PERIODO.
        const query= `SELECT ef.*, app.Camas, app.Consultas, app.Egresos, app.Guardia_con, app.Periodo, app.RH
        FROM ([Efectores] as ef JOIN [dbo].[App_Datos] as app ON ef.IdEfector=app.idEfector)
        JOIN (
        SELECT app.idEfector, MAX(app.Periodo) as periodo
         FROM [dbo].[App_Datos] as app
         GROUP BY app.idEfector
         ) as t2 ON app.idEfector=t2.idEfector AND app.Periodo=t2.periodo`;
        */
        const result = await conexion.request().query(query);
        if (result && result.recordset) {
            return result.recordset;
        } else {
            return null;
        }
    } catch (err) {
        return err;
    }
}

