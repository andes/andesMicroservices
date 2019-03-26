import { conSql, wsSalud } from '../config.private';
import * as moment from 'moment';
import * as sql from 'mssql';
import { Matching } from '@andes/match';
import * as operations from './operations';
import * as http from 'http';
import { log } from '@andes/log';

const cota = 0.95;

const fakeRequestSql = {
    user: {
        usuario: 'msHeller',
        app: 'integracion-heller',
        organizacion: 'sss'
    },
    ip: wsSalud.ipHeller,
    connection: {
        localAddress: ''
    }
};

const connection = {
    user: conSql.auth.user,
    password: conSql.auth.password,
    server: conSql.serverSql.server,
    database: conSql.serverSql.database,
    options: {
        encrypt: true
    }
};

function matchPaciente(pacMpi, pacLab) {
    const weights = {
        identity: 0.60,
        name: 0.05,
        gender: 0.3,
        birthDate: 0.05
    };

    const pacDto = {
        documento: pacMpi.documento ? pacMpi.documento.toString() : '',
        nombre: pacMpi.nombre ? pacMpi.nombre : '',
        apellido: pacMpi.apellido ? pacMpi.apellido : '',
        fechaNacimiento: pacMpi.fechaNacimiento ? moment(new Date(pacMpi.fechaNacimiento)).format('YYYY-MM-DD') : '',
        sexo: pacMpi.sexo ? pacMpi.sexo : ''
    };
    const pacElastic = {
        documento: pacLab.numeroDocumento ? pacLab.numeroDocumento.toString() : '',
        nombre: pacLab.nombre ? pacLab.nombre : '',
        apellido: pacLab.apellido ? pacLab.apellido : '',
        fechaNacimiento: pacLab.fechaNacimiento ? moment(pacLab.fechaNacimiento, 'DD/MM/YYYY').format('YYYY-MM-DD') : '',
        sexo: (pacLab.sexo === 'F' ? 'femenino' : (pacLab.sexo === 'M' ? 'masculino' : ''))
    };
    const match = new Matching();
    return match.matchPersonas(pacElastic, pacDto, weights, 'Levenshtein');
}


async function toBase64(response) {
    return new Promise((resolve, reject) => {
        let chunks: any = [];
        response.on('data', (chunk) => {
            chunks.push(chunk);
        });
        response.on('end', () => {
            const informe = Buffer.concat(chunks);
            const i = 'data:application/pdf;base64,' + informe.toString('base64');
            return resolve(i);
        });
        response.on('error', (err) => {
            return reject(err);
        });

    });
}

function donwloadFileHeller(idProtocolo, year) {
    return new Promise((resolve, reject) => {

        http.get(wsSalud.hellerWS + 'idPet=' + idProtocolo + '&year=' + year, (response) => {
            return response.on('data', (buffer) => {
                const resp = buffer.toString();

                const regexp = /10.1.104.37\/resultados_omg\/([0-9\s\-\_]*).pdf/;
                const match = resp.match(regexp);
                if (match && match[1]) {
                    http.get(wsSalud.hellerFS + match[1] + '.pdf', (responseH) => {
                        if (response.statusCode === 200) {
                            return resolve(responseH);
                        } else {
                            log(fakeRequestSql, 'microservices:laboratorio:heller', null, 'pdf no encontrado en heller', idProtocolo);
                            return reject({ error: 'sips-pdf', status: responseH.statusCode });
                        }
                    }).on('error', (e) => {
                        return reject(e);
                    });
                } else {
                    log(fakeRequestSql, 'microservices:laboratorio:heller', null, 'Protocolo no encontrado en heller', idProtocolo);
                    return reject({ error: 'Download file . heller-error' });
                }

            });
        });
    });
}


export async function importarDatos(paciente) {
    try {
        const pool = await new sql.ConnectionPool(connection).connect();
        let laboratorios: any = await operations.getEncabezados(pool, paciente.documento);
        for (const lab of laboratorios.recordset) {
            try {
                const details: any = await operations.getDetalles(pool, lab.idProtocolo, lab.idEfector);
                const organizacion: any = await operations.organizacionBySisaCode(lab.efectorCodSisa);

                let validado = true;
                let hiv = false;

                details.recordset.forEach(detail => {
                    validado = validado && (detail.profesional_val !== '');
                    hiv = hiv || /hiv|vih/i.test(detail.item);
                });

                const value = matchPaciente(paciente, lab);
                if (value >= cota && validado && details.recordset) {
                    const fecha = moment(lab.fecha, 'DD/MM/YYYY');

                    const profesional = {
                        nombre: lab.solicitante,
                        apellido: '-' // Nombre y Apellido viene junto en los registros de laboratorio de SQL
                    };

                    let response;

                    if (String(lab.idEfector) === '221') {
                        try {
                            response = await donwloadFileHeller(lab.idProtocolo, fecha.format('YYYY'));
                            let adjunto64 = await toBase64(response);
                            const dto = {
                                id: lab.idProtocolo,
                                organizacion: organizacion._id,
                                fecha: fecha.toDate(),
                                tipoPrestacion: '4241000179101',
                                paciente,
                                confidencialidad: hiv ? 'R' : 'N',
                                profesional,
                                cie10: 'Z01.7',
                                file: adjunto64,
                                texto: 'Exámen de Laboratorio'
                            };

                            await operations.postCDA(dto);
                            log(fakeRequestSql, 'microservices:laboratorio:heller', paciente.id, 'envio de cda laboratorios con exito', dto);
                        } catch (error) {
                            log(fakeRequestSql, 'microservices:laboratorio:heller', paciente.id, 'Macheo el paciente pero hubo error en la descarga del archivo o en pasar a base64', { paciente, idProtocolo: lab.idProtocolo, error });
                        }
                    }
                } else {
                    // Ver que hacer si no matchea TODO
                    if (value < cota) {
                        const dataLog = {
                            pacienteEnviado: paciente,
                            pacienteLabo: {
                                nombre: lab.nombre,
                                apellido: lab.apellido,
                                documento: lab.numeroDocumento,
                                sexo: lab.sexo,
                                fechaNacimiento: lab.fechaNacimiento
                            },
                            idProtocolo: lab.idProtocolo
                        };
                        log(fakeRequestSql, 'microservices:laboratorio:heller', paciente.id, 'Error en el macheo de paciente', dataLog, null);
                    }

                }
            } catch (e) {
                log(fakeRequestSql, 'microservices:laboratorio:heller', paciente.id, 'Error en obtener detalles o sisa', { error: e });
            }
        }
        pool.close();
        return true;
    } catch (e) {
        log(fakeRequestSql, 'microservices:laboratorio:heller', paciente.id, 'Error en importar datos', { error: e });
        if (e && e.error === 'sips-pdf') {
            return false;
        }
        return true;
    }
}
