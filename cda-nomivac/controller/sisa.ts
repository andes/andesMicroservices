import { log } from '@andes/log';
import * as operations from '../service/nomivacCDA';
import { organizacionId } from '../config.private';
import { sisaVacunas } from '../service/nomivacWSsisa';
import * as moment from 'moment';
/**
 * Actualiza las vacunas de un paciente de ANDES usando el webservice de NOMIVAC
 *
 * @export consultaPecas()
 * @returns resultado
 */
export async function getVacunas(paciente) {
    if (paciente && paciente.documento) {
        try {
            const listado_vacunas: any = await sisaVacunas(paciente);
            if (listado_vacunas && listado_vacunas.aplicacionesVacunasCiudadano) {
                let promesas = [];
                const vacunas = listado_vacunas.aplicacionesVacunasCiudadano.aplicacionVacunaCiudadano;
                for (let i = 0; i < vacunas.length; i++) {
                    let texto = vacunas[i].origenNombre ? `Organización:  ${vacunas[i].origenNombre} / ` : '';
                    const dto = {
                        id: vacunas[i].idSniAplicacion.toString(), // codigo SISA de la vacuna
                        organizacion: organizacionId,
                        fecha: vacunas[i].fechaAplicacion,  // Fecha de aplicación de la dosis de vacuna.
                        tipoPrestacion: '33879002', // aplicación de una vacuna para producir inmunidad activa o pasiva
                        paciente,
                        confidencialidad: 'N',
                        profesional: {
                            nombre: '-',
                            apellido: '-'
                        },
                        cie10: 'Z26.9', // CIE10: Vacunación profilactica
                        file: null,
                        texto: texto + `Vacuna: ${vacunas[i].sniVacunaNombre} Dosis: ${vacunas[i].sniDosisNombre || ''} Esquema: ${vacunas[i].vacunaEsquemaNombre} pertenece al lote: ${vacunas[i].lote}`
                    };
                    promesas.push(operations.postCDA(dto));

                    const dtoMongoDB = {
                        idvacuna: vacunas[i].idSniAplicacion.toString(),
                        codigo: vacunas[i].idSniVacuna.toString() || '',
                        documento: vacunas[i].nrodoc,
                        apellido: vacunas[i].apellido,
                        nombre: vacunas[i].nombre,
                        fechaNacimiento: vacunas[i].fechaNacimiento,
                        sexo: paciente.sexo,
                        vacuna: vacunas[i].sniVacunaNombre,
                        dosis: vacunas[i].sniDosisNombre,
                        ordenDosis: vacunas[i].sniDosisOrden,
                        fechaAplicacion: vacunas[i].fechaAplicacion,
                        efector: vacunas[i].origenNombre,
                        esquema: vacunas[i].sniVacunaEsquemaNombre || '',
                        condicion: vacunas[i].sniAplicacionCondicionNombre || '',
                        codigoEsquema: vacunas[i].idSniVacunaEsquema,
                        codigoCondicion: vacunas[i].idSniAplicacionCondicion
                    };

                    promesas.push(operations.postMongoDB(dtoMongoDB));
                }
                await Promise.all(promesas);
            } else {
                return null;
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
