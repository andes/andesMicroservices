import { ANDES_HOST, ANDES_KEY, SISA, userScheduler } from '../config.private';
import moment = require('moment');
import { msProfesionalSISA } from '../logger/msProfesionalSISA';
import { handleHttpRequest } from './requestHandler';
const log = msProfesionalSISA.startTrace();

export async function postProfesionalSISA(profesional: any) {
    const url = SISA.host;
    try {
        const options = {
            uri: url,
            method: 'POST',
            body: profesional,
            headers: { APP_ID: SISA.API_ID, APP_KEY: SISA.API_KEY, 'Content-Type': 'application/json' },
            json: true,
        };
        const resJson = await handleHttpRequest(options);

        if (resJson && resJson.length > 0) {
            const statusCode = resJson[0];
            const body = resJson[1];
            if (statusCode >= 200 && statusCode < 300 && body?.resultado != 'ERROR_DATOS') {
                log.info('profesional_sisa:postProfesionalSISA', { options: options, data: body }, userScheduler);
                return body;
            } else {
                return log.error('profesional_sisa:postProfesionalSISA', { options: options, error: body }, body.description, userScheduler);
            }
        }
    } catch (error) {
        log.error('profesional_sisa:postProfesionalSISA', { error, options: profesional }, error, userScheduler);
    }
}

export async function getProfesional(idProfesional) {
    const url = `${ANDES_HOST}/core/tm/profesionales/${idProfesional}`;
    //${ANDES_KEY}
    const options = {
        uri: url,
        method: 'GET',
        headers: { Authorization: `JWT ${ANDES_KEY}`, 'Content-Type': 'application/json' },
        json: true,
    };
    try {
        const resJson = await handleHttpRequest(options);
        if (resJson && resJson.length > 0) {
            const statusCode = resJson[0];
            const body = resJson[1];
            if (statusCode >= 200 && statusCode < 300 && body?.resultado != 'ERROR_DATOS') {
                return body;
            } else {
                log.error('profesional_sisa:getProfesional', { options, body }, 'unkown error', userScheduler);
                return null;
            }
        } else {
            log.error('profesional_sisa:getProfesional', { options }, 'unkown error', userScheduler);
            return null;
        }
    } catch (error) {
        log.error('profesional_sisa:getProfesional', { error, url }, error.message, userScheduler);
    }
}

export async function getProfesion(codigo) {
    const url = `${ANDES_HOST}/core/tm/profesiones?codigo=${codigo}`;
    const options = {
        uri: url,
        method: 'GET',
        headers: { Authorization: `JWT `, 'Content-Type': 'application/json' },
        json: true,
    };
    try {
        const resJson = await handleHttpRequest(options);

        if (resJson && resJson.length > 0) {
            const statusCode = resJson[0];
            const body = resJson[1];
            if (statusCode >= 200 && statusCode < 300 && body?.resultado != 'ERROR_DATOS') {
                return body;
            } else {
                log.error('profesional_sisa:getProfesion', { options, body }, 'unkown error', userScheduler);
                return null;
            }
        } else {
            log.error('profesional_sisa:getProfesion', { options }, 'unkown error', userScheduler);
            return null;
        }
    } catch (error) {
        log.error('profesional_sisa:getProfesion', { error, url }, error.message, userScheduler);
    }
}

export async function crearProfesionalSISA(profesional, formacionGrado) {
    // Datos del profesional
    let profesionalSisa = {
        profesional: {},
        profesion: {},
        matricula: {
            emisor: {
                domicilio: {}
            }
        }

    };
    profesionalSisa['profesional']['apellido'] = profesional.apellido;
    profesionalSisa['profesional']['nombre'] = profesional.nombre;
    profesionalSisa['profesional']['tipoDocumento'] = 1;
    profesionalSisa['profesional']['numeroDocumento'] = parseInt(profesional.documento);
    profesionalSisa['profesional']['sexo'] = (profesional.sexo === 'femenino' || profesional.sexo === 'Femenino') ? 'F' : (profesional.sexo === 'masculino' || profesional.sexo === 'Masculino') ? 'M' : 'X';
    profesionalSisa['profesional']['fechaNacimiento'] = moment(profesional.fechaNacimiento).format('DD-MM-YYYY');
    const email = profesional.contactos.find(x => x.tipo === 'email' && x.valor);
    profesionalSisa['profesional']['email'] = email ? email.valor : '';
    profesionalSisa['profesional']['idPaisNacimiento'] = 200;
    profesionalSisa['profesional']['idPais'] = 200;
    profesionalSisa['profesional']['habilitado'] = 'SI';
    // Datos de la profesión
    profesionalSisa['profesion']['titulo'] = formacionGrado ? formacionGrado.titulo : '';
    if (formacionGrado.entidadFormadora.codigo) {
        profesionalSisa['profesion']['idInstitucionFormadora'] = parseInt(formacionGrado.entidadFormadora.codigo);
    }
    profesionalSisa['profesion']['fechaTitulo'] = moment(formacionGrado.fechaEgreso).format('DD-MM-YYYY');
    profesionalSisa['profesion']['idProfesionReferencia'] = parseInt(formacionGrado.profesion.profesionCodigoRef);
    /*let profesionDeReferencia: any = await getProfesion(formacionGrado.profesion.codigo);
    if (profesionDeReferencia?.profesionCodigoRef) {
        profesionalSisa['idProfesionReferencia'] = parseInt(formacionGrado.profesion.profesionCodigoRef);
    }*/
    profesionalSisa['profesion']['revalida'] = 'NO';
    // Datos de la matrícula

    profesionalSisa['matricula']['fecha'] = moment(formacionGrado.fechaDeInscripcion).format('DD-MM-YYYY');
    if (formacionGrado?.matriculacion?.length && formacionGrado.matriculacion[formacionGrado.matriculacion.length - 1]?.matriculaNumero) {
        let matricula = formacionGrado.matriculacion[formacionGrado.matriculacion.length - 1];
        profesionalSisa['matricula']['fechaFin'] = moment(matricula.fin).format('DD-MM-YYYY');
        profesionalSisa['matricula']['codigo'] = parseInt(matricula.matriculaNumero);
    }
    profesionalSisa['matricula']['rematriculacion'] = 'NO';
    profesionalSisa['matricula']['idProvincia'] = 15;
    if (formacionGrado?.profesion?.codigo) {
        profesionalSisa['matricula']['idProfesion'] = parseInt(formacionGrado.profesion.codigo);
    }
    const domicilio = profesional.domicilios.find(x => x.tipo === 'real');
    profesionalSisa['matricula']['emisor']['domicilio']['calle'] = domicilio ? domicilio.valor : '';
    profesionalSisa['matricula']['emisor']['domicilio']['idProvincia'] = 15;
    profesionalSisa['matricula']['emisor']['domicilio']['idPais'] = 200;
    const tel_celular = profesional.contactos.find(x => x.tipo === 'celular' && x.valor);
    const tel_fijo = profesional.contactos.find(x => x.tipo === 'fijo' && x.valor);
    profesionalSisa['matricula']['emisor']['tieneTelefono'] = (tel_celular || tel_fijo) ? 'SI' : 'NO';
    let j = 1;
    profesional.contactos.forEach((cp, i) => {
        if (cp.tipo === 'celular' || cp.tipo === 'fijo') {
            let idTel = 'idTipoTelefono' + j;
            let tel = 'telefono' + j;
            j++;
            profesionalSisa['matricula']['emisor'][idTel] = cp.tipo === 'fijo' ? 1 : 2;
            profesionalSisa['matricula']['emisor'][tel] = cp.valor;
        }

    });

    return profesionalSisa;
}