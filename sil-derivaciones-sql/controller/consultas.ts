export const InsertLABProtocoloQuery =
    `INSERT INTO [dbo].[LAB_Protocolo]
        ([idEfector]
        ,[numero]
        ,[numeroDiario]
        ,[numeroTipoServicio]
        ,[prefijoSector]
        ,[numeroSector]
        ,[idSector]
        ,[sala]
        ,[cama]
        ,[idTipoServicio]
        ,[fecha]
        ,[fechaOrden]
        ,[fechaRetiro]
        ,[idPaciente]
        ,[idEfectorSolicitante]
        ,[idEspecialistaSolicitante]
        ,[idObraSocial]
        ,[idOrigen]
        ,[idPrioridad]
        ,[observacion]
        ,[observacionesResultados]
        ,[alerta]
        ,[edad]
        ,[unidadEdad]
        ,[sexo]
        ,[embarazada]
        ,[numeroOrigen]
        ,[estado]
        ,[impreso]
        ,[baja]
        ,[idUsuarioRegistro]
        ,[fechaRegistro]
        ,[idMuestra]
        ,[fechaTomaMuestra])
    VALUES
        (@idEfector
        ,@numero
        ,@numeroDiario
        ,@numeroTipoServicio
        ,@prefijoSector
        ,@numeroSector
        ,@idSector
        ,@sala
        ,@cama
        ,@idTipoServicio
        ,@fecha
        ,@fechaOrden
        ,@fechaRetiro
        ,@idPaciente
        ,@idEfectorSolicitante
        ,@idEspecialistaSolicitante
        ,@idObraSocial
        ,@idOrigen
        ,@idPrioridad
        ,@observacion
        ,@observacionesResultados
        ,@alerta
        ,@edad
        ,@unidadEdad
        ,@sexo
        ,@embarazada
        ,@numeroOrigen
        ,@estado
        ,@impreso
        ,@baja
        ,@idUsuarioRegistro
        ,@fechaRegistro
        ,@idMuestra
        ,@fechaTomaMuestra);
         SELECT SCOPE_IDENTITY() AS idProtocolo;`;

// export const InsertLABProtocoloQuery =
//     `INSERT INTO [dbo].[LAB_Protocolo]
//         ([idEfector]
//         ,[numero]
//         ,[numeroDiario]
//         ,[numeroTipoServicio]
//         ,[prefijoSector]
//         ,[numeroSector]
//         ,[idSector]
//         ,[sala]
//         ,[cama]
//         ,[idTipoServicio]
//         ,[fecha]
//         ,[fechaOrden]
//         ,[fechaRetiro]
//         ,[idPaciente]
//         ,[idEfectorSolicitante]
//         ,[idEspecialistaSolicitante]
//         ,[idObraSocial]
//         ,[idOrigen]
//         ,[idPrioridad]
//         ,[observacion]
//         ,[observacionesResultados]
//         ,[alerta]
//         ,[edad]
//         ,[unidadEdad]
//         ,[sexo]
//         ,[embarazada]
//         ,[horaNacimiento]
//         ,[pesoNacimiento]
//         ,[semanaGestacion]
//         ,[numeroOrigen]
//         ,[estado]
//         ,[impreso]
//         ,[baja]
//         ,[idUsuarioRegistro]
//         ,[fechaRegistro]
//         ,[idMuestra]
//         ,[fechaTomaMuestra]
//         ,[descripcionProducto]
//         ,[idConservacion])
//     VALUES
//         (@idEfector
//         ,@numero
//         ,@numeroDiario
//         ,@numeroTipoServicio
//         ,@prefijoSector
//         ,@numeroSector
//         ,@idSector
//         ,@sala
//         ,@cama
//         ,@idTipoServicio
//         ,@fecha
//         ,@fechaOrden
//         ,@fechaRetiro
//         ,@idPaciente
//         ,@idEfectorSolicitante
//         ,@idEspecialistaSolicitante
//         ,@idObraSocial
//         ,@idOrigen
//         ,@idPrioridad
//         ,@observacion
//         ,@observacionesResultados
//         ,@alerta
//         ,@edad
//         ,@unidadEdad
//         ,@sexo
//         ,@embarazada
//         ,@horaNacimiento
//         ,@pesoNacimiento
//         ,@semanaGestacion
//         ,@numeroOrigen
//         ,@estado
//         ,@impreso
//         ,@baja
//         ,@idUsuarioRegistro
//         ,@fechaRegistro
//         ,@idMuestra
//         ,@fechaTomaMuestra
//         ,@descripcionProducto
//         ,@idConservacion);
//          SELECT SCOPE_IDENTITY() AS idProtocolo;`;

export const InsertLABProtocoloDetalleQuery =
    `INSERT INTO [dbo].[LAB_DetalleProtocolo]
        ([idProtocolo]
        ,[idEfector]
        ,[idItem]
        ,[idSubItem]
        ,[trajoMuestra]
        ,[resultadoCar]
        ,[resultadoNum]
        ,[unidadMedida]
        ,[metodo]
        ,[valorReferencia]
        ,[observaciones]
        ,[codigoObservaciones]
        ,[conResultado]
        ,[idUsuarioResultado]
        ,[fechaResultado]
        ,[idUsuarioValida]
        ,[fechaValida]
        ,[idUsuarioControl]
        ,[fechaControl]
        ,[idUsuarioImpresion]
        ,[fechaImpresion]
        ,[enviado]
        ,[idUsuarioEnvio]
        ,[fechaEnvio]
        ,[idUsuarioObservacion]
        ,[fechaObservacion]
        ,[idUsuarioValidaObservacion]
        ,[fechaValidaObservacion]
        ,[formatoValida])
    VALUES
        (@idProtocolo
        ,@idEfector
        ,@idItem
        ,@idSubItem
        ,@trajoMuestra
        ,@resultadoCar
        ,@resultadoNum
        ,@unidadMedida
        ,@metodo
        ,@valorReferencia
        ,@observaciones
        ,@codigoObservaciones
        ,@conResultado
        ,@idUsuarioResultado
        ,@fechaResultado
        ,@idUsuarioValida
        ,@fechaValida
        ,@idUsuarioControl
        ,@fechaControl
        ,@idUsuarioImpresion
        ,@fechaImpresion
        ,@enviado
        ,@idUsuarioEnvio
        ,@fechaEnvio
        ,@idUsuarioObservacion
        ,@fechaObservacion
        ,@idUsuarioValidaObservacion
        ,@fechaValidaObservacion
        ,@formatoValida)
        SELECT SCOPE_IDENTITY() AS idDetalleProtocolo;`;

export const InsertLABDerivacionQuery =
    `INSERT INTO [dbo].[LAB_Derivacion]
        ([idDetalleProtocolo]
        ,[fechaRegistro]
        ,[idUsuarioRegistro]
        ,[estado]
        ,[observacion]
        ,[resultado]
        ,[idUsuarioResultado]
        ,[fechaResultado])
    VALUES
        (@idDetalleProtocolo
        ,@fechaRegistro
        ,@idUsuarioRegistro
        ,@estado
        ,@observacion
        ,@resultado
        ,@idUsuarioResultado
        ,@fechaResultado)`;
