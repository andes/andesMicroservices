import * as ConfigPrivate from './../../config.private';

export function make(paciente: any) {
    const connectionString = {
        user: ConfigPrivate.staticConfiguration.heller.user,
        password: ConfigPrivate.staticConfiguration.heller.password,
        server: ConfigPrivate.staticConfiguration.heller.ip,
        database: ConfigPrivate.staticConfiguration.heller.database,
        options: {
                tdsVersion: '7_1'
            }
    };

    const dni = paciente.documento;

    const query = `select
        replace(CNS_TipoConsultorio.Descripcion,' ','') + '-' + rtrim(CNS_Recepcion.Id_recepcion) as id,
       CASE WHEN (  rtrim(dbo.AndesMapEspecialidad.CodigoSnomed)  = '0' or dbo.AndesMapEspecialidad.CodigoSnomed  IS NULL)THEN
                '391000013108' ELSE dbo.AndesMapEspecialidad.CodigoSnomed  END AS prestacion,
                999 as idEfector,
        CNS_Recepcion.Fecha as fecha,
        '10580352167031' as sisa,
        CNS_Recepcion.DNI AS pacienteDocumento,
                Pacientes.NOMBRES AS pacienteNombre,
        Pacientes.APELLIDOS AS pacienteApellido,
        Pacientes.[Fecha de Nacimiento] AS pacienteFechaNacimiento,
        CASE WHEN Pacientes.Sexo = 'M' THEN 'masculino' WHEN Pacientes.Sexo = 'F' THEN 'femenino' ELSE 'otro' END AS pacienteSexo,
                Profesionales.DNI as profesionalDocumento,
                        CASE
                WHEN CHARINDEX(' ', Profesionales.[Apellido y nombre]) >=1 THEN SUBSTRING(Profesionales.[Apellido y nombre],CHARINDEX(' ', Profesionales.[Apellido y nombre])+1,30 )
                ELSE NULL
                END as profesionalNombre,
        CASE
                WHEN CHARINDEX(' ', Profesionales.[Apellido y nombre]) >=1 THEN LEFT(Profesionales.[Apellido y nombre],CHARINDEX(' ', Profesionales.[Apellido y nombre])-1 )
                ELSE Profesionales.[Apellido y nombre]
                END  as profesionalApellido,
        Profesionales.MP as profesionalMatricula,
        dbo.Especialidades.Especialidad,
        CIE.cod_sss as cie10,
        CONVERT(text, CNS_Informes.Informe) AS texto
           FROM Movimientos
           INNER JOIN CNS_Recepcion ON CNS_Recepcion.nReg=Movimientos.NroReg
           inner join  Pacientes on Movimientos.[Número de Documento] = Pacientes.[Número de Documento]
       inner JOIN CNS_Consultorios ON CNS_Recepcion.Id_Consultorio= CNS_Consultorios.Id_Consultorio
                   INNER JOIN CNS_TipoConsultorio ON CNS_Consultorios.Id_TipoCNS = CNS_TipoConsultorio.Id_TipoCNS
           inner JOIN Profesionales ON Movimientos.codigoprof = Profesionales.Código
           INNER JOIN dbo.Especialidades ON dbo.Profesionales.id_especialidad = dbo.Especialidades.id_especialidad
           inner JOIN CNS_Informes_MDC ON  CNS_Informes_MDC.Id_Informe= CNS_Recepcion.Id_Informe
           inner JOIN  CNS_Informes on CNS_Recepcion.Id_Informe= CNS_Informes.Id_Informe
           inner JOIN CIE ON CNS_Informes_MDC.CodigoCIE10 = CIE.Id
                    LEFT JOIN dbo.AndesMapEspecialidad ON dbo.AndesMapEspecialidad.id_especialidad = dbo.Especialidades.id_especialidad
                    where Pacientes.[Número de Documento]!=99 and
                            (Pacientes.[Número de Documento]<88000000 or Pacientes.[Número de Documento]>89000000)
                            and Atendido =1
                            and Movimientos.codigoprof not in (select codigoNoInc from AndesProfExcluidos)
                            and (CNS_Recepcion.Id_Consultorio >=2 and  CNS_Recepcion.Id_Consultorio<68)
                            and CNS_Informes_MDC.Ppal=1
                            and CNS_Informes_MDC.CodigoCIE10 <>''
                            and Pacientes.[Número de Documento] =  '${dni}'
                    ORDER BY CNS_Recepcion.Fecha`;

    return {
        connectionString,
        query
    };
}

export function makeMysql(paciente: any) {
    const connectionString = {
        host: ConfigPrivate.staticConfiguration.hellerMysql.ip,
        user: ConfigPrivate.staticConfiguration.hellerMysql.user,
        password: ConfigPrivate.staticConfiguration.hellerMysql.password,
        database: ConfigPrivate.staticConfiguration.hellerMysql.database
    };

    const dni = paciente.documento;

    const query = `SELECT
    CONCAT('Consultorios Ext.Enfermeria','-',rtrim(enf_cns_prestaciones_monitor.idCnsRecepEnfPrestaciones)) as id,
    '861000013109' AS prestacion,
    999 as idEfector,
    enf_cns_prestaciones_monitor.fechaRecep as fecha,
        '10580352167031' as sisa,
        dniPac as DNIPaciente,
        SUBSTRING_INDEX(apenomPac, ',', 1) as ApellidoPaciente,
        SUBSTRING_INDEX(SUBSTRING_INDEX(apenomPac, ',', 2), ',', -1)as NombrePaciente,
        enf_cns_prestaciones_monitor.fechaNac as fechaNacPaciente,
        enf_cns_prestaciones_monitor.sexoPac as Sexo,
        personaldb.per_persona.NroDoc as DniProfesional,
        personaldb.per_persona.Nombre as NombreProfesional,
        personaldb.per_persona.Apellido as ApellidoProfesional,
        '0' as MatriculaProfesional,
        CONCAT(enf_cns_prestaciones_tipoatencion.atencionNombre,' ',enf_cns_prestaciones_atenciones.evolucion) as texto
        FROM enf_cns_prestaciones_monitor
        INNER JOIN enf_cns_prestaciones_atenciones
        ON enf_cns_prestaciones_monitor.idCnsRecepEnfPrestaciones = enf_cns_prestaciones_atenciones.idCnsRecepEnfPrestaciones
        INNER JOIN enf_cns_prestaciones_tipoatencion
        ON enf_cns_prestaciones_atenciones.idTipoAtencionCnsEnfPrest = enf_cns_prestaciones_tipoatencion.idTipoAtencionCnsEnfPrest
        INNER JOIN personaldb.per_agentes
        on personaldb.per_agentes.idAgente = enf_cns_prestaciones_atenciones.idAgente
        inner join personaldb.per_persona
        on personaldb.per_agentes.idPersona = personaldb.per_persona.idPersona
        where dniPac='${dni}'`;

    return {
        connectionString,
        query
    };
}

