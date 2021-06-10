import { log } from '@andes/log';
import * as sql from 'mssql';

import { fakeRequest } from './../config.private';

export async function getPacienteSIPS(paciente: any, conexion) {
    const documento = parseInt(paciente.documento, 10);
    if (documento) {
        const query = `SELECT TOP 1 *
        FROM [SIPS].[dbo].[Sys_Paciente] where numeroDocumento = '${documento}' and activo=1`;
        try {
            const result = await conexion.request().query(query);

            return (result && result.recordset) ? result.recordset[0] : null;

        } catch (err) {
            log(fakeRequest, 'microservices:integration:facturacion-perinatal', paciente.id, 'getPacienteSIPS:error', { error: err, query, paciente: documento });
            return err;
        }
    } else {
        return null;
    }
}



export async function getOrganizacionSIPS(codSisa: any, conexion) {
    const codigoSisa = parseInt(codSisa, 10) || null;
    if (codigoSisa) {
        const query = `SELECT TOP 1 * FROM [SIPS].[dbo].[Sys_Efector] where codigoSisa = '${codigoSisa}' and activo=1`;
        try {
            const result = await conexion.request().query(query);

            return (result && result.recordset) ? result.recordset[0] : null;

        } catch (err) {
            log(fakeRequest, 'microservices:integration:facturacion-perinatal', codSisa, 'getOrganizacionSIPS:error', { error: err, query, codigoSisa });
            return err;
        }
    } else {
        return null;
    }
}



export async function getHCPerinatal(idPaciente: number, numeroEmbarazo: number, conexion) {
    let query = '';
    if (idPaciente && numeroEmbarazo) {
        query = `SELECT TOP 1 * FROM APR_HistoriaClinicaPerinatal where idPaciente = '${idPaciente}' and numeroEmbarazo = '${numeroEmbarazo}'and activa=1`;

    } else {
        return null;
    }
    if (query) {
        try {
            const result = await conexion.request().query(query);

            return (result && result.recordset) ? result.recordset[0] : null;

        } catch (err) {

            log(fakeRequest, 'microservices:integration:facturacion-perinatal', { idPaciente, numeroEmbarazo }, 'getHCPerinatalSIPS:error', { error: err, query, idPaciente });
            return err;
        }
    }
}

export async function getHCPerinatalDetalle(idPrestacion: any, conexion) {

    if (idPrestacion) {
        const query = `SELECT TOP 1 * FROM APR_HistoriaClinicaPerinatalDetalle where idPrestacionRUP = '${idPrestacion}' and activa=1`;
        try {

            const result = await conexion.request().query(query);

            return (result && result.recordset) ? result.recordset[0] : null;

        } catch (err) {

            log(fakeRequest, 'microservices:integration:facturacion-perinatal', idPrestacion, 'getHCPerinatalSIPS:error', { error: err, query, idPrestacion });
            return err;
        }
    } else {
        return null;
    }
}

