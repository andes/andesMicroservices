import { ANDES_HOST, ANDES_KEY, SISA, userScheduler } from '../config.private';
import moment = require('moment');
import { msProfesionalSISA } from '../logger/msProfesionalSISA';
const log = msProfesionalSISA.startTrace();

const fetch = require('node-fetch');

export async function postProfesionalSISA(profesional: any) {
    const url = SISA.host;
    const data = {
        usuario: SISA.username,
        clave: SISA.password,
        profesional
    };
    const options = {
        method: 'POST',
        json: true,
        body: data
    };
        
    try {
        const { error, status, body } = await fetch(url, options);
        if (status >= 200 && status < 300) {
            return body;
        }
        return (error || body);
    } catch (error) {
        log.error('profesional_sisa:postProfesionalSISA', { error, options }, error.message, userScheduler);
    }
    
}

export async function getProfesional(idProfesional) {
    const url = `${ANDES_HOST}/core/tm/profesionales/${idProfesional}`;
    const options = {
        method: 'GET',
        headers: {
            Authorization: `JWT ${ANDES_KEY}`
        }
    };
        
    try {
        let response = await fetch(url, options);
        const responseJson = await response.json();
        if (responseJson._id) {
            return responseJson;
        } else {
            return null;
        }
    } catch (error) {
        log.error('profesional_sisa:getProfesional', { error, url, options }, error.message, userScheduler);
    }
}

export async function getProfesion(codigo) {
    const url = `${ANDES_HOST}/core/tm/profesiones?codigo=${codigo}`;
    const options = {
        method: 'GET',
        headers: {
            Authorization: `JWT ${ANDES_KEY}`
        }
    };
    try {
        let response = await fetch(url, options);
        const responseJson = await response.json();
        if (responseJson.length) {
            return responseJson[0];
        } else {
            return null;
        }
    } catch (error) {
        log.error('profesional_sisa:getProfesion', { error, url, options }, error.message, userScheduler);
    }
}

export async function crearProfesionalSISA(profesional, formacionGrado) {
    // Datos del profesional
    let profesionalSisa = {};
    profesionalSisa['APELLIDO'] = profesional.apellido;
    profesionalSisa['NOMBRE'] = profesional.nombre;
    profesionalSisa['ID_TIPODOC'] = 1;
    profesionalSisa['NRODOC'] = profesional.documento;
    profesionalSisa['SEXO'] = (profesional.sexo === 'femenino' || profesional.sexo === 'Femenino') ? 'F' : 'M';
    profesionalSisa['FECHA_NACIMIENTO'] = moment(profesional.fechaNacimiento).format('DD-MM-YYYY');
    profesionalSisa['ID_PAIS_NACIMIENTO'] = '0';
    profesionalSisa['ID_LOC_NACIMIENTO'] = '0';
    profesionalSisa['ID_PAIS'] = '0';
    const email = profesional.contactos.find(x => x.tipo === 'email' && x.valor);
    profesionalSisa['EMAIL'] = email ? email.valor : '';
    profesionalSisa['EMAIL2'] = '';
    profesionalSisa['HABILITADO'] = profesional.habilitado ? 'SI' : 'NO';

    // Datos de la profesión
    profesionalSisa['TITULO'] = formacionGrado ? formacionGrado.titulo : '';
    let codigoInstitucion = formacionGrado ? formacionGrado.entidadFormadora.codigo : '0';
    profesionalSisa['ID_INSTITUCION_FORMADORA'] = codigoInstitucion;
    profesionalSisa['FECHA_TITULO'] = moment(formacionGrado.fechaEgreso).format('DD-MM-YYYY');
    let profesionDeReferencia: any = await getProfesion(formacionGrado.profesion.codigo);
    profesionalSisa['ID_PROFESION_REFERENCIA'] = (profesionDeReferencia && profesionDeReferencia.profesionCodigoRef) ? profesionDeReferencia.profesionCodigoRef : '';
    profesionalSisa['ID_INSTITUCION_SEDE'] = '';
    profesionalSisa['REVALIDA'] = 'NO';
    profesionalSisa['ID_INSTITUCION_REVALIDA'] = '';
    profesionalSisa['FECHA_REVALIDA'] = '';

    // Datos de la matrícula
    profesionalSisa['ID_PROFESION'] = (formacionGrado && formacionGrado.profesion) ? formacionGrado.profesion.codigo : '';
    profesionalSisa['ID_PROVINCIA_MATRICULA'] = '15';
    profesionalSisa['MATRICULA'] = (formacionGrado && formacionGrado.matriculacion) ? formacionGrado.matriculacion[formacionGrado.matriculacion.length - 1].matriculaNumero : '';
    profesionalSisa['FECHA_MATRICULA'] = moment(formacionGrado.fechaDeInscripcion).format('DD-MM-YYYY');
    profesionalSisa['ID_SITUACION_MATRICULA'] = '1';
    profesionalSisa['LIBRO'] = '';
    profesionalSisa['FOLIO'] = '';
    profesionalSisa['ACTA'] = '';
    profesionalSisa['EXPEDIENTE'] = '';
    profesionalSisa['COMENTARIO'] = '';
    profesionalSisa['REMATRICULACION'] = 'NO';
    profesionalSisa['ID_ORIGEN_EMITE'] = '';
    const domicilio = profesional.domicilios.find(x => x.tipo === 'real');
    profesionalSisa['CALLE'] = domicilio ? domicilio.valor : '';
    profesionalSisa['CALLE_NRO'] = '-';
    profesionalSisa['CALLE_PISO'] = '-';
    profesionalSisa['CALLE_DPTO'] = '-';
    profesionalSisa['ID_LOCALIDAD_DOMICILIO'] = '0';
    profesionalSisa['ID_PROVINCIA_DOMICILIO'] = '15';
    profesionalSisa['ID_PAIS_DOMICILIO'] = '200';
    profesionalSisa['CP'] = '';
    const tel_celular = profesional.contactos.find(x => x.tipo === 'celular' && x.valor);
    const tel_fijo = profesional.contactos.find(x => x.tipo === 'fijo' && x.valor);
    profesionalSisa['TIENE_TELEFONO'] = (tel_celular || tel_fijo || email) ? 'SI' : 'NO';
    profesionalSisa['ID_TIPO_TE1'] = tel_fijo ? '1' : '';
    profesionalSisa['ID_TIPO_TE2'] = tel_celular ? '2' : '';
    profesionalSisa['ID_TIPO_TE3'] = '';
    profesionalSisa['ID_TIPO_TE4'] = '';
    profesionalSisa['TE1'] = tel_fijo ? tel_fijo.valor : '';
    profesionalSisa['TE2'] = tel_celular ? tel_celular.valor : '';
    profesionalSisa['TE3'] = '';
    profesionalSisa['TE4'] = '';

    return profesionalSisa;
}