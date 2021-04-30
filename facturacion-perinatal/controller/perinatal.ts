import { connectionString, fakeRequest } from '../config.private';
import { log } from '@andes/log';
import * as sql from 'mssql';

import {
    getOrganizacionSIPS, getPacienteSIPS,
    insertConsultaSIPS, insertHCPerinatalSIPS,
    insertHCPDetalleSIPS,
    getHCPerinatal as getHCPerinatalSIPS,
    getHCPerinatalDetalle as getHCPerinatalDetalleSIPS,
    updateHCPerinatal as updateHCPerinatalSIPS,
    updateHCPDetalle as updateHCPDetalleSIPS,
    updateConsulta as updateConsultaSIPS

} from './../service/queriesSql';

import moment = require('moment');
import { getOrganizacionAndes } from './../service/organizacion';
import { getPacienteAndes } from './../service/paciente';



export interface IPaciente {
    idSips: number;
    documento: string;
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    domicilio: string;
    localidad: string;
    telefono: string;
    edad: number
}


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


export async function createFacturarPerinatal(prestacion: any) {

    let conexion = await new sql.ConnectionPool(connectionString).connect();
    const transaction = await new sql.Transaction(conexion);

    const pacientePrest = prestacion.paciente;

    if (pacientePrest && pacientePrest.documento) {
        try {
            await transaction.begin();

            const fechaTurno = prestacion.ejecucion.fecha;
            const idPrestacion = prestacion.id;

            const registros = await obtenerRegistros(prestacion.ejecucion.registros);

            const paciente = await getPaciente(pacientePrest, conexion);

            const efector = prestacion.ejecucion.organizacion;
            let organizacionAndes = await getOrganizacionAndes(efector.id);

            let efectorSips = await getOrganizacionSIPS(organizacionAndes.codigo.sisa, conexion);

            const idEfectorSips = efectorSips.idEfector;

            if (paciente && paciente.idSips && registros.numGesta) {


                let hcp = await getHCPerinatalSIPS(paciente.idSips, registros.numGesta, conexion);

                if (!hcp || !hcp.idHistoriaClinicaPerinatal) {
                    // guardamos en la tabla HCP
                    hcp = await saveHCPerinatal(paciente, idEfectorSips, registros, conexion);
                }
                else {
                    // actualizamos en la tabla HCP
                    await updateHCPerinatal(hcp, paciente, registros, conexion);
                }

                // guardamos los datos de la consulta
                let consulta = await saveConsulta(paciente, idEfectorSips, registros, fechaTurno, conexion);

                const idConsulta = consulta.id || null;
                if (idConsulta) {
                    if (hcp.idHistoriaClinicaPerinatal) {
                        // guardamos los datos de la tabla HCPDetalle
                        await saveHCPerinatalDetalle(idEfectorSips, registros, fechaTurno, idConsulta, hcp.idHistoriaClinicaPerinatal, idPrestacion, conexion);
                        await transaction.commit();
                    }
                }
            }
        } catch (error) {
            log(fakeRequest, 'microservices:integration:facturacion-perinatal', prestacion.id, 'createFacturarPerinatal:error', error);
            await transaction.rollback();
        }
    }


}

export async function updateFacturarPerinatal(prestacion) {

    let conexion = await new sql.ConnectionPool(connectionString).connect();
    const transaction = await new sql.Transaction(conexion);

    const pacientePrest = prestacion.paciente;
    try {
        await transaction.begin();
        //actualizar hcpd
        let hcpd = await getHCPerinatalDetalleSIPS(prestacion.id, conexion);

        if (hcpd) {
            let idHistoriaClinicaPerinatal = hcpd.idHistoriaClinicaPerinatal;
            let idConsulta = hcpd.idConsulta;

            const registrosAndes = prestacion.ejecucion.registros;
            const registros = await obtenerRegistros(registrosAndes);

            hcpd.idHCPD = hcpd.idHistoriaClinicaPerinatalDetalle;
            hcpd = await loadHCPDetalle(hcpd, registros);

            await updateHCPDetalleSIPS(hcpd, conexion);

            //actualizar hcp
            let hcp = { idHistoriaClinicaPerinatal };
            const paciente = await getPaciente(pacientePrest, conexion);
            await updateHCPerinatal(hcp, paciente, registros, conexion);

            //actualizar consulta
            let consulta: any = { idConsulta }
            consulta = await loadConsulta(consulta, registros);

            await updateConsultaSIPS(consulta, conexion);
            await transaction.commit();
        }


    } catch (error) {
        log(fakeRequest, 'microservices:integration:facturacion-perinatal', prestacion.id, 'updateFacturarPerinatal:error', error);
        await transaction.rollback();
    }

}


