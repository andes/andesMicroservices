import { Matching } from '@andes/match';
import * as config from '../config.private';
import * as sql from 'mssql';
import { InsertLABProtocoloQuery, InsertLABProtocoloDetalleQuery, InsertLABDerivacionQuery } from '../controller/consultas';

let moment = require('moment');


/**
 *
 *
 * @param {*} derivacion
 * @param {*} _idEfector
 * @returns
 */
async function getProtocoloData(derivacion, _idEfector, transaccion) {
    const idPacienteSips = await getIdPaciente(derivacion.paciente, transaccion);
    let data = {
        // idEfector: _idEfector,
        idEfector: _idEfector,
        numeroDiario: 0,
        numeroTipoServicio: 1,
        prefijoSector: 'D',
        numeroSector: 1,
        idSector: 46,
        sala: '',
        cama: '',
        idTipoServicio: 1,
        fecha: new Date(derivacion.fechaSolicitud),
        fechaOrden: new Date(derivacion.fechaSolicitud),
        fechaRetiro: new Date(derivacion.fechaSolicitud),
        idPaciente: idPacienteSips,
        idEfectorSolicitante: _idEfector,
        idEspecialistaSolicitante: 0,
        idObraSocial: 0,
        idOrigen: 4,
        idPrioridad: 1,
        observacion: '',
        observacionesResultados: '',
        alerta: 0,
        edad: 51,
        unidadEdad: 0,
        sexo: derivacion.paciente.sexo === 'masculino' ? 'M' : (derivacion.paciente.sexo === 'femenino' ? 'F' : 'I'),
        embarazada: 'N',
        semanaGestacion: 0,
        numeroOrigen: 300,
        estado: 1,
        impreso: 0,
        baja: 0,
        idUsuarioRegistro: 67,
        // fechaRegistro: new Date(derivacion.createdAt),
        fechaRegistro: new Date(),
        idMuestra: 0,
        fechaTomaMuestra: new Date('1900/01/01 00:00.000'),
        descripcionProducto: '',
        idConservacion: 0
    };

    // // if (idOrganizacionOrigen === AÑELO) {
    // data['idEfector'] = 6;
    data['idEfector'] = 205;
    data['idEfectorSolicitante'] = 205;
    // // }

    // if (idOrganizacionDerivacion._str === '57e9670e52df311059bc8964') {
    data['idEfectorDerivacion'] = 205;
    return data;
}

/**
 *
 *
 * @param {*} _idProtocolo
 * @param {*} codigoPractica
 * @returns
 */
async function getProtocoloDetalleData(_idEfector, _idProtocolo, codigoPractica, transaction) {
    let idAnalisis = await getIdAnalisis(codigoPractica, transaction);
    let data = {
        idProtocolo: _idProtocolo,
        idEfector: _idEfector,
        idItem: idAnalisis,
        idSubItem: idAnalisis,
        trajoMuestra: 'si',
        resultadoCar: 0,
        resultadoNum: 0,
        unidadMedida: 0,
        metodo: 0,
        valorReferencia: 0,
        observaciones: 0,
        codigoObservaciones: 0,
        conResultado: 0,
        idUsuarioResultado: 0,
        fechaResultado: new Date(),
        idUsuarioValida: 0,
        fechaValida: new Date(),
        idUsuarioControl: 0,
        fechaControl: new Date(),
        idUsuarioImpresion: 0,
        fechaImpresion: new Date(),
        enviado: 1,
        idUsuarioEnvio: 0,
        fechaEnvio: new Date(),
        idUsuarioObservacion: 0,
        fechaObservacion: new Date(),
        idUsuarioValidaObservacion: 0,
        fechaValidaObservacion: new Date(),
        formatoValida: 0
    };
    return data;
}

/**
 *
 *
 * @export
 * @param {*} transaction
 * @param {*} numero
 * @param {*} derivacion
 * @param {*} idEfector
 * @param {*} idEfectorDerivacion
 * @returns
 */
