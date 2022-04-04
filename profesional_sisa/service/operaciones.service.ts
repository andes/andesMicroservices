import { ANDES_HOST, ANDES_KEY, SISA, userScheduler } from '../config.private';
import moment = require('moment');
import { msProfesionalSISA } from '../logger/msProfesionalSISA';
const log = msProfesionalSISA.startTrace();
const got = require('got');

export async function postProfesionalSISA(profesional: any) {
    const url = SISA.host;
    const data = {
        usuario: SISA.username,
        clave: SISA.password,
        profesional
    }

    const options = {
        json: data,
        responseType: 'json'
    }

    try {
        const { statusCode, body } = await got.post(url, options);
        if (statusCode >= 200 && statusCode < 300 && body?.resultado != 'ERROR_DATOS') {
            return body;
        } else {
            return log.error('profesional_sisa:postProfesionalSISA', { options: data, statusCode: statusCode }, 'unkown error', userScheduler);
        } 
    } catch (error) {
        log.error('profesional_sisa:postProfesionalSISA', { error, options: data }, error.message, userScheduler);
    }
}

export async function getProfesional(idProfesional) {
    const url = `${ANDES_HOST}/core/tm/profesionales/${idProfesional}`;
    const options = {
        headers: {
            Authorization: `JWT ${ANDES_KEY}`
        },
        responseType: 'json'
    };
        
    try {
        const { statusCode, body } = await got(url, options);
        if (statusCode >= 200 && statusCode < 300 && body._id) {
            return body;
        } else {
            log.error('profesional_sisa:getProfesional', { url, statusCode }, 'unkown error', userScheduler);
            return null;
        }
    } catch (error) {
        log.error('profesional_sisa:getProfesional', { error, url }, error.message, userScheduler);
    }
}

export async function getProfesion(codigo) {
    const url = `${ANDES_HOST}/core/tm/profesiones?codigo=${codigo}`;
    const options = {
        headers: {
            Authorization: `JWT ${ANDES_KEY}`
        },
        responseType: 'json'
    };

    try {
        let { statusCode, body } = await got(url, options);
        if (statusCode >= 200 && statusCode < 300 && body.length) {
            return body[0];
        } else {
            log.error('profesional_sisa:getProfesional', { url, statusCode }, 'unkown error', userScheduler);
            return null;
        }
    } catch (error) {
        log.error('profesional_sisa:getProfesion', { error, url }, error.message, userScheduler);
    }
}

export async function crearProfesionalSISA(profesional, formacionGrado) {
    // Datos del profesional
    let profesionalSisa = {};
    profesionalSisa['APELLIDO'] = profesional.apellido;
    profesionalSisa['NOMBRE'] = profesional.nombre;
    profesionalSisa['ID_TIPODOC'] = 1;
    profesionalSisa['NRODOC'] = parseInt(profesional.documento);
    profesionalSisa['SEXO'] = (profesional.sexo === 'femenino' || profesional.sexo === 'Femenino') ? 'F' : 'M';
    profesionalSisa['FECHA_NACIMIENTO'] = moment(profesional.fechaNacimiento).format('DD-MM-YYYY');
    const email = profesional.contactos.find(x => x.tipo === 'email' && x.valor);
    profesionalSisa['EMAIL'] = email ? email.valor : '';
    profesionalSisa['HABILITADO'] = profesional.habilitado ? 'SI' : 'NO';

    // Datos de la profesión
    profesionalSisa['TITULO'] = formacionGrado ? formacionGrado.titulo : '';
    
    if (formacionGrado.entidadFormadora.codigo) {
        profesionalSisa['ID_INSTITUCION_FORMADORA'] = parseInt(formacionGrado.entidadFormadora.codigo);
    }
    profesionalSisa['FECHA_TITULO'] = moment(formacionGrado.fechaEgreso).format('DD-MM-YYYY');
    let profesionDeReferencia: any = await getProfesion(formacionGrado.profesion.codigo);
    if (profesionDeReferencia?.profesionCodigoRef) {
        profesionalSisa['ID_PROFESION_REFERENCIA'] = parseInt(profesionDeReferencia.profesionCodigoRef);
    }

    // Datos de la matrícula
    if (formacionGrado?.profesion?.codigo){
        profesionalSisa['ID_PROFESION'] = parseInt(formacionGrado.profesion.codigo);
    }
    profesionalSisa['ID_PROVINCIA_MATRICULA'] = 15;
    if (formacionGrado?.matriculacion?.length && formacionGrado.matriculacion[formacionGrado.matriculacion.length - 1]?.matriculaNumero) {
        let matricula = formacionGrado.matriculacion[formacionGrado.matriculacion.length - 1].matriculaNumero;
        profesionalSisa['MATRICULA'] = parseInt(matricula);
    }
    profesionalSisa['FECHA_MATRICULA'] = moment(formacionGrado.fechaDeInscripcion).format('DD-MM-YYYY');
    profesionalSisa['ID_SITUACION_MATRICULA'] = 1;
    profesionalSisa['REMATRICULACION'] = 'NO';
    const domicilio = profesional.domicilios.find(x => x.tipo === 'real');
    profesionalSisa['CALLE'] = domicilio ? domicilio.valor : '';
    profesionalSisa['CALLE_NRO'] = '-';
    profesionalSisa['CALLE_PISO'] = '-';
    profesionalSisa['CALLE_DPTO'] = '-';
    profesionalSisa['ID_PROVINCIA_DOMICILIO'] = 15;
    profesionalSisa['ID_PAIS_DOMICILIO'] = 200;
    const tel_celular = profesional.contactos.find(x => x.tipo === 'celular' && x.valor);
    const tel_fijo = profesional.contactos.find(x => x.tipo === 'fijo' && x.valor);
    profesionalSisa['TIENE_TELEFONO'] = (tel_celular || tel_fijo || email) ? 'SI' : 'NO';
    if (tel_fijo) {
        profesionalSisa['ID_TIPO_TE1'] =  1;
        profesionalSisa['TE1'] = tel_fijo.valor;
    }

    if (tel_celular) {
        profesionalSisa['ID_TIPO_TE2'] =  2;
        profesionalSisa['TE2'] = tel_celular.valor;
    }

    return profesionalSisa;
}