async function obtenerRegistros(registrosPrestacion) {

    const registrosRUP = getRegistros(registrosPrestacion);

    return await filtrarRegistros(registrosRUP);

}

async function updateHCPerinatal(hcp, paciente, registros, conexion) {

    hcp = await loadDatosHCPerinatal(paciente, registros, hcp);

    await updateHCPerinatalSIPS(hcp, conexion);

}


async function loadDatosHCPerinatal(paciente, registros, hcp: any) {

    const edad = paciente.edad ? paciente.edad : moment(new Date()).diff(paciente.fechaNacimiento, 'years');

    hcp.nombre = paciente.nombre;
    hcp.apellido = paciente.apellido;
    hcp.domicilio = paciente.domicilio || hcp.domicilio || null;
    hcp.localidad = paciente.localidad || hcp.localidad || null;
    hcp.telefono = paciente.telefono || hcp.telefono || null;
    hcp.fechaNacimiento = paciente.fechaNacimiento;
    hcp.edad = edad;
    hcp.pesoAnterior = registros.pesoAnterior || hcp.pesoAnterior || null;
    hcp.talla = registros.talla || hcp.talla || null;
    hcp.fum = registros.fum || hcp.fum || null;
    hcp.fpp = registros.fpp || hcp.fpp || null;
    hcp.observaciones = registros.informe || '';
    hcp.numeroEmbarazo = registros.numGesta;
    return hcp;
}


async function saveConsulta(paciente, idEfector, registros, fecha, conexion) {

    const hora = moment(fecha).format('HH:mm');

    let consulta = {
        idPaciente: paciente.idSips,
        fecha,
        hora,
        activo: 1,
        idEfector,
        idEspecialidad: null,
        idProfesional: null,
        motivoConsulta: null,
        idDerivadoPor: null,
        idDerivadoHacia: null,
        idTipoPrestacion: null,
        idObraSocial: null,
        idUsuarioRegistro: null,
        fechaRegistro: null,
        idTurno: null,
        tAS: null,
        tAD: null,
        activa: 1,
        perimetroCefalico: null,
        riesgoCardiovascular: null,
        idProgramaOdontologia: null,
        primerConsultaOdontologia: null,
        idEquipo: null
    }
    consulta = await loadConsulta(consulta, registros);
    const newConsulta = await insertConsultaSIPS(consulta, conexion);

    return newConsulta;
}


async function loadConsulta(consulta, registros) {
    consulta.informeConsulta = registros.informe || '';
    consulta.peso = registros.peso || null;
    consulta.talla = registros.talla || null;
    consulta.imc = registros.imc || null;
    return consulta;
}


async function saveHCPerinatal(paciente, idEfectorSips, registros, conexion) {

    let hcp: any = {
        idHistoriaClinicaPerinatal: null,
        idEfector: idEfectorSips,
        idPaciente: paciente.idSips,
        dni: paciente.documento,
        activa: 1,
        anulada: 0,
        motivoAnulacion: ''
    }

    hcp = await loadDatosHCPerinatal(paciente, registros, hcp);
    const idHCP = await insertHCPerinatalSIPS(hcp, conexion);
    if (idHCP) {
        hcp.idHistoriaClinicaPerinatal = idHCP;
        return hcp;
    }
    return null;
}


async function saveHCPerinatalDetalle(idEfectorSips, registros, fecha, idConsulta, idHCP, idPrestacion, conexion) {

    let hcpd = {
        id: null,
        idEfector: idEfectorSips,
        idHistoriaClinicaPerinatal: idHCP,
        idConsulta: idConsulta,
        fecha,
        activa: 1,
        idPrestacionRUP: String(idPrestacion)
    }
    hcpd = await loadHCPDetalle(hcpd, registros);
    const idHCPD = await insertHCPDetalleSIPS(hcpd, conexion);
    if (idHCPD) {
        hcpd.id = idHCPD;
        return hcpd;
    }
    return null;
}


