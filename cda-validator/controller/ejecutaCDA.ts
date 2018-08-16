import {
    Queries
} from './queries/queries';
import * as Verificator from './verificaCDA';
import {
    CdaBuilder
} from './../service/cda.service';
import * as efector from './../constantes';
import {
    connect
} from 'net';

const sql = require('mssql');

export function ejecutar(target, paciente) {
    return new Promise(async (resolve, reject) => {
        // Paso 1: llamamos al Motor de base de datos que nos devuelve un array de prestaciones
        let counter = 0;
        let query = new Queries();
        let data;
        switch (target) {
            case efector.hpn:
                {
                    data = await query.hpn(paciente);
                    break;
                }
            case efector.heller:
                {
                    // data = await query.heller(paciente);
                    break;
                }
            case efector.sips:
                {
                    data = await query.sips(paciente);
                    break;
                }
            default:
                {
                    break;
                }
        }

        if (data) {
            sql.close();
            let pool = await sql.connect(data.connectionString);
            let resultado = await query.getData(data.query, pool);
            if (resultado.recordset.length > 0) {
                resultado.recordset.forEach(async r => {
                    // Paso 2: Verificamos que los datos estén completos por cada registro y si es válido se genera el Data Transfer Object para generar
                    let dto = await Verificator.verificar(r);
                    if (dto) {
                        // Paso 3: Invocamos a la función que genera el CDA por cada documento
                        await generarCDA(dto);
                    }

                    function generarCDA(objecto) {
                        return new Promise(async (r: any, re: any) => {
                            try {
                                let cdaBuilder = new CdaBuilder();
                                // console.log('El objeto: ', objecto);
                                let c = await cdaBuilder.build(objecto);
                                r(c);
                            } catch (ex) {
                                re(ex);
                            }
                        });
                    }
                    if (counter >= resultado.recordset.length) {
                        // pool.close();
                        resolve();
                    }
                });
            } else {
                // pool.close();
                resolve();
            }

        } else {
            // sql.close();
            resolve();
        }
    });
}