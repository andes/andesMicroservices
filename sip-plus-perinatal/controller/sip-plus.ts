import { getPacienteSP, postPacienteSP } from '../service/sip-plus';
import * as moment from 'moment';
import { IPaciente } from '../schemas/paciente';
import { getMatching } from '../service/matchPerinatal';
import { getOrganizacionAndes } from '../service/organizacion';
import { IPerinatal, ISnomedConcept } from 'sip-plus-perinatal/schemas/perinatal';


/**
 * Obtenemos todos los registros de la prestación
 * @param registros de la prestación
 */
export function getRegistros(registros: any[] = []) {
    let allRegistros = [];
    registros.forEach(reg => {
        allRegistros = [...allRegistros, reg];
        if (reg.registros && reg.registros.length) {
            const rs = getRegistros(reg.registros);
            allRegistros = [...allRegistros, ...rs];
        }
    });

    return allRegistros;
}

/**
 * Obtiene el paciente de Sip Plus
 *
 * @export getPaciente
 * @returns paciente
 */
export async function getPaciente(pacienteAndes: any) {

    if (pacienteAndes && pacienteAndes.documento) {

        const paciente: IPaciente = formatPacienteAndes(pacienteAndes)
        let result: any = await getPacienteSP(paciente);

        if (paciente.edad && result && result.paciente && Object.keys(result.paciente).length) {
            result.paciente = await formatPacienteSP(result.paciente);
            result.paciente.edad = paciente.edad;
        }
        return result;
    }
    return null;

}

function formatPacienteAndes(pacienteAndes: any) {
    let paciente = pacienteAndes;
    if (pacienteAndes.direccion && pacienteAndes.direccion[0]) {
        const ubicacion = pacienteAndes.direccion[0].ubicacion;
        if (pacienteAndes.direccion[0].valor) {
            paciente.domicilio = pacienteAndes.direccion[0].valor;
        }
        if (ubicacion && ubicacion.localidad && ubicacion.localidad.nombre) {
            paciente.localidad = pacienteAndes.direccion[0].ubicacion.localidad.nombre;
        }
    }
    if (pacienteAndes.contacto) {
        const contacto = pacienteAndes.contacto.find(c => (c.valor && c.activo && ['fijo', 'celular'].includes(c.tipo)));
        if (contacto) {
            paciente.telefono = contacto.valor;
        }
    }
    if (pacienteAndes.edadReal && pacienteAndes.edadReal.valor) {
        paciente.edad = parseInt(pacienteAndes.edad);
    }
    return paciente
}

async function formatPacienteSP(pacienteSP: any) {
    let paciente = {};
    const keysSP = Object.keys(pacienteSP);
    const datosPaciente = await getMatching('paciente');
    datosPaciente.forEach(p => {
        if (keysSP.includes(p.sipPlus.code)) {
            paciente[p.key] = pacienteSP[p.sipPlus.code];
        }
    });
    if (pacienteSP['pregnancies']) {
        paciente['gestas'] = pacienteSP['pregnancies'];
    }
    return paciente
}

/**
 * se crea/actualiza el paciente junto con su gesta actual
 * @param pacienteSP 
 * @param paciente 
 * @param registros obtenidos de la prestación que se inició en Andes
 */
export async function postPaciente(paciente: IPaciente, prestacion, pacienteSP: any = {}) {

    const registros = getRegistros(prestacion.ejecucion.registros);
    const organizacion = prestacion.ejecucion.organizacion;
    let newPaciente = await completePacienteSP(pacienteSP, paciente, registros, prestacion.ejecucion.fecha, organizacion);

    if (newPaciente && Object.keys(newPaciente).length) {
        await postPacienteSP(paciente.documento, newPaciente);
    }
}


/**
 * se crea al paciente/actualizan datos del paciente junto con su gesta obtenida de los registros
 * @param pacienteSP paciente actual en sip-plus
 * @param paciente 
 * @param registros 
 * @returns 
 */
