import { Queries } from './queries/queries';
import * as Verificator from './verificaCDA';
import { CdaBuilder } from './../service/cda.service';
import * as efector from './../constantes';

const sql = require('mssql');

export async function ejecutar(target, paciente) {
    // Paso 1: llamamos al Motor de base de datos que nos devuelve un array de prestaciones

    sql.close();
    let counter = 0;

    /* Ejecuta la consulta del hospital pasado por parámetro*/
    // let data = Sistemas.getTargetQuery(target, dni);
    let query = new Queries();
    let data;

    switch (target) {
        case efector.hpn: {
            data = await query.hpn(paciente);
            break;
        }
        case efector.heller: {
            data = await query.heller(paciente);
            break;
        }
        case efector.sips: {
            data = await query.sips(paciente);
            break;
        }
        default: {
            break;
        }
    }

    let pool = await sql.connect(data.connectionString);
    let resultado = await query.getData(data.query, pool);

    if (resultado.recordset.length > 0) {
        resultado.recordset.forEach(async r => {
            // Paso 2: Verificamos que los datos estén completos por cada registro y si es válido se genera el Data Transfer Object para generar 
            let dto = await Verificator.verificar(r);
            // console.log('El dto es: ', dto);
            if (dto) {
                // Paso 3: Invocamos a la función que genera el CDA por cada documento
                // console.log('El dto antes de gnerar: ', dto);
                await generarCDA(dto);

            }
            function generarCDA(objecto) {
                return new Promise(async (resolve: any, reject: any) => {
                    try {
                        let cdaBuilder = new CdaBuilder();
                        console.log('El objeto: ', objecto);
                        let c = await cdaBuilder.build(objecto);
                        resolve(c);
                    } catch (ex) {
                        console.log('palo: ', ex);
                        reject(ex);
                    }
                });
            }
            if (counter >= resultado.recordset.length) {
                console.log('Proceso finalizado... y sigue escuchando');
                pool.close();
            }
        });
    } else {
        pool.close();
        console.log('No me trajo registros....');
    }
}