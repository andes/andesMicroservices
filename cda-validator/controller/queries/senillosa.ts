import * as ConfigPrivate from './../../config.private';

function make(paciente: any) {
    const connectionString = {
        user: ConfigPrivate.staticConfiguration.senillosa.user,
        password: ConfigPrivate.staticConfiguration.senillosa.password,
        server: ConfigPrivate.staticConfiguration.senillosa.ip,
        database: ConfigPrivate.staticConfiguration.senillosa.database,
        requestTimeout: 30000
    };

    const dni = paciente.documento;

    const query =
        `SELECT  consulta.idConsulta AS id ,
        CASE WHEN e.conceptId_snomed IS NOT NULL THEN e.conceptId_snomed
             ELSE '11429006'
        END AS prestacion ,
        efector.idEfector AS idEfector ,
        consulta.fecha AS fecha ,
        efector.codigoSisa AS sisa ,
        pac.numeroDocumento AS pacienteDocumento ,
        pac.nombre AS pacienteNombre ,
        pac.apellido AS pacienteApellido ,
        pac.fechaNacimiento AS pacienteFechaNacimiento ,
        sex.nombre AS pacienteSexo ,
        prof.numeroDocumento AS profesionalDocumento ,
        prof.nombre AS profesionalNombre ,
        prof.apellido AS profesionalApellido ,
        prof.matricula AS profesionalMatricula ,
        cie.CODIGO AS cie10 ,
        consulta.informeConsulta AS texto
FROM    Sys_Paciente AS pac
        INNER JOIN Sys_Sexo AS sex ON sex.idSexo = pac.idSexo
        INNER JOIN CON_Consulta AS consulta ON consulta.idPaciente = pac.idPaciente
        INNER JOIN CON_ConsultaDiagnostico AS consultaD ON consultaD.idConsulta = consulta.idConsulta
        INNER JOIN Sys_CIE10 AS cie ON consultaD.CODCIE10 = cie.ID
        INNER JOIN Sys_Profesional AS prof ON consulta.idProfesional = prof.idProfesional
        INNER JOIN Sys_Efector AS efector ON consulta.idEfector = efector.idEfector
        INNER JOIN dbo.Sys_Especialidad AS e ON e.idEspecialidad = consulta.idEspecialidad
WHERE   pac.numeroDocumento = '${dni}'`;

    return {
        connectionString,
        query
    };
}

export = make;
