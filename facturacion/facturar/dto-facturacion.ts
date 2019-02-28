import { getOrganizacion } from './../services/organizacion.service';
import { getPuco } from './../services/obra-social.service';
import { getProfesional } from './../services/profesional.service';
import { getConfigAutomatica } from './../services/config-factAutomatica.service';
import { getSnomed } from './../services/snomed.service';
import { resolve } from 'url';

export async function facturacionAutomatica(prestacion: any) {
    let idOrganizacion = (prestacion.ejecucion) ? prestacion.ejecucion.organizacion.id : prestacion.organizacion._id;
    let idProfesional = (prestacion.solicitud) ? prestacion.solicitud.profesional.id : prestacion.profesionales[0]._id;

    /* Funciona */
    let _datosOrganizacion: any = getOrganizacion(idOrganizacion);
    let _obraSocialPaciente: any = getPuco(prestacion.paciente.documento);
    let _datosProfesional: any = getProfesional(idProfesional);
    let _getDR = getDatosReportables(prestacion);

    let [datosOrganizacion, obraSocialPaciente, datosProfesional, getDR] = await Promise.all([_datosOrganizacion, _obraSocialPaciente, _datosProfesional, _getDR]);

    const factura = {
        turno: {
            _id: (prestacion.solicitud) ? prestacion.solicitud.turno : prestacion.id,
        },
        paciente: {
            nombre: prestacion.paciente.nombre,
            apellido: prestacion.paciente.apellido,
            dni: prestacion.paciente.documento,
            fechaNacimiento: prestacion.paciente.fechaNacimiento,
            sexo: prestacion.paciente.sexo
        },
        prestacion: {
            conceptId: (prestacion.solicitud) ? prestacion.solicitud.tipoPrestacion.conceptId : prestacion.tipoPrestacion.conceptId,
            term: (prestacion.solicitud) ? prestacion.solicitud.tipoPrestacion.term : prestacion.tipoPrestacion.term,
            fsn: (prestacion.solicitud) ? prestacion.solicitud.tipoPrestacion.fsn : prestacion.tipoPrestacion.fsn,
            datosReportables: getDR,
        },
        organizacion: {
            nombre: datosOrganizacion.nombre,//(prestacion.ejecucion) ? prestacion.ejecucion.organizacion.nombre : prestacion.organizacion.nombre,
            cuie: datosOrganizacion.cuie,
            idSips: datosOrganizacion.idSips
        },
        obraSocial: (obraSocialPaciente) ? {
            codigoFinanciador: obraSocialPaciente.codOS,
            financiador: obraSocialPaciente.financiador
        } : null,
        profesional: {
            nombre: datosProfesional.nombre,//(prestacion.solicitud) ? prestacion.solicitud.profesional.nombre : prestacion.profesionales[0].nombre,
            apellido: datosProfesional.apellido,//(prestacion.solicitud) ? prestacion.solicitud.profesional.apellido : prestacion.profesionales[0].apellido,
            dni: datosProfesional.dni//(prestacion.solicitud) ? prestacion.solicitud.profesional.documento : await getProfesional(prestacion.profesionales[0]._id) // prestacion.profesionales[0].documento,
        }
    };
    console.log("Factura: ", JSON.stringify(factura));
    return factura;

}

function getConfiguracionAutomatica(conceptId: any) {
    return getConfigAutomatica(conceptId);
    // return configAutomatica.find({}).where('prestacionSnomed.conceptId').equals(conceptId);
}

async function getDatosReportables(prestacion: any) {
    if (prestacion.solicitud) {
        let idTipoPrestacion = prestacion.solicitud.tipoPrestacion.conceptId;
        let configAuto: any = await getConfiguracionAutomatica(idTipoPrestacion);

        if ((configAuto) && (configAuto[0].sumar.datosReportables.length > 0)) {
            let conceptos: any = [];
            const expresionesDR = configAuto[0].sumar.datosReportables.map((config: any) => config.valores);


            let promises = expresionesDR.map(async (exp, index) => {
                // let querySnomed = await makeMongoQuery(exp[0].expresion);
                // console.log("Query Snomed.: ", querySnomed);
                let docs: any = await getSnomed(exp[0].expresion); // await snomedModel.find(querySnomed, { fullySpecifiedName: 1, conceptId: 1, _id: false, semtag: 1 }).sort({ fullySpecifiedName: 1 });

                conceptos = docs.map((item: any) => {

                    //let termSnomed = item.fullySpecifiedName.substring(0, item.fullySpecifiedName.indexOf('(') - 1);

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
                    //let datoReportable = data;

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

            return await Promise.all(promises).then(function (results) {
                return results;
            });
        }
    }
    // return '';
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

export function matchConceptsFacturacion(registro, conceptos) {
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

// function getObraSocial(dni: any) {
//     return new Promise(async (resolve, reject) => {
//         let osPuco: any = await Puco.find({ dni: Number.parseInt(dni, 10) }).exec();

//         if (osPuco.length > 0) {
//             let obraSocial = await ObraSocial.find({ codigoPuco: osPuco[0].codigoOS }).exec();

//             resolve(obraSocial);
//         } else {
//             resolve(null);
//         }
//     });
// }

// function getProfesional(idProfesional: any) {
//     return new Promise(async (resolve, reject) => {
//         let prof: any = await profesional.findById(idProfesional).exec();

//         resolve(prof.documento);
//     });
// }
