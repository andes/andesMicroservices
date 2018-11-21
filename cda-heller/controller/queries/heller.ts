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
    CONVERT(text, CNS_Informes.Informe) AS texto,
    Profesionales.CNS_Pr_Grupal as grupal
    FROM CNS_Recepcion
    inner join  Pacientes on CNS_Recepcion.DNI = Pacientes.[Número de Documento]
inner JOIN CNS_Consultorios ON CNS_Recepcion.Id_Consultorio= CNS_Consultorios.Id_Consultorio
   INNER JOIN CNS_TipoConsultorio ON CNS_Consultorios.Id_TipoCNS = CNS_TipoConsultorio.Id_TipoCNS
    inner JOIN Profesionales ON CNS_Recepcion.CodigoProf = Profesionales.Código
    inner JOIN  CNS_Informes on CNS_Recepcion.Id_Informe= CNS_Informes.Id_Informe
    inner JOIN CNS_Informes_MDC ON CNS_Recepcion.Id_Informe = CNS_Informes_MDC.Id_Informe
    inner JOIN CIE ON CNS_Informes_MDC.CodigoCIE10 = CIE.Id
    INNER JOIN dbo.Especialidades ON dbo.Profesionales.id_especialidad = dbo.Especialidades.id_especialidad
    LEFT JOIN dbo.AndesMapEspecialidad ON dbo.AndesMapEspecialidad.id_especialidad = dbo.Especialidades.id_especialidad
    where Pacientes.[Número de Documento]!=99 and
            (Pacientes.[Número de Documento]<88000000 or Pacientes.[Número de Documento]>89000000)
            and Atendido =1
            and CodigoProf not in (1019159,1019158,1019157,1019054)/*se excluye cns enfermeria*/
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

export function profesionalGrupal() {
        const connectionString = {
                user: ConfigPrivate.staticConfiguration.heller.user,
                password: ConfigPrivate.staticConfiguration.heller.password,
                server: ConfigPrivate.staticConfiguration.heller.ip,
                database: ConfigPrivate.staticConfiguration.heller.database,
                options: {
                        tdsVersion: '7_1'
                }
        };


        const query = ``;

        return {
                connectionString,
                query
        };
}
