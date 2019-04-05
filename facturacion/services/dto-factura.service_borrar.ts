import { getOrganizacion } from './../services/organizacion.service';
import { getPuco } from './../services/obra-social.service';
import { getProfesional } from './../services/profesional.service';
import { getSnomed } from './../services/snomed.service';
import { getConfigAutomatica } from './../services/config-factAutomatica.service';
import { getPrestaciones } from './prestaciones.service';

export function getDtoFactura(prestacion: any) {
    let origen = prestacion.origen;
    console.log("Fucking origen: ", origen);
    if (origen === 'buscador') {
        return dtoBuscador();
    } else if (origen === 'turnos') {

    } else if (origen === 'rup') {

    }

    async function dtoBuscador() {
        let idOrganizacion = prestacion.idOrganizacion;
        let idProfesional = prestacion.profesionales[0]._id;

        let _datosOrganizacion: any = getOrganizacion(idOrganizacion);
        let _obraSocialPaciente: any = getPuco(prestacion.paciente.documento);
        let _datosProfesional: any = getProfesional(idProfesional);
        let _getDR = getDatosReportables(prestacion);

        let [datosOrganizacion, obraSocialPaciente, datosProfesional, getDR] = await Promise.all([_datosOrganizacion, _obraSocialPaciente, _datosProfesional, _getDR]);
        console.log("getDR: ", getDR);
        let dto = {
            turno: {
                _id: prestacion.turno._id
            },
            paciente: {
                nombre: prestacion.paciente.nombre,
                apellido: prestacion.paciente.apellido,
                dni: prestacion.paciente.documento,
                fechaNacimiento: prestacion.paciente.fechaNacimiento,
                sexo: prestacion.paciente.sexo
            },
            prestacion: {
                conceptId: prestacion.prestacion.conceptId,
                term: prestacion.prestacion.term,
                fsn: prestacion.prestacion.fsn,
                datosReportables: getDR,
            },
            organizacion: {
                nombre: datosOrganizacion.nombre,
                cuie: datosOrganizacion.cuie,
                idSips: datosOrganizacion.idSips
            },
            obraSocial: (obraSocialPaciente) ? {
                codigoFinanciador: obraSocialPaciente.codOS,
                financiador: obraSocialPaciente.financiador
            } : null,
            profesional: {
                nombre: datosProfesional.nombre,
                apellido: datosProfesional.apellido,
                dni: datosProfesional.dni
            }
        };
console.log("DTOOO: ", dto);
        return dto;
    }

    function getConfiguracionAutomatica(conceptId: any) {
        return getConfigAutomatica(conceptId);
    }

    async function getDatosReportables(prestacion: any) {

        let prestacionDR;
        if (!prestacion.registros) {
            prestacion = await getPrestaciones(prestacion.idPrestacion);
        }

        let idTipoPrestacion = (prestacion.solicitud) ? prestacion.solicitud.tipoPrestacion.conceptId : prestacion.prestacion.conceptId;
        if (idTipoPrestacion) {
            // let idTipoPrestacion = prestacion.solicitud.tipoPrestacion.conceptId;
            let configAuto: any = await getConfiguracionAutomatica(idTipoPrestacion);

            if ((configAuto) && (configAuto.sumar.datosReportables.length > 0)) {
                let conceptos: any = [];
                const expresionesDR = configAuto.sumar.datosReportables.map((config: any) => config.valores);

                let promises = expresionesDR.map(async (exp, index) => {
                    let docs: any = await getSnomed(exp[0].expresion);

                    conceptos = docs.map((item: any) => {
                        return {
                            fsn: item.fsn,
                            term: item.term,
                            conceptId: item.conceptId,
                            semanticTag: item.semanticTag
                        };
                    });

                    // ejecutamos busqueda recursiva
                    let data: any = await buscarEnHudsFacturacion(prestacion, conceptos);

                    if (data.length > 0) {
                        let datoReportable = {
                            conceptId: data[0].registro.concepto.conceptId,
                            term: data[0].registro.concepto.term,
                            valor: (data[0].registro.valor.concepto) ? {
                                conceptId: (data[0].registro.valor.concepto) ? data[0].registro.valor.concepto.conceptId : data[0].registro.valor,
                                nombre: (data[0].registro.valor.concepto) ? data[0].registro.valor.concepto.term : data[0].registro.concepto.term
                            } : data[0].registro.valor
                        };

                        return datoReportable;
                    }
                });

                return await Promise.all(promises).then((results) => {
                    return results;
                });
            }
        }
        return '';
    }

    function buscarEnHudsFacturacion(prestacion, conceptos) {
        return new Promise(async (resolve, reject) => {
            let data = [];

            prestacion.ejecucion.registros.forEach(async registro => {
                // verificamos si el registro de la prestacion tiene alguno de
                // los conceptos en su array de registros
                let resultado = await matchConceptsFacturacion(registro, conceptos);

                if (resultado) {
                    // agregamos el resultado a a devolver
                    data.push({
                        registro: resultado
                    });
                }
            });
            resolve(data);
        });
    }

    function matchConceptsFacturacion(registro, conceptos) {
        // almacenamos la variable de matcheo para devolver el resultado
        let match = false;

        // Si no es un array entra
        if (!Array.isArray(registro['registros']) || registro['registros'].length <= 0) {
            // verificamos que el concepto coincida con alguno de los elementos enviados en los conceptos
            if (registro.concepto && registro.concepto.conceptId && conceptos.find(c => c.conceptId === registro.concepto.conceptId)) {
                match = registro;
            }

        } else {
            registro['registros'].forEach((reg: any) => {
                let encontrado = null;
                if (encontrado = matchConceptsFacturacion(reg, conceptos)) {
                    match = encontrado;
                }
            });
        }
        return match;
    }
}
