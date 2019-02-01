import * as moment from 'moment';
import * as facturaSumar from './../facturar/sumar/factura-sumar';
import * as facturaRecupero from './../facturar/recupero-financiero/factura-recupero';

import { QuerySumar } from './../facturar/sumar/query-sumar';

export async function jsonFacturacion(pool, prestacion, datosConfiguracionAutomatica) {
    let querySumar = new QuerySumar();

    let afiliadoSumar: any = await querySumar.getAfiliadoSumar(pool, prestacion.paciente.dni);

    let datoReportable = [];

    let facturacion = {
        /* Prestación Otoemisiones */
        /* TODO: poner la expresión que corresponda */
        '2091000013100': {
            term: "otoemisiones",
            sumar: function (arrayPrestacion, arrayConfiguracion) {
                console.log("Entra a otoemisiones");
                let dr = {
                    idDatoReportable: '',
                    datoReportable: ''
                };

                arrayPrestacion = arrayPrestacion.filter(obj => obj !== null);

                arrayConfiguracion = arrayConfiguracion.map((dr: any) => dr[0]);
                console.log("Capo: ", arrayConfiguracion);
                let x = 0;

                arrayPrestacion.forEach((element, index) => {
                    let oido = arrayConfiguracion.find(obj => obj.conceptId === element.conceptId);

                    if (oido) {
                        let valor = arrayConfiguracion.find(obj => obj.conceptId === element.valor.conceptId);
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
        '410620009': {
            term: "consulta de niño sano, recién nacido",
            sumar: async function (arrayPrestacion, arrayConfiguracion) {
                console.log("Entra a niño sano");
                let x = 0;

                console.log("Array Prestacion", arrayPrestacion);

                arrayConfiguracion = arrayConfiguracion.map((dr: any) => dr[0]);
                console.log("Array Configuracion: ", arrayConfiguracion);
                arrayPrestacion.forEach((element: any) => {
                    console.log("Element: ", element);

                    if (element) {
                        let data = arrayConfiguracion.find((obj: any) => obj.conceptId === element.conceptId);
                        console.log("Data: ", data);

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
        main: async function (prestacion: any, tipoFacturacion: any) {
            if (tipoFacturacion === 'recupero') {
                let dto: any = {
                    factura: 'recupero'
                }

                return dto;
            } else if (tipoFacturacion === 'sumar') {
                const arrayPrestacion = prestacion.prestacion.datosReportables.map((dr: any) => dr);

                const arrayConfiguracion = datosConfiguracionAutomatica.sumar.datosReportables.map((config: any) => config.valores);

                let dto: any = {
                    factura: 'sumar',
                    diagnostico: datosConfiguracionAutomatica.sumar.diagnostico[0].diagnostico,
                    datosReportables: await facturacion[datosConfiguracionAutomatica.expresionSnomed].sumar(arrayPrestacion, arrayConfiguracion)
                };

                return dto;
            }
        },
        'sumar': {
            preCondicionSumar: function (prestacion) {
                let valido = false;
                let esAfiliado = (afiliadoSumar) ? true : false;
                let datosReportables = (prestacion.prestacion.datosReportables) ? true : false;

                /* TODO: validar que los DR obligatorios vengan desde RUP. A veces no se completan todos y esa
                prestación no se debería poder facturar */

                let conditionsArray = [
                    esAfiliado,
                    datosReportables
                ]

                if (conditionsArray.indexOf(false) === -1) {
                    valido = true;
                }

                return valido;
            }
        }
    }

    let dtoSumar: any = {};
    let dtoRecupero: any = {};
    let tipoFacturacion = '';

    if (prestacion.obraSocial) {
        /* Paciente tiene OS Se factura por Recupero */
        /* TODO: Verificar si hay precondición para facturar por Recupero*/

        dtoRecupero = {
            objectId: prestacion.turno._id,
            dniPaciente: prestacion.paciente.dni,
            dniProfesional: prestacion.profesional.dni,
            codigoFinanciador: prestacion.obraSocial.codigoFinanciador,
            idEfector: prestacion.organizacion.idSips,
        }

        facturaRecupero.facturaRecupero(pool, dtoRecupero, datosConfiguracionAutomatica);
    } else {
        /* Paciente NO TIENE OS se factura por Sumar */

        if (facturacion['sumar'].preCondicionSumar(prestacion)) {
            tipoFacturacion = 'sumar';
            let main = await facturacion.main(prestacion, tipoFacturacion);

            dtoSumar = {
                objectId: prestacion.turno._id,
                cuie: prestacion.organizacion.cuie,
                diagnostico: main.diagnostico,
                dniPaciente: prestacion.paciente.dni,
                claveBeneficiario: afiliadoSumar.clavebeneficiario,
                idAfiliado: afiliadoSumar.id_smiafiliados,
                edad: moment(new Date()).diff(prestacion.paciente.fechaNacimiento, 'years'),
                sexo: (prestacion.paciente.sexo === 'masculino') ? 'M' : 'F',
                fechaNacimiento: prestacion.paciente.fechaNacimiento,
                anio: moment(prestacion.paciente.fechaNacimiento).format('YYYY'),
                mes: moment(prestacion.paciente.fechaNacimiento).format('MM'),
                dia: moment(prestacion.paciente.fechaNacimiento).format('DD'),
                datosReportables: main.datosReportables
            }

            facturaSumar.facturaSumar(pool, dtoSumar, datosConfiguracionAutomatica);
        }
    }
}