export async function completePacienteSP(pacienteSP: IPaciente, paciente: IPaciente, registros, fecha, organizacion) {
    let newPaciente;
    try {
        // obtenemos el número de embarazo por el que se generó la prestación
        let emb = registros.find(reg => reg.concepto.conceptId === '366321006');

        if (emb && emb.valor) {
            const numEmbarazo = getNumGesta(emb.valor).toString();
            // cargamos datos actuales de la madre al embarazo
            newPaciente = await completePaciente(pacienteSP, paciente);
            let embActivo: any = await embarazoActual(pacienteSP, numEmbarazo);
            let embActual = embActivo ? embActivo.valor : {};

            // completamos la ficha (embarazo) con datos del paciente
            let newDatosEmb = await datosEmbarazo(paciente, embActual, organizacion);

            // completamos ficha con datos de la prestación
            newDatosEmb = await createMatchSnomed(registros, embActual, newDatosEmb);

            // completamos en la ficha los datos de un nuevo control
            newDatosEmb = await createMatchControl(registros, embActual, newDatosEmb, fecha, organizacion);

            if (Object.keys(newPaciente).length || Object.keys(newDatosEmb).length) {
                newPaciente["pregnancies"] = {};
                newPaciente["pregnancies"][numEmbarazo] = newDatosEmb;
            }
        }
    } catch (error) {

    }
    return newPaciente;

}


/**
 * obtenemos el número de embarazo
 * @param concepto concepto snomed con el numero de embarazo
 * @returns numero de embarazo
 */
function getNumGesta(concepto: ISnomedConcept) {
    const conceptId = concepto.conceptId;
    const conceptIdPrimerGesta = ['29399001', '199719009', '127364007', '53881005'];
    let numGesta = null;
    if (conceptIdPrimerGesta.includes(conceptId)) {
        numGesta = 1;
    }
    else {
        switch (conceptId) {
            case '127365008': numGesta = 2;
                break;
            case '127366009': numGesta = 3;
                break;
            case '127367000': numGesta = 4;
                break;
            case '127368005': numGesta = 5;
                break;
            case '127369002': numGesta = 6;
                break;
            case '127370001': numGesta = 7;
                break;
            case '127371002': numGesta = 8;
                break;
            case '127372009': numGesta = 9;
                break;
            case '127373004': numGesta = 10;
                break;
            default:
                break;
        }
    }
    return numGesta;
}


/**
 *  Obtenemos el embarazo que se cargó en la prestación
 * @param paciente 
 * @param numEmbarazo número de embarazo obtenido en la prestación
 */
async function embarazoActual(paciente: IPaciente, numEmb) {
    let embActual = null;
    try {
        if (paciente.gestas && paciente.gestas[numEmb]) {
            const arrayGestas = keyValor(paciente.gestas);
            embActual = arrayGestas.find(emb => emb.key === numEmb);
        }
    } catch (error) {
        return null;
    }

    return embActual;
}

const keyValor = (data: any) => {
    return Object.keys(data).map(key => (
        { key, valor: data[key] }));
};


async function completePaciente(pacienteSP: any, paciente: IPaciente) {

    let datosPaciente: any = (!pacienteSP) ?
        {
            "1018": "AR",
            "1019": "DNI"
        } : {};
    try {
        // obtengo los datos del paciente a ser mapeados
        const datos = await getMatching('paciente');

        // obtengo todas las key del pacienteSP que no se encuetren en paciente
        const keys = Object.keys(pacienteSP);
        const newData = pacienteSP ? datos.filter(d => (!keys.includes(d.key)) || (!pacienteSP[d.key] && keys.includes(d.key))) : datos;

        datosPaciente = await completeData(paciente, datosPaciente, newData);
    } catch (error) {

    }
    return datosPaciente;
}


/**
 * Completa los datos de un objeto 
 * @param allData objeto que contiene los datos
 * @param dataInit datos iniciales del objeto
 * @param newData nuevos datos de a completar segun matcheo
 */
async function completeData(allData, dataInit = {}, newData) {
    let datos = dataInit;
    try {
        newData.forEach(async data => {
            const key = data.key;
            let valor: any = null;
            if (allData[key]) {
                valor = allData[key];
            }
            if (valor) {
                const type = data.sipPlus.type.toUpperCase();
                datos[data.sipPlus.code] = (type === 'TEXT')
                    ? valor.toString() :
                    (type === 'NUMERIC') ? parseInt(valor, 10) :
                        (type === 'DATE') ? moment(valor).format('DD/MM/YY') : valor;
            }
        });
    } catch (error) {
    }

    return datos;
}

