import * as moment from 'moment';
import { facturaSumar, validaDatosReportables } from './../facturar/sumar/factura-sumar';
import { facturaRecupero } from './../facturar/recupero-financiero/factura-recupero';

import { QuerySumar } from './../facturar/sumar/query-sumar';

import { IDtoFacturacion } from './../interfaces/IDtoFacturacion';
import { IDtoSumar } from '../interfaces/IDtoSumar';
import { IDtoRecupero } from '../interfaces/IDtoRecupero';
import async = require('async');
/**
 *
 *
 * @export
 * @param {*} pool
 * @param {IDtoFacturacion} dtoFacturacion
 * @param {*} datosConfiguracionAutomatica
 */
export async function jsonFacturacion(pool, dtoFacturacion: IDtoFacturacion) {
    let querySumar = new QuerySumar();
    let afiliadoSumar: any = await querySumar.getAfiliadoSumar(pool, dtoFacturacion.paciente.dni);
    let datoReportable = [];

    let facturacion = {
        /* Prestación Odontología */
        /* TODO: poner la expresión que corresponda */
        /* %%%%%%%%% Está en desarrollo todavía  %%%%%%%%%%%%%%%%%%%%% */
        34043003: {
            term: 'consulta de odontologia',
            sumar: (arrayPrestacion, arrayConfiguracion) => {

                let dr = {
                    idDatoReportable: '',
                    datoReportable: ''
                };

                arrayPrestacion = arrayPrestacion.filter(obj => obj !== null);
                arrayConfiguracion = arrayConfiguracion.map((dr: any) => dr[0]);

                // let caries = arrayPrestacion.find(obj => console.log("Primero: ", obj.conceptId) === console.log("Segundo: ", arrayConfiguracion[0].conceptId));

                let caries2 = arrayConfiguracion.find(obj => obj.conceptId === arrayPrestacion.conceptId);

            }
        },

        /* Prestación Otoemisiones */
        /* TODO: poner la expresión que corresponda */
        otoemisiones: {
            term: 'otoemisiones',
            sumar: (arrayPrestacion, arrayConfiguracion) => {
                if ((arrayPrestacion) && (arrayPrestacion.length > 0) && (facturacion['sumar'].preCondicionSumar())) {
                    let dr = {
                        idDatoReportable: '',
                        datoReportable: ''
                    };

                    arrayPrestacion = arrayPrestacion.filter((obj: any) => obj !== null).map((obj: any) => obj);
                    arrayConfiguracion = arrayConfiguracion.map((ac: any) => ac[0]);
                    let flagDatosReportables = true;

                    arrayPrestacion.forEach((element, index) => {
                        let oido = arrayConfiguracion.find((obj: any) => obj.conceptId === element.conceptId);

                        if (oido) {
                            let valor = arrayConfiguracion.find((obj: any) => obj.conceptId === element.valor.conceptId);
                            if (valor) {
                                dr.datoReportable += oido.valor + valor.valor + '/';
                            } else {
                                flagDatosReportables = false;
                            }
                        }
                    });
                    if (flagDatosReportables) {
                        dr.idDatoReportable = dtoFacturacion.configAutomatica.sumar.datosReportables[0].idDatosReportables;
                        dr.datoReportable = dr.datoReportable.slice(0, -1);

                        datoReportable.push(dr);
                        return datoReportable;
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }
            }
        },

        /* Prestación Niño Sano 410621008*/
        /* TODO: poner la expresión que corresponda */
        niño_sano: {
            term: 'niño sano',
            validaTA: (tArterial) => {
                let valida = false;
                const tsSistolica = '271649006';
                const taDiastolica = '271650006';
                if ((tArterial.conceptId === tsSistolica) && (tArterial.valor >= 50) && (tArterial.valor <= 300)) {
                    valida = true;
                }

                if ((tArterial.conceptId === taDiastolica) && (tArterial.valor >= 40) && (tArterial.valor <= 150)) {
                    valida = true;
                }
                return (valida);
            },
            sumar: async (arrayPrestacion, arrayConfiguracion) => {
                if ((arrayPrestacion) && (arrayPrestacion.length > 0) && (facturacion['sumar'].preCondicionSumar())) {
                    arrayPrestacion = arrayPrestacion.filter((obj: any) => obj !== null).map((obj: any) => obj);

                    let ta = '';
                    const talla = '2';
                    const tensionArterial = '3';

                    await async.forEachOf(arrayPrestacion, async (element: any, cb: any) => {
                        let dr = {
                            idDatoReportable: '',
                            datoReportable: ''
                        };

                        if (element.idDatoReportable === tensionArterial) {
                            let taValida = await facturacion.niño_sano.validaTA(element);
                            if (taValida) {
                                if (element.valor.toString().length < 3) {
                                    element.valor = 0 + element.valor.toString();

                                }
                                ta += element.valor + '/';

                                dr.idDatoReportable = element.idDatoReportable;
                                dr.datoReportable = ta;
                            } else {
                                datoReportable = null;
                            }
                        } else if (element.idDatoReportable === talla) {
                            dr.idDatoReportable = element.idDatoReportable;
                            dr.datoReportable = Math.round(element.valor).toString();
                        } else {
                            dr.idDatoReportable = element.idDatoReportable;
                            dr.datoReportable = element.valor;
                        }

                        if (datoReportable) {
                            datoReportable.push(dr);
                        }
                    });

                    if ((datoReportable && datoReportable[2]) && (datoReportable[2].idDatoReportable === tensionArterial)) {
                        datoReportable.splice(2, 1);
                        datoReportable[2].datoReportable = datoReportable[2].datoReportable.slice(0, -1);
                    }

                    return datoReportable;
                } else {
                    return null;
                }
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
        },
        sumar: {
            preCondicionSumar: () => {
                let valido = false;
                let esAfiliado = (afiliadoSumar) ? true : false;

                let niñoSano = true; /* Se valida que si la prestación es niño sano se pueda facturar si fue validada por un médico*/
                if ((dtoFacturacion.configAutomatica) && (dtoFacturacion.configAutomatica.sumar.key_datosreportables === 'niño_sano')) {
                    if (dtoFacturacion.profesional.formacionGrado !== 'medico') {
                        niñoSano = false;
                    }
                }

                let datosReportables = (dtoFacturacion.prestacion.datosReportables) ? validaDatosReportables(dtoFacturacion) : true;

                let conditionsArray = [
                    esAfiliado,
                    niñoSano,
                    datosReportables
                ];

                if (conditionsArray.indexOf(false) === -1) {
                    valido = true;
                }

                return valido;
            }
        }
    };

    let dtoSumar: IDtoSumar;
    let dtoRecupero: IDtoRecupero;
    let tipoFacturacion: String = '';
    if (dtoFacturacion.obraSocial.financiador !== 'SUMAR') {
        /* Paciente tiene OS Se factura por Recupero */
        /* TODO: Verificar si hay precondición para facturar por Recupero*/
        let os = (dtoFacturacion.obraSocial.prepaga) ? dtoFacturacion.obraSocial.idObraSocial : dtoFacturacion.obraSocial.codigoPuco;

        dtoRecupero = {
            objectId: dtoFacturacion.turno._id,
            fechaTurno: dtoFacturacion.turno.fechaTurno,
            idTipoNomenclador: dtoFacturacion.configAutomatica.recuperoFinanciero.idTipoNomenclador,
            codigo: dtoFacturacion.configAutomatica.recuperoFinanciero.codigo,
            idServicio: dtoFacturacion.configAutomatica.recuperoFinanciero.idServicio,
            dniPaciente: dtoFacturacion.paciente.dni,
            dniProfesional: dtoFacturacion.profesional.dni,
            codigoFinanciador: os,
            idEfector: dtoFacturacion.organizacion.idSips,
            motivoDeConsulta: dtoFacturacion.motivoConsulta,
            prepaga: dtoFacturacion.obraSocial.prepaga,
        };
        await facturaRecupero(pool, dtoRecupero);
    } else {
        /* Paciente NO TIENE OS se factura por Sumar */
        tipoFacturacion = 'sumar';
        let main = await facturacion.main(dtoFacturacion, tipoFacturacion);

        dtoSumar = {
            idPrestacion: dtoFacturacion.idPrestacion,
            idNomenclador: (dtoFacturacion.configAutomatica) ? dtoFacturacion.configAutomatica.sumar.idNomenclador : null,
            fechaTurno: dtoFacturacion.turno.fechaTurno,
            objectId: dtoFacturacion.turno._id,
            cuie: dtoFacturacion.organizacion.cuie,
            diagnostico: (main) ? main.diagnostico : null,
            dniPaciente: dtoFacturacion.paciente.dni,
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
    }
    // TODO: Esto queda deprecated si se consulta directo a PUCO según mail de Sumar
    // } else {
    //     // let esBeneficiario = await querySumar.validaBeneficiarioSumar(pool, dtoFacturacion.paciente);

    //     // if (!esBeneficiario) {
    //     //     await querySumar.saveBeneficiario(pool, dtoFacturacion.paciente);
    //     // }
    // }

}
