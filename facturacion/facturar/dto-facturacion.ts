import { getOrganizacion } from './../services/organizacion.service';
import { getProfesional } from './../services/profesional.service';
import { getSnomed } from './../services/snomed.service';
import { getPrestacion } from './../services/prestaciones.service';
import { getConfigAutomatica } from './../services/config-factAutomatica.service';
import { getPuco } from './../services/obra-social.service';

export async function facturacionAutomatica(prestacion: any) {
    let datosFactura = await formatDatosFactura(prestacion);

    const factura = {
        turno: {
            _id: datosFactura.idTurno
        },
        idPrestacion: (prestacion.data) ? prestacion.data._id : null,
        paciente: {
            nombre: datosFactura.paciente.nombre,
            apellido: datosFactura.paciente.apellido,
            dni: datosFactura.paciente.documento,
            fechaNacimiento: datosFactura.paciente.fechaNacimiento,
            sexo: datosFactura.paciente.sexo
        },
        prestacion: {
            conceptId: datosFactura.prestacion.conceptId,
            term: datosFactura.prestacion.term,
            fsn: datosFactura.prestacion.fsn,
            datosReportables: (datosFactura.datosReportables) ? datosFactura.datosReportables : null,
        },
        organizacion: {
            nombre: datosFactura.organizacion.nombre,
            cuie: datosFactura.organizacion.cuie,
            idSips: datosFactura.organizacion.idSips
        },
        obraSocial: datosFactura.obraSocial,
        profesional: (datosFactura.profesional) ? {
            nombre: datosFactura.profesional.nombre,
            apellido: datosFactura.profesional.apellido,
            dni: datosFactura.profesional.dni
        } : null
    };

    return factura;
}

async function formatDatosFactura(prestacion: any) {
    if (prestacion.origen === 'rup_rf') {
        let _datosOrganizacion: any = getOrganizacion(prestacion.data.solicitud.organizacion.id);
        let _obraSocialPaciente: any = (prestacion.data.paciente.obraSocial) ? (prestacion.data.paciente.obraSocial) : getPuco(prestacion.paciente.documento);
        let _datosProfesional: any = getProfesional(prestacion.data.solicitud.profesional.id);
        let _getDR = getDatosReportables(prestacion.data);

        let datos: any = await Promise.all([_datosOrganizacion, _obraSocialPaciente, _datosProfesional, _getDR]);

        let dtoDatos = {
            idTurno: prestacion.data.solicitud.turno,
            organizacion: datos[0].organizacion,
            obraSocial: (datos[1]) ? (datos[1]) : null,
            profesional: datos[2].profesional,
            paciente: prestacion.data.paciente,
            prestacion: prestacion.data.solicitud.tipoPrestacion,
            datosReportables: datos[3]
        };

        return dtoDatos;
    } else if (prestacion.origen === 'rf_turnos') {
        let _datosOrganizacion: any = getOrganizacion(prestacion.organizacion._id);
        let _obraSocialPaciente: any = (prestacion.obraSocial === 'prepaga') ? (prestacion.prepaga) : prestacion.paciente.obraSocial;
        let _datosProfesional: any = getProfesional(prestacion.profesionales[0]._id);
        let _getDR = null;

        let datos: any = await Promise.all([_datosOrganizacion, _obraSocialPaciente, _datosProfesional, _getDR]);

        let dtoDatos = {
            idTurno: prestacion.id,
            organizacion: datos[0].organizacion,
            obraSocial: (datos[1]) ? (datos[1]) : null,
            profesional: datos[2].profesional,
            paciente: prestacion.paciente,
            prestacion: prestacion.tipoPrestacion,
            datosReportables: null
        };
        return dtoDatos;
    } else if (prestacion.origen === 'buscador') {
        let _datosOrganizacion: any = getOrganizacion(prestacion.organizacion._id);
        let _obraSocialPaciente: any = (prestacion.paciente.obraSocial) ? (prestacion.paciente.obraSocial) : null;
        let _datosProfesional: any = (prestacion.profesionales.length > 0) ? getProfesional(prestacion.profesionales[0]._id) : null;
        let _getDR = (prestacion.idPrestacion) ? getPrestacion(prestacion.idPrestacion) : null;

        let datos: any = await Promise.all([_datosOrganizacion, _obraSocialPaciente, _datosProfesional, _getDR]);

        let dtoDatos = {
            idTurno: prestacion.turno._id,
            organizacion: datos[0].organizacion,
            obraSocial: (datos[1]) ? (datos[1]) : null,
            profesional: (datos[2]) ? datos[2].profesional : null,
            paciente: prestacion.paciente,
            prestacion: prestacion.tipoPrestacion,
            datosReportables: (datos[3]) ? await getDatosReportables(datos[3]) : null
        };
        return dtoDatos;
    }
}

async function getDatosReportables(prestacion: any) {
    if (prestacion.solicitud) {
        let idTipoPrestacion = prestacion.solicitud.tipoPrestacion.conceptId;
        let configAuto: any = await getConfigAutomatica(idTipoPrestacion);

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
