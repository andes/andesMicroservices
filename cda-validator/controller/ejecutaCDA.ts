import * as Sistemas from './queries/sistemas';
import * as Verificator from './verificaCDA';
import { CdaBuilder } from './../service/cda.service';

const sql = require('mssql');

export async function ejecutar(target, dni) {
    // Paso 1: llamamos al Motor de base de datos que nos devuelve un array de prestaciones

    sql.close();
    let counter = 0;

    /* Ejecuta la consulta del hospital pasado por parámetro*/
    let data = Sistemas.getTargetQuery(target, dni);

    let pool = await sql.connect(data.connectionString);
    let resultado = await Sistemas.getData(data.query, pool);

    if (resultado.recordset.length > 0) {
        resultado.recordset.forEach(async r => {
            // Paso 2: Verificamos que los datos estén completos por cada registro y si es válido se genera el Data Transfer Object para generar 
            let dto = Verificator.verificar(r);

            if (dto && !dto.msgError) {
                // Paso 3: Invocamos a la función que genera el CDA por cada documento
                await generarCDA(dto);

            } else {
                // Inserta en la colección de cda Rejected debido a que no cumplió la verificación básica
                let info = {
                    idPrestacion: dto.id,
                    msgError: 'No cumple varificación básica: ' + dto.msgError
                };
            }

            function generarCDA(dto) {
                return new Promise(async (resolve: any, reject: any) => {
                    try {
                        let cdaBuilder = new CdaBuilder();
                        let res = await cdaBuilder.build(dto);
                        resolve();
                    } catch (ex) {
                        reject(ex);
                    }
                });
            }
            if (counter >= resultado.recordset.length) {
                console.log('Proceso finalizado... y sigue escuchando');
                // pool.close();
            } else {
                console.log('Continúa el procesamiento de información....');
            }
        });
    } else {
        // pool.close();
        console.log('No me trajo registros....');
    }
}