export async function insertConsultaSIPS(consulta: any, conexion) {

    if (consulta) {

        let queryInsert = `INSERT INTO [dbo].[CON_Consulta] ( [idEfector], [fecha], [hora], [idPaciente], [idEspecialidad],
             [idProfesional], [motivoConsulta], [informeConsulta], [idDerivadoPor], [idDerivadoHacia], [idTipoPrestacion],
            [idObraSocial], [idUsuarioRegistro], [fechaRegistro], [idTurno], [peso], [talla], [tAS], [tAD], [imc],
            [perimetroCefalico], [riesgoCardiovascular], [idProgramaOdontologia], [primerConsultaOdontologia])
             VALUES (@idEfector, @fecha, @hora, @idPaciente, @idEspecialidad, @idProfesional, @motivoConsulta, @informeConsulta, 
            @idDerivadoPor, @idDerivadoHacia, @idTipoPrestacion, @idObraSocial, @idUsuarioRegistro, @fechaRegistro,  @idTurno, @peso,
            @talla, @tAS, @tAD,@imc,@perimetroCefalico, @riesgoCardiovascular, @idProgramaOdontologia, @primerConsultaOdontologia)
             SELECT SCOPE_IDENTITY() AS id`;
        try {
            const idTurno = consulta.idTurno ? consulta.idTurno : 0;
            const idProgramaOdontologia = consulta.idProgramaOdontologia ? consulta.idProgramaOdontologia : 0;
            const primerConsultaOdontologia = consulta.primerConsultaOdontologia ? consulta.primerConsultaOdontologia : 0;
            const result = await new sql.Request(conexion)
                .input('idEfector', sql.Int, consulta.idEfector)
                .input('fecha', sql.DateTime, new Date(consulta.fecha))
                .input('hora', sql.VarChar(10), consulta.hora)
                .input('idPaciente', sql.Int, consulta.idPaciente)
                .input('idEspecialidad', sql.Int, consulta.idEspecialidad)
                .input('idProfesional', sql.Int, consulta.idProfesional)
                .input('motivoConsulta', sql.VarChar(), consulta.motivoConsulta)
                .input('informeConsulta', sql.VarChar(), consulta.informeConsulta)
                .input('idDerivadoPor', sql.Int, consulta.idDerivadoPor)
                .input('idDerivadoHacia', sql.Int, consulta.idTipoProfesional)
                .input('idTipoPrestacion', sql.Int, consulta.idTipoPrestacion)
                .input('idObraSocial', sql.Int, consulta.idObraSocial)
                .input('idUsuarioRegistro', sql.Int, consulta.idUsuarioRegistro)
                .input('fechaRegistro', sql.DateTime, new Date(consulta.fechaRegistro))
                .input('idTurno', sql.Int, idTurno)
                .input('peso', sql.Decimal(5, 2), consulta.peso)
                .input('talla', sql.Decimal(5, 2), consulta.talla)
                .input('tAS', sql.Int(10), consulta.tAS)
                .input('tAD', sql.Decimal(18, 6), consulta.tAD)
                .input('imc', sql.Decimal(5, 2), consulta.imc)
                .input('perimetroCefalico', sql.Decimal(5, 2), consulta.perimetroCefalico)
                .input('riesgoCardiovascular', sql.Int, consulta.riesgoCardiovascular)
                .input('idProgramaOdontologia', sql.Int, idProgramaOdontologia)
                .input('primerConsultaOdontologia', sql.Int, primerConsultaOdontologia)
                .query(queryInsert);

            return result.recordset[0];
        } catch (err) {

            log(fakeRequest, 'microservices:integration:facturacion-perinatal', null, 'insertConsultaSIPS:error', { error: err, queryInsert });
        }
    }
    return null;

}

export async function updateConsulta(consulta, conexion) {
    if (consulta) {
        let query = 'UPDATE [SIPS].[dbo].[CON_Consulta] SET ' +
            ' motivoConsulta = @motivoConsulta' +
            ', informeConsulta = @informeConsulta' +
            ', peso = @peso ' +
            ', Talla = @talla' +
            ', tAS = @tAS' +
            ', tAD = @tAD' +
            ', imc = @imc' +
            ', perimetroCefalico = @perimetroCefalico' +
            ' where idConsulta = @idConsulta ';
        try {
            let result = await new sql.Request(conexion)
                .input('motivoConsulta', sql.VarChar(), consulta.motivoConsulta)
                .input('informeConsulta', sql.VarChar(), consulta.informeConsulta)
                .input('peso', sql.Decimal(5, 2), consulta.peso)
                .input('talla', sql.Decimal(5, 2), consulta.talla)
                .input('tAS', sql.Int(10), consulta.tAS)
                .input('tAD', sql.Decimal(18, 6), consulta.tAD)
                .input('imc', sql.Decimal(5, 2), consulta.imc)
                .input('perimetroCefalico', sql.Decimal(5, 2), consulta.perimetroCefalico)
                .input('idConsulta', sql.Int, consulta.idConsulta)
                .query(query);
            return (result && result.recordset) ? result.recordset[0].id : null;

        } catch (err) {

            log(fakeRequest, 'microservices:integration:facturacion-perinatal', consulta.id, 'updateConsulta:error', { error: err, query, idConsulta: consulta.idConsulta });
            return err;
        }
    }
}


