import * as config from '../../config.private';

export function make(pacientes, fechaTope) {
    const connectionString = {
        user: config.conSql.auth.user,
        password: config.conSql.auth.password,
        server: config.conSql.serverSql.server,
        database: config.conSql.serverSql.database,
        options: {
            encrypt: true
        }
    };
    const codigoLAMP = '9063'
    let documentos = '(';
    pacientes.forEach(p => documentos+=`${p},` );
    documentos = documentos.replace(/.$/,") ")

    const query = `select paciente.numeroDocumento as documento, detalle.resultadoCar as resultado
                from LAB_Protocolo as protocolo
                inner join LAB_DetalleProtocolo as detalle on detalle.idProtocolo = protocolo.idProtocolo
                inner join Sys_Paciente as paciente on paciente.idPaciente = protocolo.idPaciente
                inner join LAB_Item as item on item.idItem = detalle.idSubItem
                where item.codigo = '${codigoLAMP}'
                and paciente.numeroDocumento IN ${documentos}
                and protocolo.fecha > ${fechaTope}
                and protocolo.fecha = (select max(p.fecha) from LAB_Protocolo as p where p.idPaciente = paciente.idPaciente)
                order by numeroDocumento, protocolo.fecha desc`;

    return {
        connectionString,
        query
    };

}