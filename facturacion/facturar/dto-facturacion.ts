import { getOrganizacion } from './../services/organizacion.service';
import { getProfesional } from './../services/profesional.service';
import { getConfigAutomatica } from '../../facturacion/services/prestaciones.service';

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