export async function insertHCPerinatalSIPS(hcp: any, conexion) {
    if (hcp) {
        let queryInsert = `INSERT INTO [SIPS].[dbo].[APR_HistoriaClinicaPerinatal] ( 
             [idEfector]
            , [idPaciente]
            , [Nombre]
            , [Apellido]
            , [Domicilio]
            , [DNI]
            , [Localidad]
            , [Telefono]
            , [FechaNacimiento]
            , [Edad]
            , [DatosDeContacto]
            , [EdadMenor15Mayor35]
            , [PesoAnterior]
            , [Talla]
            , [FUM]
            , [FPP]
            , [activa]
            , [observaciones]
            , [anulada]
            , [motivoAnulacion] 
            , [numeroEmbarazo]
            , [CreatedOn])
             VALUES (@idEfector, @idPaciente, @nombre, @apellido, @domicilio, @dni, @localidad, @telefono, @fechaNacimiento, @edad, @contacto,
             @edadMenor15Mayor35, @pesoAnterior, @talla, @fum, @fpp, @activa,  @observaciones, @anulada, @motivoAnulacion, @numeroEmbarazo, @CreatedOn)
             SELECT SCOPE_IDENTITY() AS id`;
        try {
            const edadMenor15Mayor35 = (hcp.edad && (hcp.edad < 15 || hcp.edad > 35)) ? 1 : 0;
            const result = await new sql.Request(conexion)
                .input('idEfector', sql.Int, hcp.idEfector)
                .input('idPaciente', sql.Int, hcp.idPaciente)
                .input('nombre', sql.VarChar(sql.MAX), hcp.nombre)
                .input('apellido', sql.VarChar(sql.MAX), hcp.apellido)
                .input('domicilio', sql.VarChar(sql.MAX), hcp.domicilio)
                .input('dni', sql.VarChar(sql.MAX), hcp.dni)
                .input('localidad', sql.VarChar(sql.MAX), hcp.localidad)
                .input('telefono', sql.VarChar(sql.MAX), hcp.telefono)
                .input('fechaNacimiento', sql.DateTime, hcp.fechaNacimiento)
                .input('edad', sql.Int, hcp.edad)
                .input('contacto', sql.VarChar(300), hcp.contacto)
                .input('edadMenor15Mayor35', sql.Bit, edadMenor15Mayor35)
                .input('pesoAnterior', sql.Decimal(10, 3), hcp.pesoAnterior)
                .input('talla', sql.Int, hcp.talla)
                .input('fum', sql.DateTime, hcp.fum)
                .input('fpp', sql.DateTime, hcp.fpp)
                .input('activa', sql.Bit, hcp.activa)
                .input('observaciones', sql.VarChar(300), hcp.observaciones)
                .input('anulada', sql.Bit, hcp.anulada)
                .input('motivoAnulacion', sql.VarChar(sql.MAX), hcp.motivoAnulacion)
                .input('numeroEmbarazo', sql.Int, hcp.numeroEmbarazo)
                .input('CreatedOn', sql.DateTime, new Date())
                .query(queryInsert);

            return (result && result.recordset) ? result.recordset[0].id : null;

        } catch (err) {
            log(fakeRequest, 'microservices:integration:facturacion-perinatal', null, 'insertHCPerinatalSIPS:error', { error: err, queryInsert });
            return err;
        }
    } else {
        return null;
    }
}

export async function updateHCPerinatal(newHCP, conexion) {
    if (newHCP) {
        const edadMenor15Mayor35 = (newHCP.edad && (newHCP.edad < 15 || newHCP.edad > 35)) ? 1 : 0;
        let query = 'UPDATE [SIPS].[dbo].[APR_HistoriaClinicaPerinatal] SET ' +
            ' Nombre = @nombre' +
            ', Apellido = @apellido' +
            ', Domicilio = @domicilio ' +
            ', Localidad = @localidad ' +
            ', FechaNacimiento = @fechaNacimiento ' +
            ', Edad = @edad ' +
            ', DatosDeContacto = @contacto' +
            ', EdadMenor15Mayor35 = @edadMenor15Mayor35 ' +
            ', PesoAnterior = @pesoAnterior ' +
            ', Talla = @talla' +
            ', FUM = @fum' +
            ', FPP = @fpp' +
            ', observaciones = @observaciones' +
            ', numeroEmbarazo = @numeroEmbarazo' +
            ' where idHistoriaClinicaPerinatal = @idHCPerinatal ';
        try {

            let result = await new sql.Request(conexion)
                .input('idHCPerinatal', sql.Int, newHCP.idHCPerinatal)
                .input('nombre', sql.VarChar(sql.MAX), newHCP.nombre)
                .input('apellido', sql.VarChar(sql.MAX), newHCP.apellido)
                .input('domicilio', sql.VarChar(sql.MAX), newHCP.domicilio)
                .input('localidad', sql.VarChar(sql.MAX), newHCP.localidad)
                .input('telefono', sql.VarChar(sql.MAX), newHCP.telefono)
                .input('fechaNacimiento', sql.DateTime, newHCP.fechaNacimiento)
                .input('edad', sql.Int, newHCP.edad)
                .input('contacto', sql.VarChar(300), newHCP.contacto)
                .input('edadMenor15Mayor35', sql.Bit, edadMenor15Mayor35)
                .input('pesoAnterior', sql.Decimal(10, 3), newHCP.pesoAnterior)
                .input('talla', sql.Int, newHCP.talla)
                .input('fum', sql.DateTime, newHCP.fum)
                .input('fpp', sql.DateTime, newHCP.fpp)
                .input('activa', sql.Bit, newHCP.activa)
                .input('observaciones', sql.VarChar(300), newHCP.observaciones)
                .input('numeroEmbarazo', sql.Int, newHCP.numeroEmbarazo)
                .query(query);
            return (result && result.recordset) ? result.recordset[0].id : null;

        } catch (err) {

            log(fakeRequest, 'microservices:integration:facturacion-perinatal', newHCP.id, 'updateHCPerinatal:error', { error: err, query, idHCP: newHCP.idHistoriaClinicaPerinatal });
            return err;
        }
    }
}



