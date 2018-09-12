import { conSql, wsSalud } from '../config.private';
import * as moment from 'moment';
import * as sql from 'mssql';
import { Matching } from '@andes/match';
import * as operations from './operations';

import * as http from 'http';

const cota = 0.95;

const connection = {
    user: conSql.auth.user,
    password: conSql.auth.password,
    server: conSql.serverSql.server,
    database: conSql.serverSql.database,
    options: {
        encrypt: true // Use this if you're on Windows Azure
    }
};

sql.connect(connection, (err) => {
    // logger('MSSSQL connection error');
});

function matchPaciente(pacMpi, pacLab) {
    const weights = {
        identity: 0.55,
        name: 0.10,
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

function downloadFile(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (response) => {
            if (response.statusCode === 200) {
                return resolve(response);
            } else {
                return reject({error: 'sips-pdf', status: response.statusCode});
            }
        });
    });
}

function donwloadFileHeller(idProtocolo, year) {
    return new Promise((resolve, reject) => {
        http.get(wsSalud.hellerWS + 'idPet=' + idProtocolo + '&year='  + year, (response) => {
            return response.on('data', (buffer) => {
                const resp = buffer.toString();

                const regexp = /10.1.104.37\/resultados_omg\/([0-9\-\_]*).pdf/;
                const match = resp.match(regexp);
                if (match && match[1]) {
                    return downloadFile(wsSalud.hellerFS + match[1] + '.pdf').then((_resp) => {
                        return resolve(_resp);
                    }).catch(reject);
                } else {
                    return reject({error: 'heller-error'});
                }
            });
        });
    });
}

export async function importarDatos(paciente) {
    try {
        let laboratorios: any = await operations.getEncabezados(paciente.documento);
        for (const lab of laboratorios.recordset) {

            const details: any = await operations.getDetalles(lab.idProtocolo, lab.idEfector);
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

                let pdfUrl;
                let response;
                if (String(lab.idEfector) === '221') {
                    response = await donwloadFileHeller(lab.idProtocolo, fecha.format('YYYY'));
                } else {
                    pdfUrl = wsSalud.host + wsSalud.getResultado + '?idProtocolo=' + lab.idProtocolo + '&idEfector=' + lab.idEfector;
                    response = await downloadFile(pdfUrl);
                }
                let adjunto64 = await toBase64(response);

                const dto = {
                    id: lab.idProtocolo,
                    organizacion: organizacion._id,
                    fecha: fecha.toDate(),
                    tipoPrestacion: '4241000179101',
                    paciente,
                    profesional,
                    cie10: 'Z01.7',
                    file: adjunto64,
                    texto: 'Exámen de Laboratorio'
                };

                await operations.postCDA(dto);

            } else {
                // Ver que hacer si no matchea
                if (value < cota) {
                    // logger('-----------------------------------');
                    // logger(paciente.nombre, lab.nombre);
                    // logger(paciente.apellido, lab.apellido);
                    // logger(paciente.documento, lab.numeroDocumento);
                    // logger(paciente.sexo, lab.sexo);
                    // logger(paciente.fechaNacimiento, lab.fechaNacimiento);
                }

            }
        }
        return true;
    } catch (e) {
        // logger('Error', e);
        if (e && e.error === 'sips-pdf') {
            return false;
        }
        return true;
    }
}
