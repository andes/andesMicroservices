import * as ConfigPrivate from '../../config.private';

function make(paciente: any) {
    const connectionString = {
        user: ConfigPrivate.staticConfiguration.sips.user,
        password: ConfigPrivate.staticConfiguration.sips.password,
        server: ConfigPrivate.staticConfiguration.sips.ip,
        database: ConfigPrivate.staticConfiguration.sips.database,
        requestTimeout: 30000
    };

    const dni = paciente.documento;

    const query = `SELECT
    consulta.idConsulta AS id,
    convert(varchar(max),34043003) AS prestacion,
    efector.idEfector AS idEfector,
    consulta.fecha AS fecha,
    consultaODO.*,
    efector.codigoSisa AS sisa,
    pac.numeroDocumento AS pacienteDocumento, pac.nombre AS pacienteNombre, pac.apellido AS pacienteApellido,
    pac.fechaNacimiento AS pacienteFechaNacimiento,
    convert(varchar, nom.idNomenclador) +' - '+ nom.descripcion as texto,
    sex.nombre AS pacienteSexo,
    prof.numeroDocumento AS profesionalDocumento, prof.nombre AS profesionalNombre, prof.apellido AS profesionalApellido, prof.matricula AS profesionalMatricula

    FROM SYS_PACIENTE AS pac
    INNER JOIN SYS_SEXO AS sex ON sex.idSexo = pac.idSexo
    INNER JOIN CON_Consulta AS consulta ON consulta.idPaciente = pac.idPaciente
    INNER JOIN CON_CONSULTAODONTOLOGIA AS consultaODO ON consultaODO.idConsulta = consulta.idConsulta
    INNER JOIN ODO_NOMENCLADOR AS nom ON nom.idNomenclador = consultaODO.idNomenclador
    INNER JOIN SYS_PROFESIONAL AS prof ON consulta.idProfesional = prof.idProfesional
    INNER JOIN SYS_EFECTOR AS efector ON consulta.idEfector = efector.idEfector
    WHERE pac.numeroDocumento = '${dni}'`;

    return {
        connectionString,
        query
    };
}

export = make;