/**
 *  completamos la ficha del embarazo con datos del paciente
 * 
 * @param paciente 
 * @param embActual 
 * @param datosEmb 
 */
async function datosEmbarazo(paciente, embActual, organizacion) {
    const keysEmb = Object.keys(embActual);
    let newEmb = {};
    // cargamos datos de la organización al abrir la ficha en sipPlus
    if (!keysEmb.length) {
        const organizacionSP = await mapInstitucion(organizacion);
        if (organizacionSP) {
            newEmb['0017'] = organizacionSP;
        }

    }
    // obtengo los datos del paciente durante el embarazo a ser mapeados
    const datosEmb = await getMatching('gesta');

    // obtengo todas las key del datosEmb que no se encuetren en embActual
    const newData = embActual ? datosEmb.filter(d => !keysEmb.includes(d.sipPlus.code)) : datosEmb;

    return await completeData(paciente, newEmb, newData);
}

async function mapInstitucion(organizacion) {
    if (organizacion && organizacion.id) {
        const orgAndes = await getOrganizacionAndes(organizacion.id);
        const codigoSisa: string = orgAndes.codigo.sisa ? orgAndes.codigo.sisa.toString() : '';
        if (codigoSisa) {
            return {
                countryId: "AR",
                divisionId: "58",
                subdivisionId: codigoSisa.substring(4, 7),
                code: codigoSisa.substring(2, 4) + codigoSisa.substring(9)
            }
        }
    }
    return null;
}


/**
 * cargamos en el embarazo actual los codigos de sip+ que son mapeados a los conceptId recibidos
 * solo se considenran los que aún no estén cargados en la ficha (embarazo)
 * @param registros 
 * @param embActual 
 * @param newDatosEmb 
 */
async function createMatchSnomed(registros: any[], embActual, newDatosEmb) {
    if (registros) {
        const arrayId = registros.map(cId => cId.concepto.conceptId);
        const arrayCode = Object.keys(embActual);
        const matchEmbarazo = await getMatching('snomed');
        // obtengo todos los conceptos definidos por BD que coincidan con los recibidos de la prestación
        // y que no se encuentren ya cargados en el embarazo
        const idsMatched = matchEmbarazo.filter(cId => (arrayId.includes(cId.concepto.conceptId) &&
            (!arrayCode.includes(cId.sipPlus.code))));
        newDatosEmb = await mappingSnomed(idsMatched, registros, newDatosEmb);
    }
    return newDatosEmb;
}

/**
 * completamos en la ficha los datos de un nuevo control de embarazo
 * @param registros 
 * @param embActual 
 * @param newDatosEmb 
 * @param fecha 
 * @returns 
 */
