import { getOrganizacion } from './../services/organizacion.service';
import { getProfesional } from './../services/profesional.service';
import { getSnomed } from './../services/snomed.service';
import { getPrestacion } from './../services/prestaciones.service';
import { getConfigAutomatica } from './../services/config-factAutomatica.service';

export async function facturaBuscador(prestacion: any) {
    const organizacion = await getOrganizacion(prestacion.organizacion._id);
    const profesional: any = await getProfesionalPrestacion(prestacion);
    const obraSocial = getObraSocial(prestacion);
    const fechaPrestacion = prestacion.turno?.horainicio ? prestacion.turno.horaInicio : prestacion.fecha;
    const turno =  {
        _id: prestacion.turno?._id ? prestacion.turno._id : prestacion.idPrestacion,
        fechaTurno: fechaPrestacion,
    };
    let dtoDatos = [];

    const _prestacion: any = await getPrestacion(prestacion.idPrestacion);
    const idPrestacionTurneable = _prestacion?.solicitud.tipoPrestacion.conceptId;
    
    for (const registro of _prestacion.ejecucion.registros) {
        const idPrestacionEjecutada = registro.concepto.conceptId;
        const configAuto: any = await getConfigAutomatica(idPrestacionTurneable, idPrestacionEjecutada);
        const datosReportables = await getDatosReportables(_prestacion, configAuto);
        const datos = {
            turno,
            idPrestacion: prestacion.idPrestacion,
            organizacion,
            obraSocial,
            profesional,
            paciente: prestacion.paciente,
            prestacion: { ...prestacion.tipoPrestacion, datosReportables },
            configAutomatica: configAuto
        };
        dtoDatos.push(datos);
    }
    return dtoDatos;
}

export async function facturaTurno(prestacion: any) {
    const organizacion = await getOrganizacion(prestacion.organizacion._id);
    const profesional: any = await getProfesionalPrestacion(prestacion);
    const obraSocial = getObraSocial(prestacion);
    let fechaPrestacion = prestacion.fecha || prestacion.horaInicio;
    if (prestacion.turno && prestacion.turno.horaInicio) {
        fechaPrestacion = prestacion.turno.horaInicio;
    }
    const turno =  {
        _id: prestacion.id || prestacion._id || prestacion.idPrestacion,
        fechaTurno: fechaPrestacion,
    };
    let configAuto: any = await getConfigAutomatica(prestacion.tipoPrestacion.conceptId, null);
    let dtoDatos = [{
        turno,
        idPrestacion: prestacion.idPrestacion || prestacion.id,
        organizacion,
        obraSocial,
        profesional,
        paciente: prestacion.paciente,
        prestacion: prestacion.tipoPrestacion,
        motivoConsulta: (prestacion.motivoConsulta) ? prestacion.motivoConsulta : '',
        configAutomatica: configAuto,
    }];
    return dtoDatos;
}

async function getDatosReportables(prestacion: any, configAuto: any) {
    if (prestacion.solicitud) {
        if ((configAuto) && (configAuto.sumar)) {
            if (configAuto.sumar.datosReportables.length > 0) {
                let conceptos: any = [];
                const expresionesDR = configAuto.sumar.datosReportables.map((config: any) => config);

                let promises = expresionesDR.map(async (exp, index) => {
                    let docs: any = await getSnomed(exp.valores[0].expresion);

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
                            idDatoReportable: exp.idDatosReportables,
                            conceptId: data[0].registro.concepto.conceptId,
                            term: data[0].registro.concepto.term,
                            valor: (!data[0].registro.valor) ? null : (data[0].registro.valor.concepto) ? {
                                conceptId: (data[0].registro.valor.concepto) ? data[0].registro.valor.concepto.conceptId : data[0].registro.valor,
                                nombre: (data[0].registro.valor.concepto) ? data[0].registro.valor.concepto.term : data[0].registro.concepto.term
                            } : data[0].registro.valor
                        };

                        return datoReportable;
                    } else {
                        return null;
                    }
                });

                return await Promise.all(promises).then((results) => {
                    return results;
                });
            } else {
                return null;
            }
        } else {
            return null;
        }

    }
    return null;
}

function buscarEnHudsFacturacion(prestacion, conceptos) {
    let data = [];

    prestacion.ejecucion.registros.forEach(async reg => {
        // verificamos si el registro de la prestacion tiene alguno de
        // los conceptos en su array de registros
        let registro = matchConceptsFacturacion(reg, conceptos);

        if (registro) {
            // agregamos el resultado a a devolver
            data.push({ registro });
        }
    });
    return data;
}

function matchConceptsFacturacion(registro, conceptos) {
    // almacenamos la variable de matcheo para devolver el resultado
    let match = false;

    // Si no es un array entra
    if (!Array.isArray(registro['registros']) || registro['registros'].length <= 0) {
        // verificamos que el concepto coincida con alguno de los elementos enviados en los conceptos
        if (registro.concepto?.conceptId && conceptos.find(c => c.conceptId === registro.concepto.conceptId)) {
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

async function getProfesionalPrestacion(prestacion) {
    if (prestacion.profesionales.length) {
        let profesional = prestacion.profesionales[0];
        const profesionalId = profesional._id || profesional.id;
        profesional = await getProfesional(profesionalId);
        profesional.formacionGrado = profesional.formacionGrado.length ? profesional.formacionGrado.find(f => f.profesion.nombre).profesion.nombre.toLowerCase() : null;
        return profesional;
    }
    return null;
}

function getObraSocial(prestacion) {
    let obraSocial = prestacion.paciente.obraSocial;
    if (prestacion.obraSocial === 'prepaga' && prestacion.prepaga) {
        obraSocial = prestacion.prepaga;
    }
    return obraSocial;
}