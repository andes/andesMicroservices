import * as ConfigPrivate from './../../config.private';

function make(paciente: any) {
    // Conexión a la base de datos
    const connectionString = {
        user: ConfigPrivate.staticConfiguration.hpn.user,
        password: ConfigPrivate.staticConfiguration.hpn.password,
        server: ConfigPrivate.staticConfiguration.hpn.ip,
        database: ConfigPrivate.staticConfiguration.hpn.database,
        requestTimeout: 20000,
        webservice_host: ConfigPrivate.staticConfiguration.hpn.webservice_host
    };
    const dni = paciente.documento;

    const query = `
    select
    -- Id
    ('P-' + CONVERT(varchar(max), Prestaciones.id)) as id,
    -- SNOMED
    -- convert(varchar,391000013108) as prestacion,
    Prestaciones_Tipos.SNOMED as prestacion,
    -- ID Efector HPN/Heller
    205 as idEfector,
    -- Fecha prestacion
    Prestaciones.fechaHora as fecha,
    -- Paciente
    Pacientes.documento as pacienteDocumento,
    Pacientes.nombre as pacienteNombre,
    Pacientes.apellido as pacienteApellido,
    Pacientes.nacimientoFecha as pacienteFechaNacimiento,
    Sexos.nombre as pacienteSexo,
    '10580352167033' as sisa,
    -- Profesional
    Medicos.documento as profesionalDocumento,
    Medicos.nombre as profesionalNombre,
    Medicos.apellido as profesionalApellido,
    Medicos.matriculaProvincial as profesionalMatricula,
    url = 'http://${connectionString.webservice_host}/dotnet/ws/services/webservice.asmx/Informe?idEstudio=P-' + CONVERT(varchar(max), Prestaciones.id),
    (case when idTipo = 705 or idTipo = 901 then (SELECT dbo.hsp_Prestaciones_RegistroConsultorio_CDA(Prestaciones.id)) else null end) as informeHtml,
    idTipo as PrestacionTipo
    -- Tablas
    FROM Prestaciones
    INNER JOIN Prestaciones_Tipos ON idTipo = Prestaciones_Tipos.id
    INNER JOIN Pacientes ON Prestaciones.idPaciente = Pacientes.id
    INNER JOIN Medicos ON Medicos.id = (SELECT TOP 1 idProfesional FROM Prestaciones_InformeProfesionales WHERE Prestaciones_InformeProfesionales.idPrestacion = Prestaciones.id)
    INNER JOIN Sexos on Sexos.id = Pacientes.idSexo
    WHERE (SELECT TOP 1 idEstado FROM Prestaciones_HistorialEstados WHERE Prestaciones_HistorialEstados.idPrestacion = Prestaciones.id ORDER BY Prestaciones_HistorialEstados.fechaHora DESC) = 100
    and pacientes.documento = '${dni}'`;


    return {
        connectionString,
        query
    };
}

export = make;
