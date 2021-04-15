import { getPacienteSP, postPacienteSP } from '../service/sip-plus';
import * as moment from 'moment';
import { IPaciente } from '../schemas/paciente';
import { getMatching } from '../service/matchPerinatal';


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
 * se crea al paciente/actualiza paciente
 * @param pacienteSP 
 * @param paciente 
 * @param registros obtenidos de la prestación que se inició en Andes
 */
export async function postPaciente(paciente: IPaciente, registros, pacienteSP: any = {}) {
    let newPaciente = await completePacienteSP(pacienteSP, paciente, registros);
    if (newPaciente && Object.keys(newPaciente).length) {
        await postPacienteSP(paciente.documento, newPaciente);
    }
}

/**
 * se crea al paciente/actualiza al paciente junto con su gesta obtenida de los registros
 * @param pacienteSP 
 * @param paciente 
 * @param registros 
 * @returns 
 */
export async function completePacienteSP(pacienteSP: IPaciente, paciente: IPaciente, registros) {
    let newPaciente;
    try {
        // obtenemos el número de embarazo por el que se generó la prestación
        let emb = registros.find(reg => reg.concepto.conceptId === '366321006');
        if (emb && emb.valor) {
            const numEmbarazo = emb.valor.toString();
            // cargamos datos actuales de la madre al embarazo
            newPaciente = await completePaciente(pacienteSP, paciente);
            let embActivo: any = await embarazoActual(pacienteSP, numEmbarazo);
            let embActual = embActivo ? embActivo.valor : {};

            // completamos el embarazo actual con datos del paciente
            let newDatosEmb = await datosEmbarazo(paciente, embActual);

            // completamos el embarazo actual con datos de las prestaciones
            newDatosEmb = await createMatchSnomedSP(registros, embActual, newDatosEmb);

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
 *  Obtenemos el embarazo de sipplus, de acuerdo a lo que se cargó en la prestación
 * @param paciente 
 * @param numEmbarazo número de embarazo obtenido desde la prestación
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
 *  completamos el último embarazo activo con datos del paciente
 * 
 * @param paciente 
 * @param embActual 
 * @param datosEmb 
 */
async function datosEmbarazo(paciente, embActual) {
    // obtengo los datos del paciente durante el embarazo a ser mapeados
    const datosEmb = await getMatching('gesta');

    // obtengo todas las key del datosEmb que no se encuetren en embActual
    const keysEmb = Object.keys(embActual);
    const newData = embActual ? datosEmb.filter(d => !keysEmb.includes(d.sipPlus.code)) : datosEmb;

    return await completeData(paciente, {}, newData);
}


/**
 * cargamos en el embarazo actual los codigos de sip+ que son mapeados a los conceptId recibidos
 * solo se concidenran los que aún no estén cargados en el embarazo
 * @param registros 
 * @param embActual 
 * @param newDatosEmb 
 */
async function createMatchSnomedSP(registros: any[], embActual, newDatosEmb) {
    if (registros) {
        const arrayId = registros.map(cId => cId.concepto.conceptId);
        const arrayCode = Object.keys(embActual);
        const matchEmbarazo = await getMatching('snomed');
        // obtengo todos los conceptos definidos por BD que matchean con los recibidos de la prestación
        // y que no se encuntren ya cargados en el embarazo
        const idsMatched = matchEmbarazo.filter(cId => (arrayId.includes(cId.concepto.conceptId) &&
            (!arrayCode.includes(cId.sipPlus.code))));

        idsMatched.forEach(async idMatch => {
            const reg = registros.find(reg => reg.concepto.conceptId === idMatch.concepto.conceptId);
            if (reg.valor) {
                const type = idMatch.sipPlus.type.toUpperCase();
                const valorSP = (type === 'DATE') ? moment(reg.valor.toString()).format('DD/MM/YY') :
                    (type === 'NUMERIC') ? parseInt(reg.valor, 10) : null;
                if (valorSP) {
                    newDatosEmb[idMatch.sipPlus.code] = valorSP;
                }
            }
        });
        return newDatosEmb;;
    }
}
