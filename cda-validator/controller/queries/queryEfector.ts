import { staticConfiguration } from './../../config.private';
import { IConnection, IQueryGuardia } from './../../schemas/queriesGuardia';
import { getQueries } from './../../service/queriesGuardia'


export function queryEfector(efector: any, paciente: any) {

    const connectionString = {
        user: staticConfiguration[efector].user,
        password: staticConfiguration[efector].password,
        server: staticConfiguration[efector].ip,
        database: staticConfiguration[efector].database,
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


// GUARDIAS
/**
 * Se obtienen queries a ejecutar en el "efector"
 */
export async function getQueriesGuardia(efector) {
    const connectionString: IConnection = {
        user: staticConfiguration[efector].user,
        password: staticConfiguration[efector].password,
        server: staticConfiguration[efector].ip,
        database: staticConfiguration[efector].database,
        formatDate: staticConfiguration[efector].formatDate,
        requestTimeout: 30000
    };
    let arrayQueries: IQueryGuardia[] = await getQueries({ organizacion: { $in: [efector] } });
    arrayQueries = arrayQueries.map((query) => {
        query.connection = connectionString;
        return query;
    });
    await Promise.all(arrayQueries);
    return arrayQueries;
}