async function loadHCPDetalle(hcpd, registros) {

    const pa = (registros.paSistolica && registros.paDiastolica) ? registros.paSistolica + '/' + registros.paDiastolica : null;
    hcpd.edadGestacional = registros.edadGestacional || null;
    hcpd.peso = registros.peso || null;
    hcpd.imc = registros.imc || null;
    hcpd.pa = pa;
    hcpd.alturaUterina = registros.alturaUterina || null;
    hcpd.movimientosFetales = registros.movimientosFetales || null;
    hcpd.fcf = registros.fcf || null;
    hcpd.observaciones = registros.informe || '';
    hcpd.proximaCita = registros.proxTurno;
    return hcpd;
}


async function filtrarRegistros(registros) {
    let registrosCtrol: any = {};

    registros.forEach(reg => {

        const conceptId = reg.concepto.conceptId;
        const valor = reg.valor || null;

        if (conceptId === '371531000') { registrosCtrol.informe = valor; }

        else if (conceptId === '248351003') { registrosCtrol.pesoAnterior = Number(valor) || null; }

        else if (conceptId === '366321006') { registrosCtrol.numGesta = getNumGesta(valor) || null; }

        else if (conceptId === '14456009') { registrosCtrol.talla = Number(valor); }

        else if (conceptId === '21840007') { registrosCtrol.fum = valor; }

        else if (conceptId === '161714006') { registrosCtrol.fpp = valor; }

        else if (conceptId === '27113001') { registrosCtrol.peso = Number(valor); }

        else if (conceptId === '271649006') { registrosCtrol.paSistolica = valor; }

        else if (conceptId === '271650006') { registrosCtrol.paDiastolica = valor; }

        else if (conceptId === '390840006') { registrosCtrol.proxTurno = valor; }

        else if (conceptId === '57036006') { registrosCtrol.edadGestacional = valor; }

        else if (conceptId === '60621009') { registrosCtrol.imc = Number(valor); }

        else if (conceptId === '289434000') {
            registrosCtrol.movimientosFetales =
                (valor && valor.id === '10828004') ? '+' :
                    (valor && valor.id === '260385009') ? '-' : null;
        }
    });

    return registrosCtrol;
}


function getNumGesta(valor) {
    const conceptId = valor.conceptId;
    const conceptIdPrimerGesta = ['29399001', '199719009', '127364007', '53881005'];
    let numGesta = null;
    if (conceptIdPrimerGesta.includes(conceptId)) {
        numGesta = 1;
    }
    else {
        switch (conceptId) {
            case '127365008': numGesta = 2; break;

            case '127366009': numGesta = 3; break;

            case '127367000': numGesta = 4; break;

            case '127368005': numGesta = 5; break;

            case '127369002': numGesta = 6; break;

            case '127370001': numGesta = 7; break;

            case '127371002': numGesta = 8; break;

            case '127372009': numGesta = 9; break;

            case '127373004': numGesta = 10; break;
        }
    }
    return numGesta;
}


async function getPaciente(paciente: any, conexion: any) {

    let pacienteSIPS = await getPacienteSIPS(paciente, conexion);

    let dataPaciente: IPaciente = paciente;
    dataPaciente.idSips = (dataPaciente && pacienteSIPS.idPaciente) ? pacienteSIPS.idPaciente : null;

    let pacienteAndes = await getPacienteAndes(paciente.id);

    if (pacienteAndes) {
        if (pacienteAndes.direccion && pacienteAndes.direccion[0]) {
            dataPaciente.domicilio = (pacienteAndes.direccion[0].valor) ? pacienteAndes.direccion[0].valor : null;

            const ubicacion = pacienteAndes.direccion[0].ubicacion;
            dataPaciente.localidad = (ubicacion && ubicacion.localidad && ubicacion.localidad.nombre) ? pacienteAndes.direccion[0].ubicacion.localidad.nombre : null;
        }
        if (pacienteAndes.contacto) {
            const contacto = pacienteAndes.contacto.find(c => (c.valor && c.activo && ['fijo', 'celular'].includes(c.tipo)));
            if (contacto) {
                dataPaciente.telefono = contacto.valor;
            }
        }
        if (pacienteAndes.edadReal && pacienteAndes.edadReal.valor) {
            dataPaciente.edad = parseInt(pacienteAndes.edadReal.valor);
        }

    }
    paciente.fechaNacimiento = (!paciente.fechaNacimiento) ? (pacienteAndes.fechaNacimiento || pacienteSIPS.fechaNacimiento) : null;

    if (!dataPaciente.edad && paciente.fechaNacimiento) {
        dataPaciente.edad = moment(new Date()).diff(paciente.fechaNacimiento, 'years');
    }

    return dataPaciente;

}