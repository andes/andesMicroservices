import { log } from '@andes/log';
import { getVacunasNomivac } from '../service/nomivacSQL';
import * as operations from '../service/nomivacCDA';
import { organizacionId, SIPS_SQL } from '../config.private';
import * as sql from 'mssql';

/**
 * Actualiza las vacunas de un paciente de ANDES usando el webservice de NOMIVAC
 *
 * @export consultaPecas()
 * @returns resultado
 */
export async function getVacunas(paciente) {
    let vacunas;
    if (paciente && paciente.documento) {
        try {
            let pool = await new sql.ConnectionPool(SIPS_SQL).connect();
            let query = `select * from Nomivac where NroDocumento = ${paciente.documento} order by FechaAplicacion desc`;
            let r = await getVacunasNomivac(pool, query);
            vacunas = r.recordset;
            for (let i = 0; i < vacunas.length; i++) {
                const dto = {
                    id: vacunas[i].ID.toString(), // El id de la vacuna NOMIVAC
                    organizacion: organizacionId,
                    fecha: vacunas[i].FechaAplicacion,
                    tipoPrestacion: '33879002', // aplicación de una vacuna para producir inmunidad activa o pasiva
                    paciente,
                    confidencialidad: 'N',
                    profesional: {
                        nombre: vacunas[i].Vacunador,
                        apellido: '-'
                    },
                    cie10: 'Z26.9', // CIE10: Vacunación profilactica
                    file: null,
                    texto: `Vacuna: ${vacunas[i].Vacuna} Dosis: ${vacunas[i].Dosis} Esquema: ${vacunas[i].Esquema} pertenece al lote: ${vacunas[i].Lote}`
                };

                await operations.postCDA(dto);

                const dtoMongoDB = {
                    idvacuna: vacunas[i].ID.toString(),
                    documento: vacunas[i].NroDocumento,
                    apellido: vacunas[i].Apellido,
                    nombre: vacunas[i].Nombre,
                    fechaNacimiento: vacunas[i].FechaNacimiento,
                    sexo: vacunas[i].Sexo === 'M' ? 'masculino' : 'femenino',
                    vacuna: vacunas[i].Vacuna,
                    dosis: vacunas[i].Dosis,
                    fechaAplicacion: vacunas[i].FechaAplicacion,
                    efector: vacunas[i].Establecimiento
                };
                await operations.postMongoDB(dtoMongoDB);
            }
        } catch (e) {
            let fakeRequest = {
                user: {
                    usuario: 'msNomivac',
                    app: 'integracion-nomivac',
                    organizacion: 'sss'
                },
                ip: 'localhost',
                connection: {
                    localAddress: ''
                }
            };
            await log(fakeRequest, 'microservices:integration:nomivac', paciente.id, e, paciente);
            throw e;
        }
    } else {
        return null;
    }


}