async function createMatchControl(registros: any[], embActual, newDatosEmb, fecha, organizacion) {
    try {
        if (fecha) {
            const fechaControl = moment(fecha.toString()).format('DD/MM/YY');
            const arrayId = registros.map(cId => cId.concepto.conceptId);
            let existeCtrl = null;
            if (embActual['prenatal']) {
                // verificamos si ya existe el control de embarazo en sip-plus
                const controlesEmb = keyValor(embActual['prenatal']);
                existeCtrl = controlesEmb.find(ctrl => ctrl.valor['0116'] && ctrl.valor['0116'] === fechaControl);

            }
            // si el control de embarazo no existe
            if (!existeCtrl) {
                let arrayKeys = [];
                if (embActual['prenatal']) {
                    arrayKeys = Object.keys(embActual['prenatal']).map(key => { return parseInt(key, 10) });
                }

                const numCtrl = (arrayKeys.length) ? (Math.max.apply(null, arrayKeys) + 1).toString() : '1';
                // obtengo todos los conceptos definidos por BD que matchean con los recibidos de la prestación
                let matchPrenatal: IPerinatal[] = await getMatching('snomed-prenatal');
                // obtenemos el concepto asociado al día del próximo control
                const dia = matchPrenatal.find(elem => elem.key.includes('dia-proximo-turno'));
                const conceptIdProxCtrol = (dia && dia.concepto) ? dia.concepto.conceptId : null;
                const proxCtrl = conceptIdProxCtrol ? registros.find(reg => reg.concepto.conceptId === conceptIdProxCtrol) : null;
                let newCtrl = {
                    '0116': fechaControl
                };
                // completamos los datos del próximo control (día y mes)
                if (proxCtrl && proxCtrl.valor) {
                    const mes = matchPrenatal.find(elem => elem.key.includes('mes-proximo-turno'));
                    newCtrl[dia.sipPlus.code] = moment(proxCtrl.valor).date();
                    newCtrl[mes.sipPlus.code] = moment(proxCtrl.valor).month() + 1;
                    // eliminamos los registros ya mappeados
                    matchPrenatal = matchPrenatal.filter(elemMatch => elemMatch.concepto.conceptId !== conceptIdProxCtrol);
                }
                newCtrl = await mappingSnomed(matchPrenatal, registros, newCtrl);

                // mapeo de organizacion en el control
                const organizacionSP = await mapInstitucion(organizacion);
                if (organizacionSP) {
                    newCtrl['0686'] = organizacionSP;
                }
                newDatosEmb["prenatal"] = {};
                newDatosEmb["prenatal"][numCtrl] = newCtrl;
            }
        }
    } catch (error) {

    }
    return newDatosEmb;
}

async function mappingSnomed(matchPrenatal: IPerinatal[], registros: any[], newData) {
    matchPrenatal.forEach(idMatch => {
        const reg = registros.find(reg => reg.concepto.conceptId === idMatch.concepto.conceptId);
        if (reg && reg.valor) {
            const type = idMatch.sipPlus.type.toUpperCase();
            let valorSP = null;
            if (type === 'DATE') {
                valorSP = moment(reg.valor.toString()).format('DD/MM/YY');
            }
            if (type === 'NUMERIC') {
                valorSP = mappingNumeric(reg.valor, idMatch);
            }
            if (type === 'TEXT') {
                let arrayKeyValor = Object.keys(reg.valor);
                if ((typeof reg.valor !== 'string') && arrayKeyValor.length) {

                    const valor = idMatch.sipPlus.valor ? idMatch.sipPlus.valor.find(v => v.id === reg.valor.id) : null;
                    valorSP = valor ? valor.label.toString() : null;
                }
                else {
                    // eliminamos texto HTML si lo tiene
                    valorSP = reg.valor.replace(/(<([^>]+)>)/gi, '');
                    if (idMatch.sipPlus.extra) {
                        // verificamos si se restringe por longitud de caracteres
                        const length = idMatch.sipPlus.extra.length || valorSP.length;
                        valorSP = valorSP.substr(0, length);
                    }
                }
            }
            if (valorSP) {
                newData[idMatch.sipPlus.code] = valorSP;
            }
        }
    });
    return newData;
}

function mappingNumeric(valor: any, match: IPerinatal) {
    let valorSP = null;
    if (match.sipPlus.extra) {
        let valorCast = parseFloat(valor);
        // aplicamos operaciones en los datos numericos
        const operation = match.sipPlus.extra.operation;
        if (operation && operation.toString().toLowerCase() === 'cast-unidad') {
            // modificamos la unidad de medida del valor (ejemplo kg en gr)
            const potencia = match.sipPlus.extra.potency || 1;
            const base = match.sipPlus.extra.floor || 1;
            const unidad = match.sipPlus.extra.unidad || 1;
            valorCast = valorCast * parseFloat(unidad) * Math.pow(parseInt(base, 10), parseInt(potencia, 10));

        }
        //ver para que funcione con la talla de replicar esto para el otro mapping de NUMERIC asi todos usan esta función
        if (operation && operation.toString().toLowerCase() === 'resta') {
            const unidad = match.sipPlus.extra.unidad || 0;
            valorCast = valorCast - unidad;
        }
        valorSP = parseInt(valorCast.toString(), 10);
    }
    else {
        valorSP = parseInt(valor.toString(), 10);
    }
    return valorSP;
}
