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
        const query = `SELECT ef.Efector, ef.IdEfectorSuperior, ef.IdLocalidad, ef.Localidad, ef.IdArea, ef.Area, ef.IdZona, ef.Zona, ef.NivelComp, app.* FROM [Efectores] as ef INNER JOIN [App_Datos] as app ON ef.idEfector=app.idEfector`;
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
export async function recuperaDatosMortalidad() {
    try {
        let conexion = await new sql.ConnectionPool(connectionString).connect();
        const query = `SELECT mort.*, ef.IdArea, ef.IdEfector, ef.IdZona FROM [Efectores] as ef INNER JOIN [App_Mortalidad] as mort ON ef.idEfector=mort.idEfector`;
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

