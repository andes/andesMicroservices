import { SIP_PLUS, fakeRequestSipPlus } from '../config.private';
const fetch = require('node-fetch');
import { log } from '@andes/log';
import { getMatching } from './../services/matchPerinatal';
import moment = require('moment');

const url = `${SIP_PLUS.host}/record/AR/DNI/`;


export async function getPacienteSP(dniPaciente: any) {
    const documento = dniPaciente || '';
    let options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + Buffer.from(`${SIP_PLUS.username}:${SIP_PLUS.password}`, 'binary').toString('base64')
        }
    }
    if (documento) {
        try {
            let response = await fetch(`${url}${documento}`, options);
            if (response.status >= 200 && response.status < 300) {

                let responseJson = await response.json();
                const keyResponse = Object.keys(responseJson).length || null;
                if (keyResponse) {
                    const paciente = await formatPaciente(responseJson);
                    return { paciente: Object.keys(responseJson).length ? paciente : null };
                }
                else {
                    return { paciente: null };

                }
            }
            if (response.status === 404) {
                // paciente no encontrado
                return { paciente: null };
            }

        } catch (error) {
            log(fakeRequestSipPlus, 'microservices:integration:facturacion', null, 'getPacienteSP:error', error);
        }
    }
    return null;
}


const asignaKeys = async (datosMatch: any[], datoSP, datosInit = {}) => {
    const keys = Object.keys(datoSP);
    datosMatch.forEach(async d => {
        if (keys.includes(d.sipPlus.code)) {
            datosInit[d.key] = await castType(datoSP[d.sipPlus.code], d.sipPlus.code);

        }
    });
    return datosInit;
}

// se castea el dato respecto al tipo definido por sip-plus
const castType = (valor, type) => {
    type = type.toUpperCase();
    let valorCast: any = '';
    if (valor) {
        valorCast = (type === 'TEXT') ? valor.toString() :
            (type === 'NUMERIC') ? parseInt(valor, 10) :
                (type === 'DATE') ? moment(valor).format('DD/MM/YY') : valor;
    }
    return valorCast;
}

const generaArray = async (datoSP) => {
    let result = [];
    const keys = Object.keys(datoSP);
    result = keys.map(key => {
        const num = parseInt(key, 10) || null;
        if (num) {
            return {
                num: key,
                dato: datoSP[key]
            }
        }
        return null;
    });
    return result;
}


async function formatPaciente(pacienteSP: any) {
    let paciente = {};
    try {
        let datosfacturacion = await getMatching('facturacion-prenatal');
        let matchPersona = await getMatching('paciente');
        let datosMatching = datosfacturacion.concat(matchPersona);

        paciente = await asignaKeys(datosMatching, pacienteSP);

        if (pacienteSP['pregnancies']) {

            paciente['pregnancies'] = await generaArray(pacienteSP['pregnancies']);

            // se recorre cada embarazo y se obtiene los codigos que interesen obtener en cada uno
            const pregnancies = paciente['pregnancies'].map(async (emb: any, index: any) => {

                let childs = emb['dato']['children'] || null;
                let controlEmb = emb['dato']['prenatal'] || null;

                emb['dato'] = await asignaKeys(datosMatching, emb.dato);

                if (childs) {
                    childs = await generaArray(childs);
                    childs = childs.map(async child => {
                        child.dato = await asignaKeys(datosMatching, child.dato)
                        return child
                    });
                    emb['dato']['children'] = await Promise.all(childs);
                }
                if (controlEmb) {
                    controlEmb = await generaArray(controlEmb);
                    controlEmb = controlEmb.map(async ctrl => {
                        ctrl.dato = await asignaKeys(datosMatching, ctrl.dato);
                        return ctrl;
                    });

                    emb['dato']['prenatal'] = await Promise.all(controlEmb);
                }

                return await emb;
            });
            paciente['pregnancies'] = await Promise.all(pregnancies);


        }
    } catch (error) {
        return null;
    }
    return paciente
}

