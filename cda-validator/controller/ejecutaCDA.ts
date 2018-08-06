import * as Sistemas from './queries/sistemas';
import * as Verificator from './verificaCDA';
import { CdaBuilder } from './../service/cda.service';

const sql = require('mssql')

export async function ejecutar(target) {
    // Paso 1: llamamos al Motor de base de datos que nos devuelve un array de prestaciones
    // let data: any;
    sql.close();
    let counter = 0;

    /* Ejecuta la consulta del hospital pasado por parámetro*/
    let data = Sistemas.getTargetQuery(target);

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
                console.log('Motivo de error desde la verificación: ', dto.msgError);
                // Inserta en la colección de cda Rejected debido a que no cumplió la verificación básica
                let info = {
                    idPrestacion: dto.id,
                    msgError: 'No cumple varificación básica: ' + dto.msgError
                };
                Sistemas.insertRejection(info, pool)
            }

            function generarCDA(dto) {
                return new Promise(async (resolve: any, reject: any) => {
                    try {
                        let cdaBuilder = new CdaBuilder();
                        let res = await cdaBuilder.build(dto);
                        res = JSON.parse(res);

                        // if (res.cda) {
                        //     console.log("Se inserta: ", res);
                        //     // await Sistemas.insertData(res, pool);
                        // } else {
                        //     console.log("Se inserta en rejected: ", res);
                        //     // Se inserta en la colección de cdaRejected
                        //     let info = {
                        //         idPrestacion: dto.id,
                        //         msgError: res.error.status + ': ' + res.error.error
                        //     };
                        //     // await Sistemas.insertRejection(info, pool);
                        // }

                        console.log('finaliza de generar el cda e insertar en la bd y continua con el siguiente');
                        resolve();
                    } catch (ex) {
                        reject(ex);
                    }
                })
            }
            counter = counter + 1;
            console.log('cantidad hasta el momento: ', counter);
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