import * as moment from 'moment';
import { userScheduler } from '../config.private';
import { msFacturacionLog } from '../logger/msFacturacion';
const log = msFacturacionLog.startTrace();

import { facturaSumar } from './../facturar/sumar/factura-sumar';
import { facturaRecupero } from './../facturar/recupero-financiero/factura-recupero';
import { drNiñoSano, drOtoemisiones } from './datos-reportables';

import { QuerySumar } from './../facturar/sumar/query-sumar';
import { QueryRecupero, getIdTipoNomencladorSIPS, updateRelPacienteObraSocial } from './../facturar/recupero-financiero/query-recupero';

import { IDtoFacturacion } from './../interfaces/IDtoFacturacion';
import { IDtoSumar } from '../interfaces/IDtoSumar';
import { IDtoRecupero } from '../interfaces/IDtoRecupero';

/**
 *
 *
 * @export
 * @param {*} pool
 * @param {IDtoFacturacion} dtoFacturacion
 * @param {*} datosConfiguracionAutomatica
 */
export async function exportarFacturacion(pool, dtoFacturacion: IDtoFacturacion) {
    let querySumar = new QuerySumar();
    let afiliadoSumar: any = await querySumar.getAfiliadoSumar(pool, dtoFacturacion.paciente.documento);

    let facturacion = {
        /* Prestación Otoemisiones */
        /* TODO: poner la expresión que corresponda */
        otoemisiones: {
            term: 'otoemisiones',
            sumar: (arrayPrestacion, arrayConfiguracion) => {
                let dto = {
                    pool: pool,
                    dtoFacturacion: dtoFacturacion,
                    arrayPrestacion: arrayPrestacion,
                    arrayConfiguracion: arrayConfiguracion,
                    afiliadoSumar: afiliadoSumar
                };
                return drOtoemisiones(dto);
            }
        },

        /* Prestación Niño Sano 410621008*/
        /* TODO: poner la expresión que corresponda */
        niño_sano: {
            term: 'niño sano',
            sumar: (arrayPrestacion, arrayConfiguracion) => {
                let dto = {
                    pool: pool,
                    dtoFacturacion: dtoFacturacion,
                    arrayPrestacion: arrayPrestacion,
                    arrayConfiguracion: arrayConfiguracion,
                    afiliadoSumar: afiliadoSumar
                };
                return drNiñoSano(dto);
            },
        },
        main: async (prestacion: any, tipoFacturacion: String) => {
            if (tipoFacturacion === 'recupero') {
                let dto: any = {
                    factura: 'recupero'
                };

                return dto;
            } else if (tipoFacturacion === 'sumar') {
                const arrayPrestacion = (prestacion.prestacion.datosReportables !== null) ? prestacion.prestacion.datosReportables.map((dr: any) => dr).filter((value) => value !== undefined) : null;
                const arrayConfiguracion = (dtoFacturacion.configAutomatica) ? dtoFacturacion.configAutomatica.sumar.datosReportables.map((config: any) => config.valores) : null;

                if (arrayConfiguracion) {
                    let dto: any = {
                        factura: 'sumar',
                        diagnostico: dtoFacturacion.configAutomatica.sumar.diagnostico[0].diagnostico,
                        datosReportables: await facturacion[dtoFacturacion.configAutomatica.sumar.key_datosreportables].sumar(arrayPrestacion, arrayConfiguracion)
                    };
                    return dto;
                } else {
                    return null;
                }
            }
        }
    };

    let dtoSumar: IDtoSumar;
    let dtoRecupero: IDtoRecupero;
    let tipoFacturacion: String = '';
    const fechaTurno = dtoFacturacion.turno.fechaTurno;
    if (dtoFacturacion.obraSocial.financiador !== 'SUMAR') {
        /* Paciente tiene OS Se factura por Recupero */
        /* TODO: Verificar si hay precondición para facturar por Recupero*/
        let os = (dtoFacturacion.obraSocial.prepaga) ? dtoFacturacion.obraSocial.idObraSocial : dtoFacturacion.obraSocial.codigoPuco;
        const configAutomatica = dtoFacturacion.configAutomatica;
        if (configAutomatica) {
            let queryRecupero = new QueryRecupero();
            const idPaciente = await queryRecupero.getIdPacienteSips(pool, dtoFacturacion.paciente.documento);

            if (idPaciente) {
                dtoRecupero = {
                    objectId: dtoFacturacion.turno._id,
                    fechaTurno,
                    idTipoNomenclador: configAutomatica.recuperoFinanciero.idTipoNomenclador,
                    codigo: configAutomatica.recuperoFinanciero.codigo,
                    idServicio: configAutomatica.recuperoFinanciero.idServicio,
                    idPaciente,
                    dniProfesional: dtoFacturacion.profesional.documento,
                    codigoFinanciador: os,
                    idEfector: dtoFacturacion.organizacion.idSips,
                    motivoDeConsulta: dtoFacturacion.motivoConsulta,
                    prepaga: dtoFacturacion.obraSocial.prepaga,
                };

                const idObraSocial = await queryRecupero.getIdObraSocialSips(pool, dtoRecupero);

                if (idObraSocial && typeof idObraSocial === 'number') {
                    // si no existe la relacion paciente/obra social, la creamos
                    await updateRelPacienteObraSocial(pool, idPaciente, idObraSocial);
                    //obtenemos el idTipoNomenclador desde SIPS
                    dtoRecupero.idTipoNomenclador = await getIdTipoNomencladorSIPS(idObraSocial, fechaTurno, pool);
                }

                await facturaRecupero(pool, dtoRecupero);
            }
        } else {
            log.error('jsonFacturacion:recupero:sinConfiguracion', { prestacion: dtoFacturacion.prestacion }, 'la prestacion no está configurada', userScheduler);
        }
    } else {
        /* Paciente NO TIENE OS se factura por Sumar */
        tipoFacturacion = 'sumar';
        let main = await facturacion.main(dtoFacturacion, tipoFacturacion);
        try {
            dtoSumar = {
                idPrestacion: dtoFacturacion.idPrestacion,
                idNomenclador: (dtoFacturacion.configAutomatica) ? dtoFacturacion.configAutomatica.sumar.idNomenclador : null,
                fechaTurno,
                objectId: dtoFacturacion.turno._id,
                cuie: dtoFacturacion.organizacion.cuie,
                diagnostico: (main) ? main.diagnostico : null,
                dniPaciente: dtoFacturacion.paciente.documento,
                profesional: dtoFacturacion.profesional,
                claveBeneficiario: afiliadoSumar.clavebeneficiario,
                idAfiliado: afiliadoSumar.id_smiafiliados,
                edad: moment(new Date()).diff(dtoFacturacion.paciente.fechaNacimiento, 'years'),
                sexo: (dtoFacturacion.paciente.sexo === 'masculino') ? 'M' : 'F',
                fechaNacimiento: dtoFacturacion.paciente.fechaNacimiento,
                anio: moment(dtoFacturacion.paciente.fechaNacimiento).format('YYYY'),
                mes: moment(dtoFacturacion.paciente.fechaNacimiento).format('MM'),
                dia: moment(dtoFacturacion.paciente.fechaNacimiento).format('DD'),
                datosReportables: (main) ? main.datosReportables : null
            };
            await facturaSumar(pool, dtoSumar);
        } catch (error) {
            log.error('jsonFacturacion:sumar:error', { dtoFacturacion, dtoSumar }, error, userScheduler);
        }
    }
}