export async function insertHCPDetalleSIPS(hcpd: any, conexion) {

    if (hcpd) {
        const queryInsert = 'INSERT INTO [SIPS].[dbo].[APR_HistoriaClinicaPerinatalDetalle] ( ' +
            ' [idEfector]' +
            ', [idHistoriaClinicaPerinatal]' +
            ', [idConsulta]' +
            ', [Fecha]' +
            ', [EdadGestacional]' +
            ', [Peso]' +
            ', [IMC]' +
            ', [PA]' +
            ', [AlturaUterina]' +
            ', [FCF]' +
            ', [MovimientosFetales]' +
            ', [observaciones]' +
            ', [ProximaCita]' +
            ', [activa]' +
            ', [idPrestacionRUP])' +
            ' VALUES (@idEfector, @idHCP, @idConsulta, @fecha, @edadGestacional, @peso, @imc, @pa, @alturaUterina,' +
            ' @fcf, @movimientosFetales,  @observaciones, @proximaCita, @activa, @idPrestacionRUP)' +
            ' SELECT SCOPE_IDENTITY() AS id';
        try {
            const result = await new sql.Request(conexion)
                .input('idEfector', sql.Int, hcpd.idEfector)
                .input('idHCP', sql.Int, hcpd.idHistoriaClinicaPerinatal)
                .input('idConsulta', sql.Int, hcpd.idConsulta)
                .input('fecha', sql.DateTime, hcpd.fecha)
                .input('edadGestacional', sql.Decimal(5, 2), hcpd.edadGestacional)
                .input('peso', sql.Decimal(6, 3), hcpd.peso)
                .input('imc', sql.Decimal(5, 2), hcpd.imc)
                .input('pa', sql.VarChar(sql.MAX), hcpd.pa)
                .input('alturaUterina', sql.Decimal(5, 2), hcpd.alturaUterina)
                .input('fcf', sql.Int, hcpd.fcf)
                .input('movimientosFetales', sql.VarChar(sql.MAX), hcpd.movimientosFetales)
                .input('observaciones', sql.VarChar(sql.MAX), hcpd.observaciones)
                .input('proximaCita', sql.DateTime, hcpd.proximaCita)
                .input('activa', sql.Bit, hcpd.activa)
                .input('idPrestacionRUP', sql.VarChar(sql.MAX), hcpd.idPrestacionRUP)
                .query(queryInsert);

            return (result && result.recordset) ? result.recordset[0].id : null;

        } catch (err) {

            log(fakeRequest, 'microservices:integration:facturacion-perinatal', null, 'insertHCPDetalleSIPS:error', { error: err, queryInsert });
            return err;
        }
    } else {
        return null;
    }
}


export async function updateHCPDetalle(newHCPD, conexion) {

    if (newHCPD) {

        let query = 'UPDATE [SIPS].[dbo].[APR_HistoriaClinicaPerinatalDetalle] SET ' +
            ' EdadGestacional = @edadGestacional' +
            ', Peso = @peso' +
            ', IMC = @imc' +
            ', PA = @pa' +
            ', AlturaUterina = @alturaUterina' +
            ', FCF = @fcf' +
            ', MovimientosFetales = @movimientosFetales' +
            ', observaciones = @observaciones' +
            ', ProximaCita = @proximaCita' +
            ' where idHistoriaClinicaPerinatalDetalle = @idHCPD ';

        try {
            const result = await new sql.Request(conexion)
                .input('edadGestacional', sql.Decimal(5, 2), newHCPD.edadGestacional)
                .input('peso', sql.Decimal(6, 3), newHCPD.peso)
                .input('imc', sql.Decimal(5, 2), newHCPD.imc)
                .input('pa', sql.VarChar(sql.MAX), newHCPD.pa)
                .input('alturaUterina', sql.Decimal(5, 2), newHCPD.alturaUterina)
                .input('fcf', sql.Int, newHCPD.fcf)
                .input('movimientosFetales', sql.VarChar(sql.MAX), newHCPD.movimientosFetales)
                .input('observaciones', sql.VarChar(sql.MAX), newHCPD.observaciones)
                .input('proximaCita', sql.DateTime, newHCPD.proximaCita)
                .input('idHCPD', sql.Int, newHCPD.idHCPD)
                .query(query);

            return (result && result.recordset) ? result.recordset[0].id : null;

        } catch (err) {

            log(fakeRequest, 'microservices:integration:facturacion-perinatal', newHCPD.id, 'updateHCPDetalle:error', { error: err, query, idHCP: newHCPD.idHistoriaClinicaPerinatal });
            return err;
        }
    }
}

