import * as ConfigPrivate from './../../config.private';
let sql = require('mssql');

export class Queries {
    public query;
    public connectionString;
    public data;
    private dni: number;

    public hpn(paciente: any) {
        // Conexión a la base de datos
        this.connectionString = {
            user: ConfigPrivate.staticConfiguration.hpn.user,
            password: ConfigPrivate.staticConfiguration.hpn.password,
            server: ConfigPrivate.staticConfiguration.hpn.ip,
            database: ConfigPrivate.staticConfiguration.hpn.database,
            requestTimeout: 20000
        };
        console.log("Paciente: ", paciente.paciente.documento);
        this.dni = paciente.paciente.documento;

        this.query = `
        select
        -- Id
        ('P-' + CONVERT(varchar(max), Prestaciones.id)) as id,
        -- SNOMED
        convert(varchar,391000013108) as prestacion,
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
        -- Profesional
        Medicos.documento as profesionalDocumento,
        Medicos.nombre as profesionalNombre,
        Medicos.apellido as profesionalApellido,
        Medicos.matriculaProvincial as profesionalMatricula,
        url = 'http://172.16.1.18/dotnet/ws/services/webservice.asmx/Informe?idEstudio=P-' + CONVERT(varchar(max), Prestaciones.id)
        -- Tablas
        FROM Prestaciones
		INNER JOIN Prestaciones_Tipos ON idTipo = Prestaciones_Tipos.id
        INNER JOIN Pacientes ON Prestaciones.idPaciente = Pacientes.id
        INNER JOIN Medicos ON Medicos.id = (SELECT TOP 1 idProfesional FROM Prestaciones_InformeProfesionales WHERE Prestaciones_InformeProfesionales.idPrestacion = Prestaciones.id)
        INNER JOIN Sexos on Sexos.id = Pacientes.idSexo
		WHERE (SELECT TOP 1 idEstado FROM Prestaciones_HistorialEstados WHERE Prestaciones_HistorialEstados.idPrestacion = Prestaciones.id ORDER BY Prestaciones_HistorialEstados.fechaHora DESC) = 100
		and pacientes.documento = '` + this.dni + `'`;

        return this.data = {
            connectionString: this.connectionString,
            query: this.query
        };
    }

    public heller(paciente: any) {
        this.connectionString = {
            user: ConfigPrivate.staticConfiguration.heller.user,
            password: ConfigPrivate.staticConfiguration.heller.password,
            server: ConfigPrivate.staticConfiguration.heller.ip,
            database: ConfigPrivate.staticConfiguration.heller.database,
            options: {
                tdsVersion: '7_1'
            }
        };

        this.dni = paciente.paciente.documento;

        this.query = `select
                                    replace(CNS_TipoConsultorio.Descripcion,' ','') + '-' + rtrim(CNS_Recepcion.Id_recepcion) as id,
                                    convert(varchar,391000013108) as prestacion,
                                        999 as idEfector,
                                    CNS_Recepcion.Fecha as fecha,
                                    CNS_Recepcion.DNI AS pacienteDocumento,
                                        Pacientes.NOMBRES AS pacienteNombre,
                                    Pacientes.APELLIDOS AS pacienteApellido,
                                    Pacientes.[Fecha de Nacimiento] AS pacienteFechaNacimiento,
                                    Pacientes.Sexo AS pacienteSexo,
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
                                    CIE.cod_sss as cie10,
                                    CONVERT(text, CNS_Informes.Informe) AS texto
                                    FROM CNS_Recepcion
                                    inner join  Pacientes on CNS_Recepcion.DNI = Pacientes.[Número de Documento]
                                    inner JOIN CNS_Consultorios ON CNS_Recepcion.Id_Consultorio= CNS_Consultorios.Id_Consultorio
                                    INNER JOIN CNS_TipoConsultorio ON CNS_Consultorios.Id_TipoCNS = CNS_TipoConsultorio.Id_TipoCNS
                                    inner JOIN Profesionales ON CNS_Recepcion.CodigoProf = Profesionales.Código
                                    inner JOIN  CNS_Informes on CNS_Recepcion.Id_Informe= CNS_Informes.Id_Informe
                                    inner JOIN CNS_Informes_MDC ON CNS_Recepcion.Id_Informe = CNS_Informes_MDC.Id_Informe
                                    inner JOIN CIE ON CNS_Informes_MDC.CodigoCIE10 = CIE.Id
                                    where Pacientes.[Número de Documento]!=99 and
                                        (Pacientes.[Número de Documento]<88000000 or Pacientes.[Número de Documento]>89000000)
                                        and Atendido =1
                                        and CodigoProf not in (1019159,1019158,1019157,1019054)/*se excluye cns enfermeria*/
                                        and CNS_Recepcion.Id_Consultorio not in (76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,98,99) -- no odontologias
                                        and CNS_Informes_MDC.Ppal=1
                                        and CNS_Informes_MDC.CodigoCIE10 <>''
                                        and Pacientes.[Número de Documento] = '` + this.dni + `'
                                    ORDER BY CNS_Recepcion.Fecha `;

        return this.data = {
            connectionString: this.connectionString,
            query: this.query
        };
    }

    public sips(paciente: any) {
        this.connectionString = {
            user: ConfigPrivate.staticConfiguration.sips.user,
            password: ConfigPrivate.staticConfiguration.sips.password,
            server: ConfigPrivate.staticConfiguration.sips.ip,
            database: ConfigPrivate.staticConfiguration.sips.database,
        };

        this.dni = paciente.paciente.documento;

        this.query =
            `select
                    consulta.idConsulta as id,
                    convert(varchar(max),391000013108) as prestacion,
                    efector.idEfector as idEfector,
                    consulta.fecha as fecha,
                    pac.numeroDocumento as pacienteDocumento, pac.nombre as pacienteNombre, pac.apellido as pacienteApellido,
                    pac.fechaNacimiento as pacienteFechaNacimiento, sex.nombre as pacienteSexo,
                    prof.numeroDocumento as profesionalDocumento, prof.nombre as profesionalNombre, prof.apellido as profesionalApellido, prof.matricula as profesionalMatricula,
                    cie.CODIGO as cie10, consulta.informeConsulta as texto
                    from Sys_Paciente as pac
                    inner join sys_sexo as sex on sex.idSexo = pac.idSexo
                    inner join CON_Consulta as consulta on consulta.idPaciente = pac.idPaciente
                    inner join CON_ConsultaDiagnostico as consultaD on consultaD.idConsulta = consulta.idConsulta
                    inner join Sys_CIE10 as cie on consultaD.CODCIE10 = cie.ID
                    inner join Sys_Profesional as prof on consulta.idProfesional = prof.idProfesional
                    inner join Sys_Efector as efector on consulta.idEfector = efector.idEfector
                    where NOT EXISTS (SELECT * FROM AndesCDA WHERE idPrestacion = consulta.idConsulta)
                    AND NOT EXISTS (SELECT * FROM AndesCDARejected where idPrestacion = consulta.idConsulta)
                    and pac.numeroDocumento = '` + this.dni + `'`;

        return this.data = {
            connectionString: this.connectionString,
            query: this.query
        };
    }

    public getData(query, pool): any {
        return new Promise(async (resolve, reject) => {
            pool.request().query(query, function (err, recordSet) {
                if (err) {
                    reject(err);
                }
                console.log('La query a ejecutar: ', query);
                resolve(recordSet);
            });
        });
    }
}