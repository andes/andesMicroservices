import * as sql from 'mssql';
import * as configPrivate from '../config.private';

let connectionString = {
    user: configPrivate.staticConfiguration.aplicacion.user,
    password: configPrivate.staticConfiguration.aplicacion.password,
    server: configPrivate.staticConfiguration.aplicacion.server,
    database: configPrivate.staticConfiguration.aplicacion.database,
    connectionTimeout: 10000,
    requestTimeout: 45000
};
export async function recuperaDatos() {
    try {
        let conexion = await new sql.ConnectionPool(connectionString).connect();
        const query = `SELECT ef.*, app.Periodo
        ,app.Total_TH,app.TH_Oper,app.TH_Tec,app.TH_Prof,app.TH_Asis
        ,app.TH_Admin,app.TH_Medicos,app.TH_Ped,app.TH_MG, app.TH_CL,app.TH_Toco, app.TH_Enf,app.INV_GastoPer
        ,app.INV_BienesUso,app.INV_BienesCons,app.INV_ServNoPers
        ,app.RED_Complejidad,app.RED_Centros,app.RED_PuestosSanit
        ,app.RED_Camas,app.Vehiculos,app.OB_Monto,app.OB_Detalle
        ,app.OB_Estado,app.SD_Poblacion,app.SD_Mujeres
        ,app.SD_Varones,app.SD_Muj_15a49,app.SD_Menores_6
        ,app.PROD_Consultas,app.PROD_ConGuardia
        ,app.PROD_PorcConGuardia,app.PROD_Egresos
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


export async function recuperaDatosProf() {

    try {
        let conexion = await new sql.ConnectionPool(connectionString).connect();
        const query = `SELECT pe.*, ef.IdArea, ef.IdEfector FROM [PecasSalud4877] as pe INNER JOIN [Pecas_Efectores] as ef ON ef.LUGARPAGO=pe.LUGARPAGO`;
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