export async function insertProtocolo(transaction, numero, derivacion, idEfector, idEfectorDerivacion) {
    let data: any = await getProtocoloData(derivacion, idEfector, transaction);
    try {
        return await new sql.Request(transaction)
            .input('idEfector', sql.Int, idEfector)
            .input('numero', sql.Int, numero)
            .input('numeroDiario', sql.Int, data.numeroDiario)
            .input('numeroTipoServicio', sql.Int, data.numeroTipoServicio)
            .input('prefijoSector', sql.VarChar(2), data.prefijoSector)
            .input('numeroSector', sql.Int, data.numeroSector)
            .input('idSector', sql.Int, data.idSector)
            .input('sala', sql.VarChar(10), data.sala)
            .input('cama', sql.VarChar(10), data.cama)
            .input('idTipoServicio', sql.Int, data.idTipoServicio)
            .input('fecha', sql.DateTime, data.fecha)
            .input('fechaOrden', sql.DateTime, data.fechaOrden)
            .input('fechaRetiro', sql.DateTime, data.fechaRetiro)
            .input('idPaciente', sql.Int, data.idPaciente)
            .input('idEfectorSolicitante', sql.Int, idEfector)
            .input('idEspecialistaSolicitante', sql.Int, data.idEspecialistaSolicitante)
            .input('idObraSocial', sql.Int, data.idObraSocial)
            .input('idOrigen', sql.Int, data.idOrigen)
            .input('idPrioridad', sql.Int, data.idPrioridad)
            .input('observacion', sql.VarChar(50), data.observacion)
            .input('observacionesResultados', sql.VarChar(50), data.observacionesResultados)
            .input('alerta', sql.Int, data.alerta)
            .input('edad', sql.Int, data.edad)
            .input('unidadEdad', sql.Int, data.unidadEdad)
            .input('sexo', sql.VarChar(1), data.sexo)
            .input('embarazada', sql.VarChar(1), data.embarazada)
            // .input('horaNacimiento', sql.VarChar(10), data.horaNacimiento)
            // .input('pesoNacimiento', sql.Int, data.pesoNacimiento)
            .input('semanaGestacion', sql.Int, data.semanaGestacion)
            .input('numeroOrigen', sql.Int, data.numeroOrigen)
            .input('estado', sql.VarChar(10), data.estado)
            .input('impreso', sql.Int, data.impreso)
            .input('baja', sql.Int, data.baja)
            .input('idUsuarioRegistro', sql.Int, data.idUsuarioRegistro)
            .input('fechaRegistro', sql.DateTime, data.fechaRegistro)
            .input('idMuestra', sql.Int, data.idMuestra)
            .input('fechaTomaMuestra', sql.DateTime, data.fechaTomaMuestra)
            .input('descripcionProducto', sql.VarChar(50), data.descripcionProducto)
            .input('andesId', sql.VarChar(50), derivacion.idPrestacion)
            // .input('idConservacion', sql.Int, data.idConservacion)
            .query(InsertLABProtocoloQuery);
    } catch (e) {
        console.log(e);
        return null;
    }
}


/**
 *
 *
 * @export
 * @param {*} idProtocolo
 * @param {*} transaction
 * @returns
 */
export async function insertProtocoloDetalle(idEfector, idProtocolo, codigoPractica, transaction) {
    let data = await getProtocoloDetalleData(idEfector, idProtocolo, codigoPractica, transaction);
    return await new sql.Request(transaction)
        .input('idProtocolo', sql.Int, data.idProtocolo)
        .input('idEfector', sql.Int, data.idEfector)
        .input('idItem', sql.Int, data.idItem)
        .input('idSubItem', sql.Int, data.idSubItem)
        .input('trajoMuestra', sql.VarChar(2), data.trajoMuestra)
        .input('resultadoCar', sql.VarChar(500), data.resultadoCar)
        .input('resultadoNum', sql.Decimal, data.resultadoNum)
        .input('unidadMedida', sql.VarChar(100), data.unidadMedida)
        .input('metodo', sql.VarChar(100), data.metodo)
        .input('valorReferencia', sql.VarChar(500), data.valorReferencia)
        .input('observaciones', sql.VarChar(500), data.observaciones)
        .input('codigoObservaciones', sql.VarChar(500), data.codigoObservaciones)
        .input('conResultado', sql.Int, data.conResultado)
        .input('idUsuarioResultado', sql.Int, data.idUsuarioResultado)
        .input('fechaResultado', sql.DateTime, data.fechaResultado)
        .input('idUsuarioValida', sql.Int, data.idUsuarioValida)
        .input('fechaValida', sql.DateTime, data.fechaValida)
        .input('idUsuarioControl', sql.Int, data.idUsuarioControl)
        .input('fechaControl', sql.DateTime, data.fechaControl)
        .input('idUsuarioImpresion', sql.Int, data.idUsuarioImpresion)
        .input('fechaImpresion', sql.DateTime, data.fechaImpresion)
        .input('enviado', sql.Int, data.enviado)
        .input('idUsuarioEnvio', sql.Int, data.idUsuarioEnvio)
        .input('fechaEnvio', sql.DateTime, data.fechaEnvio)
        .input('idUsuarioObservacion', sql.Int, data.idUsuarioObservacion)
        .input('fechaObservacion', sql.DateTime, data.fechaObservacion)
        .input('idUsuarioValidaObservacion', sql.Int, data.idUsuarioValidaObservacion)
        .input('fechaValidaObservacion', sql.DateTime, data.fechaValidaObservacion)
        .input('formatoValida', sql.Int, data.formatoValida)
        .query(InsertLABProtocoloDetalleQuery);
}

/**
 *
 *
 * @export
 * @param {*} idDetalleProtocolo
 * @param {*} transaction
 * @returns
 */
