import * as moment from 'moment';
import { facturaSumar, validaDatosReportables } from './../facturar/sumar/factura-sumar';
import { facturaRecupero } from './../facturar/recupero-financiero/factura-recupero';

import { QuerySumar } from './../facturar/sumar/query-sumar';

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
export async function jsonFacturacion(pool, dtoFacturacion: IDtoFacturacion, datosConfiguracionAutomatica) {
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
        2091000013100: {
            term: 'otoemisiones',
            sumar: (arrayPrestacion, arrayConfiguracion) => {
                let dr = {
                    idDatoReportable: '',
                    datoReportable: ''
                };

                arrayPrestacion = arrayPrestacion.filter((obj: any) => obj !== null).map((obj: any) => obj);
                arrayConfiguracion = arrayConfiguracion.map((ac: any) => ac[0]);

                arrayPrestacion.forEach((element, index) => {
                    let oido = arrayConfiguracion.find((obj: any) => obj.conceptId === element.conceptId);

                    if (oido) {
                        let valor = arrayConfiguracion.find((obj: any) => obj.conceptId === element.valor.conceptId);
                        dr.datoReportable += oido.valor + valor.valor + '/';
                    }
                });

                dr.idDatoReportable = datosConfiguracionAutomatica.sumar.datosReportables[0].idDatosReportables;
                dr.datoReportable = dr.datoReportable.slice(0, -1);

                datoReportable.push(dr);
                return datoReportable;
            }
        },

        /* Prestación Niño Sano 410621008*/
        /* TODO: poner la expresión que corresponda */
        410620009: {
            term: 'consulta de niño sano',
            sumar: async (arrayPrestacion, arrayConfiguracion) => {
                let x = 0;

                arrayConfiguracion = arrayConfiguracion.map((dr: any) => dr[0]);
                arrayPrestacion = arrayPrestacion.map((obj: any) => obj);

                arrayPrestacion.forEach((element: any) => {
                    if (element) {
                        let data = arrayConfiguracion.find((obj: any) => obj.conceptId === element.conceptId);

                        let dr = {
                            idDatoReportable: '',
                            datoReportable: ''
                        };

                        if (data) {
                            dr.idDatoReportable = datosConfiguracionAutomatica.sumar.datosReportables[x].idDatosReportables;
                            dr.datoReportable = element.valor;

                            datoReportable.push(dr);
                            x++;
                        }
                    }
                });

                return datoReportable;
            },
        },
        main: async (prestacion: any, tipoFacturacion: String) => {
            if (tipoFacturacion === 'recupero') {
                let dto: any = {
                    factura: 'recupero'
                }

                return dto;
            } else if (tipoFacturacion === 'sumar') {
                const arrayPrestacion = prestacion.prestacion.datosReportables.map((dr: any) => dr).filter((value) => value !== undefined);
                const arrayConfiguracion = datosConfiguracionAutomatica.sumar.datosReportables.map((config: any) => config.valores);

                let dto: any = {
                    factura: 'sumar',
                    diagnostico: datosConfiguracionAutomatica.sumar.diagnostico[0].diagnostico,
                    datosReportables: await facturacion[datosConfiguracionAutomatica.expresionSnomed].sumar(arrayPrestacion, arrayConfiguracion)
                };

                return dto;
            }
        },
        sumar: {
            preCondicionSumar: (dtoFacturacion: IDtoFacturacion) => {
                let valido = false;
                let esAfiliado = (afiliadoSumar) ? true : false;
                let datosReportables = (dtoFacturacion.prestacion.datosReportables) ? true : false;//validaDatosReportables(dtoFacturacion, datosConfiguracionAutomatica);

                /* TODO: validar que los DR obligatorios vengan desde RUP. A veces no se completan todos y esa
                prestación no se debería poder facturar */

                let conditionsArray = [
                    esAfiliado,
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
    if (dtoFacturacion.obraSocial) {
        /* Paciente tiene OS Se factura por Recupero */
        /* TODO: Verificar si hay precondición para facturar por Recupero*/

        dtoRecupero = {
            objectId: dtoFacturacion.turno._id,
            dniPaciente: dtoFacturacion.paciente.dni,
            dniProfesional: dtoFacturacion.profesional.dni,
            codigoFinanciador: dtoFacturacion.obraSocial.codigoFinanciador,
            idEfector: dtoFacturacion.organizacion.idSips,
        };

        await facturaRecupero(pool, dtoRecupero, datosConfiguracionAutomatica);
    } else {
        /* Paciente NO TIENE OS se factura por Sumar */
        if (facturacion['sumar'].preCondicionSumar(dtoFacturacion)) {
            tipoFacturacion = 'sumar';
            let main = await facturacion.main(dtoFacturacion, tipoFacturacion);

            dtoSumar = {
                objectId: dtoFacturacion.turno._id,
                cuie: dtoFacturacion.organizacion.cuie,
                diagnostico: main.diagnostico,
                dniPaciente: dtoFacturacion.paciente.dni,
                claveBeneficiario: afiliadoSumar.clavebeneficiario,
                idAfiliado: afiliadoSumar.id_smiafiliados,
                edad: moment(new Date()).diff(dtoFacturacion.paciente.fechaNacimiento, 'years'),
                sexo: (dtoFacturacion.paciente.sexo === 'masculino') ? 'M' : 'F',
                fechaNacimiento: dtoFacturacion.paciente.fechaNacimiento,
                anio: moment(dtoFacturacion.paciente.fechaNacimiento).format('YYYY'),
                mes: moment(dtoFacturacion.paciente.fechaNacimiento).format('MM'),
                dia: moment(dtoFacturacion.paciente.fechaNacimiento).format('DD'),
                datosReportables: main.datosReportables
            };

            await facturaSumar(pool, dtoSumar, datosConfiguracionAutomatica);
        }
    }
}
