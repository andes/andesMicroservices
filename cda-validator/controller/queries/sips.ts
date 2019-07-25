import * as ConfigPrivate from './../../config.private';
import { log } from '@andes/log';
let fakeRequest = {
    user: {
        usuario: ConfigPrivate.staticConfiguration.sips.user,
        app: 'rup:prestacion:create',
        organizacion: 'sss'
    },
    ip: ConfigPrivate.staticConfiguration.sips.ip,
    connection: {
        localAddress: ''
    }
};
async function make(paciente: any) {
    const connectionString = {
        user: ConfigPrivate.staticConfiguration.sips.user,
        password: ConfigPrivate.staticConfiguration.sips.password,
        server: ConfigPrivate.staticConfiguration.sips.ip,
        database: ConfigPrivate.staticConfiguration.sips.database,
        requestTimeout: 30000
    };
    let query = '';
    try {

        const dni = paciente.documento;
        query =
            `select
                consulta.idConsulta as id,
                convert(varchar(max),391000013108) as prestacion,
                efector.idEfector as idEfector,
                consulta.fecha as fecha,
                efector.codigoSisa as sisa,
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
                where pac.numeroDocumento = '${dni}'`;

        return {
            connectionString,
            query
        };
    } catch (ex) {
        await log(fakeRequest, 'microservices:integration:cda-validator', paciente.id, 'make:sips:error', null, { documento: paciente.documento, query }, ex);
        throw ex;
    }
}

export = make;