export function insertDerivacion(idDetalleProtocolo, transaction) {
    let data = getDerivacionData();
    return new sql.Request(transaction)
        .input('idDetalleProtocolo', sql.Int, idDetalleProtocolo)
        .input('fechaRegistro', sql.DateTime, data.fechaRegistro)
        .input('idUsuarioRegistro', sql.Int, data.idUsuarioRegistro)
        .input('estado', sql.Int, data.estado)
        .input('observacion', sql.VarChar(500), data.observacion)
        .input('resultado', sql.VarChar(500), data.resultado)
        .input('idUsuarioResultado', sql.Int, data.idUsuarioResultado)
        .input('fechaResultado', sql.DateTime, data.fechaResultado)
        .query(InsertLABDerivacionQuery);
}

/**
 *
 *
 * @returns
 */
function getDerivacionData() {
    return {
        fechaRegistro: new Date(),
        idUsuarioRegistro: 0,
        estado: 0,
        observacion: '',
        resultado: '',
        idUsuarioResultado: 0,
        fechaResultado: new Date()
    };
}

/**
 *
 *
 * @export
 * @param {*} idOrganizacionOrigen
 * @param {*} [idOrganizacionDerivacion]
 * @returns
 */
export function getData(idOrganizacionOrigen, idOrganizacionDerivacion?) {
    let data = {
        //     fecha:  sql.DateTime, new Date(dtoPrestacion.fechaNacimiento)
    };

    // if (idOrganizacionOrigen === AÑELO) {
    data['connectionString'] = config.conSql.authAnelo;
    data['idEfector'] = 205;
    // }

    // if (idOrganizacionDerivacion._str === '57e9670e52df311059bc8964') {
    data['idEfectorDerivacion'] = 205;
    // }

    return data;
}

/**
 *
 *
 * @export
 * @param {*} transaction
 * @returns
 */
export async function getNumeroProtocolo(transaction) {
    let res = await new sql.Request(transaction).query('SELECT MAX (numero) From LAB_Protocolo as value');
    return res.recordsets[0][0][''];
}

/**
 *
 *
 * @param {*} codigoPractica
 */
async function getIdAnalisis(codigo, transaction) {
    let res = await new sql.Request(transaction)
        .input('codigo', sql.VarChar(5), codigo)
        .query('SELECT TOP 1 idItem From LAB_Item WHERE codigo = @codigo');

    return res.recordsets[0][0].idItem;
}

/**
 *
 *
 * @param {*} registro
 * @param {*} pacienteAndes
 * @returns
 */
function verificarPaciente(registro, pacienteAndes) {
    const cota = 0.95;
    let matchPaciente = (pacMpi, pac) => {
        const weights = {
            identity: 0.55,
            name: 0.10,
            gender: 0.3,
            birthDate: 0.05
        };

        const pacDto = {
            documento: pacMpi.documento ? pacMpi.documento.toString() : '',
            nombre: pacMpi.nombre ? pacMpi.nombre : '',
            apellido: pacMpi.apellido ? pacMpi.apellido : '',
            fechaNacimiento: pacMpi.fechaNacimiento ? moment(pacMpi.fechaNacimiento, 'DD/MM/YYYY').format('YYYY-MM-DD') : '',
            sexo: pacMpi.sexo ? pacMpi.sexo : ''
        };
        const pacElastic = {
            documento: pac.documento ? pac.documento.toString() : '',
            nombre: pac.nombre ? pac.nombre : '',
            apellido: pac.apellido ? pac.apellido : '',
            fechaNacimiento: pac.fechaNacimiento ? moment(pac.fechaNacimiento, 'DD/MM/YYYY').format('YYYY-MM-DD') : '',
            sexo: pac.sexo
        };

        return new Matching().matchPersonas(pacElastic, pacDto, weights, 'Levenshtein');
    };
    let paciente = {
        documento: registro.numeroDocumento ? registro.numeroDocumento.toString() : null,
        nombre: registro.nombre ? registro.nombre.trim() : null,
        apellido: registro.apellido ? registro.apellido.trim() : null,
        sexo: registro.idSexo ? (registro.idSexo === 2 ? 'femenino' : (registro.idSexo === 3  ? 'masculino' : 'otro') ) : null,
        fechaNacimiento: registro.fechaNacimiento ? registro.fechaNacimiento : null
    };
    if (paciente.nombre && paciente.apellido && paciente.sexo && paciente.fechaNacimiento && paciente.documento) {


        return matchPaciente(pacienteAndes, paciente) >= cota ?  pacienteAndes : null;
    } else {
        return null;
    }
}

/**
 *
 *
 * @param {*} documento
 */
async function getIdPaciente(paciente, transaction) {
    let pacienteSips: any = await getPacienteSips(paciente.documento, transaction);
    if (verificarPaciente(pacienteSips, paciente)) {
        return pacienteSips.idPaciente;
    }
    return null;
}

/**
 *
 *
 * @param {*} transaction
 * @param {*} documento
 * @returns
 */
async function getPacienteSips(documento, transaction) {
    let res = await new sql.Request(transaction)
        .input('documento', sql.Int, documento)
        .query('SELECT * FROM SYS_Paciente where numeroDocumento = @documento');
    return res.recordsets[0][0];
}
