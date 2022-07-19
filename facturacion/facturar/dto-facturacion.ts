import { getOrganizacion } from './../services/organizacion.service';
import { getProfesional } from './../services/profesional.service';
import { getSnomed } from './../services/snomed.service';
import { getPrestacion } from './../services/prestaciones.service';
import { getConfigAutomatica } from './../services/config-factAutomatica.service';


function facturacionAutomatica(datosFactura: any) {
    let factura = {};
    let facturaArray = [];

    for (let x = 0; x < datosFactura.length; x++) {
        factura = {
            turno: {
                _id: datosFactura[x].idTurno,
                fechaTurno: datosFactura[x].fechaPrestacion,
            },
            idPrestacion: datosFactura[x].idPrestacion,
            motivoConsulta: datosFactura[x].motivoDeConsulta,
            paciente: {
                nombre: datosFactura[x].paciente.nombre,
                apellido: datosFactura[x].paciente.apellido,
                dni: datosFactura[x].paciente.documento,
                fechaNacimiento: datosFactura[x].paciente.fechaNacimiento,
                sexo: datosFactura[x].paciente.sexo
            },
            prestacion: {
                conceptId: datosFactura[x].prestacion.conceptId,
                term: datosFactura[x].prestacion.term,
                fsn: datosFactura[x].prestacion.fsn,
                datosReportables: (datosFactura[x].datosReportables) ? datosFactura[x].datosReportables : null,
            },
            organizacion: {
                nombre: datosFactura[x].organizacion.nombre,
                cuie: datosFactura[x].organizacion.cuie,
                idSips: datosFactura[x].organizacion.idSips
            },
            obraSocial: datosFactura[x].obraSocial,
            profesional: (datosFactura[x].profesional) ? {
                nombre: datosFactura[x].profesional.nombre,
                apellido: datosFactura[x].profesional.apellido,
                dni: datosFactura[x].profesional.dni,
                formacionGrado: (datosFactura[x].profesional.formacionGrado.length > 0) ? datosFactura[x].profesional.formacionGrado.find(f => f.profesion.nombre).profesion.nombre.toLowerCase() : null
            } : null,
            configAutomatica: datosFactura[x].configAutomatica
        };
        facturaArray.push(factura);
    }
    return facturaArray;
}

export async function facturaBuscador(prestacion: any) {
    let datos: any = await getDatos(prestacion);
    let dtoDatos = {};
    let dtoDatosArray = [];

    let z = (datos[3]) ? datos[3].ejecucion.registros.length : 1;
    for (let x = 0; x < z; x++) {

        let idPrestacionEjecutada = (datos[3]) ? datos[3].ejecucion.registros[x].concepto.conceptId : null;
        let idPrestacionTurneable = (datos[3]) ? datos[3].solicitud.tipoPrestacion.conceptId : null;
        let configAuto: any = await getConfigAutomatica(idPrestacionTurneable, idPrestacionEjecutada);

        dtoDatos = {
            idTurno: (prestacion.turno && prestacion.turno._id) ? prestacion.turno._id : prestacion.idPrestacion,
            idPrestacion: prestacion.idPrestacion,
            fechaPrestacion: (prestacion.turno && prestacion.turno.horainicio) ? prestacion.turno.horaInicio : prestacion.fecha,
            organizacion: datos[0].organizacion,
            obraSocial: (datos[1]) ? (datos[1]) : null,
            profesional: (datos[2]) ? datos[2].profesional : null,
            paciente: prestacion.paciente,
            prestacion: prestacion.tipoPrestacion,
            configAutomatica: configAuto,
            datosReportables: (datos[3]) ? await getDatosReportables(datos[3], configAuto) : null
        };

        dtoDatosArray.push(dtoDatos);
    }
    return await facturacionAutomatica(dtoDatosArray);
}

export async function facturaTurno(prestacion: any) {
    let datos: any = await getDatos(prestacion);
    let configAuto: any = await getConfigAutomatica(prestacion.tipoPrestacion.conceptId, null);
    let fechaPrestacion = prestacion.fecha || prestacion.horaInicio;
    if (prestacion.turno && prestacion.turno.horaInicio) {
        fechaPrestacion = prestacion.turno.horaInicio;
    }
    let dtoDatos = [{
        idTurno: prestacion.id || prestacion._id || prestacion.idPrestacion,
        idPrestacion: prestacion.idPrestacion || prestacion.id,
        fechaPrestacion,
        organizacion: datos[0].organizacion,
        obraSocial: (datos[1]) ? (datos[1]) : null,
        profesional: datos[2].profesional,
        paciente: prestacion.paciente,
        prestacion: prestacion.tipoPrestacion,
        motivoDeConsulta: (prestacion.motivoConsulta) ? prestacion.motivoConsulta : '',
        configAutomatica: configAuto,
        datosReportables: null
    }];
    return facturacionAutomatica(dtoDatos);
}

export async function facturaRup(prestacion: any) {
    let datos: any = await getDatos(prestacion);
    let configAuto: any = await getConfigAutomatica(prestacion.tipoPrestacion.conceptId, null);

    let dtoDatos = {
        idTurno: prestacion.data.solicitud.turno,
        organizacion: datos[0].organizacion,
        obraSocial: (datos[1]) ? (datos[1]) : null,
        profesional: datos[2].profesional,
        paciente: prestacion.data.paciente,
        prestacion: prestacion.data.solicitud.tipoPrestacion,
        configAutomatica: configAuto,
        datosReportables: datos[3]
    };

    return dtoDatos;
}

async function getDatos(prestacion) {
    let _datosOrganizacion: any = getOrganizacion(prestacion.organizacion._id);
    let _obraSocialPaciente: any = (prestacion.paciente.obraSocial) ? (prestacion.paciente.obraSocial) : null;
    if (prestacion.obraSocial === 'prepaga' && prestacion.prepaga) {
        _obraSocialPaciente = prestacion.prepaga;
    }
    let _datosProfesional: any = (prestacion.profesionales.length > 0) ? (prestacion.profesionales[0]._id) ? getProfesional(prestacion.profesionales[0]._id) : getProfesional(prestacion.profesionales[0].id) : null;
    let _getDR = (prestacion.idPrestacion) ? getPrestacion(prestacion.idPrestacion) : null;

    return await Promise.all([_datosOrganizacion, _obraSocialPaciente, _datosProfesional, _getDR]);
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
