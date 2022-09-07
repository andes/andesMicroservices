import { userScheduler } from '../../config.private';
import { getAfiliadoSumar, getComprobante, getNomencladorSumar, getPrestacionSips, insertComprobante, saveDatosReportablesSumar, savePrestacionSumar } from '../../facturar/sumar/query-sumar';
import { getDatosReportables, getDatosTurno, getPrestacion, updateEstadoFacturacionConTurno, updateEstadoFacturacionSinTurno } from '../../services/prestaciones.service';
import { msFacturacionLog } from '../../logger/msFacturacion';
import { getOrganizacion } from '../../services/organizacion.service';
const log = msFacturacionLog.startTrace();
const sql = require('mssql');

export async function facturacionSumar(pool, data) {
    let estado = 'Sin Comprobante';
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
        const request = await new sql.Request(transaction);
        const objectId = data.turno?._id ? data.turno._id : data.idPrestacion;
        const fechaPrestacion = data.turno?.horainicio ? data.turno.horaInicio : data.fecha;
        const organizacion: any = await getOrganizacion(data.organizacion._id);
        const cuie = organizacion.codigo.cuie;
        const afiliadoSumar: any = await getAfiliadoSumar(pool, data.paciente.documento);

        let idComprobante = await getComprobante(pool, objectId);
        if (!idComprobante) {
            estado = 'Comprobante sin prestacion';
            idComprobante = await insertComprobante(request, cuie, fechaPrestacion, afiliadoSumar, objectId);
        }

        const prestacion: any = await getPrestacion(data.idPrestacion);
        const configuracionFacturacion = await getDatosReportables(prestacion);
        if (configuracionFacturacion?.length) {
            
            const configuracionSumar = configuracionFacturacion[0].sumar;
            const idNomenclador = configuracionSumar.idNomenclador;
            const diagnostico = configuracionSumar.diagnostico.diagnostico;
            let idPrestacion = await getPrestacionSips(pool, fechaPrestacion, afiliadoSumar.id_smiafiliados, idNomenclador);
            if (!idPrestacion) {
                let precioPrestacion: any = (await getNomencladorSumar(request, idNomenclador)).precio;
                idPrestacion = await savePrestacionSumar(request, data.paciente, diagnostico, idComprobante, idNomenclador, precioPrestacion, fechaPrestacion, objectId);

                await saveDatosReportables(request, configuracionSumar, prestacion, idPrestacion);
                estado = 'Comprobante con prestacion';
            }
        }

        await transaction.commit();
        await updateEstadoFacturacion(objectId, data.idPrestacion, idComprobante, estado);

    } catch (e) {
        transaction.rollback(error => {
            log.error('facturaSumar:rollback crear comprobante sumar', { data }, error, userScheduler);
        });
    }
}

async function updateEstadoFacturacion(objectId, idPrestacion, idComprobante, estado) {
    let turno: any;
    if (objectId) {
        turno = await getDatosTurno(objectId);
    }

    const estadoFacturacion = {
        tipo: 'sumar',
        numeroComprobante: idComprobante,
        estado
    };
    
    if (!turno) {
        updateEstadoFacturacionSinTurno(idPrestacion, estadoFacturacion);
    } else {
        updateEstadoFacturacionConTurno(turno.idAgenda, turno.idBloque, turno.id, estadoFacturacion);
    }
}

async function saveDatosReportables(request, configuracionSumar, prestacion, idPrestacion) {
    let { datosReportables } = configuracionSumar;
    datosReportables = validar(datosReportables, prestacion.ejecucion.registros)
    for (const dato of datosReportables) {
        let reportable;
        if (dato.fx && dato.fx.type === 'reduce') {
            reportable = dato.fx.concepts.reduce((acc,e,i) => {
                let reg = prestacion.ejecucion.registros.find(r => r.concepto.conceptId === Object.keys(e)[0]);
                return `${acc}${Object.values(e)[0]}${dato.fx.values[reg.valor.id]}${dato.fx.concepts[i+1]?dato.fx.separator:''}`;                
            }, '')
        } else {
            reportable = searchRegister(prestacion.ejecucion.registros, dato.conceptId)?.valor;
        }
        await saveDatosReportablesSumar(request, idPrestacion, dato.idDatoReportable, reportable);
    }
}

function validar(datosReportables, registros) {
    let datosValidados = [...datosReportables];

    for (const dato of datosReportables) {
        if (dato.validations) {
            let valid = true;
            const reg = searchRegister(registros, dato.conceptId);
            for (const key of Object.keys(dato.validations)) {
                const validationValue = dato.validations[key];
                switch (key) {
                    case 'concepts':
                        valid = validationValue.includes(reg.valor.concept.conceptId);
                        break;
                    case 'lte':
                        valid = reg.valor !== null && reg.valor !== undefined && reg.valor <= validationValue;
                        break;
                    case 'gte':
                        valid = reg.valor !== null && reg.valor !== undefined && reg.valor >= validationValue;
                        break;
                }

                if (!valid) {
                    datosValidados.slice(datosValidados.indexOf(dato), 1);
                }
            }
        }
    }
    return datosValidados;
}

function searchRegister(regs, conceptId) {
    let found = null;
    let i = 0;
    
    while (!found && i < regs.length) {
        let reg = regs[i];
        if (reg.concepto.conceptId === conceptId) {
            found = reg;
        } else if (reg.registros.length) {
            found = searchRegister(reg.registros, conceptId);
        }
        i++;
    }

    return found;
};
