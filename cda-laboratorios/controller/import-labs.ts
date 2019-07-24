import { conSql, wsSalud } from '../config.private';
import * as moment from 'moment';
import * as sql from 'mssql';
import { Matching } from '@andes/match';
import * as operations from './operations';
import * as http from 'http';
import { log } from '@andes/log';
let fakeRequest = {
    user: {
        usuario: conSql.auth.user,
        app: 'rup:prestacion:create',
        organizacion: 'sss'
    },
    ip: conSql.serverSql.server,
    connection: {
        localAddress: ''
    }
};
const cota = 0.95;

const connection = {
    user: conSql.auth.user,
    password: conSql.auth.password,
    server: conSql.serverSql.server,
    database: conSql.serverSql.database,
    options: {
        encrypt: true
    }
};

async function matchPaciente(pacMpi, pacLab) {
    try {
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
        let macheo = match.matchPersonas(pacElastic, pacDto, weights, 'Levenshtein');
        if (!macheo) {
            await log(fakeRequest, 'microservices:integration:cda-laboratorio', null, 'matchPaciente:No macheo', null, { pacienteElastic: pacElastic, pacienteDTO: pacDto }, null);
        }
        return macheo;
    } catch (e) {
        await log(fakeRequest, 'microservices:integration:cda-laboratorio', null, 'matchPaciente:error', null, { pacienteElastic: pacLab, pacienteDTO: pacMpi }, e);
    }

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
        response.on('error', async (err) => {
            await log(fakeRequest, 'microservices:integration:cda-laboratorio', null, 'toBase64:error', null, null, err);

            return reject(err);
        });

    });
}

function downloadFile(url) {
    return new Promise((resolve, reject) => {

        http.get(url, async (response) => {
            if (response.statusCode === 200) {
                return resolve(response);
            } else {
                await log(fakeRequest, 'microservices:integration:cda-laboratorio', null, 'downloadFile:errorElse', null, url, response);
                return reject({ error: 'sips-pdf', status: response.statusCode });
            }
        }).on('error', async (e) => {
            // tslint:disable-next-line:no-console
            await log(fakeRequest, 'microservices:integration:cda-laboratorio', null, 'downloadFile:error', null, url, e);

            console.error(`No se pudo descarga el pdf: ${e.message}`);
            return reject(e);
        });

    });
}

function donwloadFileHeller(idProtocolo, year) {
    return new Promise((resolve, reject) => {

        http.get(wsSalud.hellerWS + 'idPet=' + idProtocolo + '&year=' + year, (response) => {
            return response.on('data', async (buffer) => {
                const resp = buffer.toString();

                const regexp = /10.1.104.37\/resultados_omg\/([0-9\s\-\_]*).pdf/;
                const match = resp.match(regexp);
                if (match && match[1]) {
                    return downloadFile(wsSalud.hellerFS + match[1] + '.pdf').then((_resp) => {
                        return resolve(_resp);
                    }).catch(reject);
                } else {
                    await log(fakeRequest, 'microservices:integration:cda-laboratorio', null, 'donwloadFileHeller:error', idProtocolo, match, null);
                    return reject({ error: 'heller-error' });
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

                const value = await matchPaciente(paciente, lab);
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
                        confidencialidad: hiv ? 'R' : 'N',
                        profesional,
                        cie10: 'Z01.7',
                        file: adjunto64,
                        texto: 'Exámen de Laboratorio'
                    };
                    await operations.postCDA(dto);

                } else {
                    // Si la firma electronica del profesional no esta en los resultados no valida.
                    await log(fakeRequest, 'microservices:integration:cda-laboratorio', paciente.id, 'importarDatos:error:Validacion', null, { cota: value >= cota, validado, documento: paciente.documento }, null);


                    // Ver que hacer si no matchea TODO
                    if (value < cota) {
                        // logger('-----------------------------------');
                        // logger(paciente.nombre, lab.nombre);
                        // logger(paciente.apellido, lab.apellido);
                        // logger(paciente.documento, lab.numeroDocumento);
                        // logger(paciente.sexo, lab.sexo);
                        // logger(paciente.fechaNacimiento, lab.fechaNacimiento);
                    }

                }
            } catch (e) {
                await log(fakeRequest, 'microservices:integration:cda-laboratorio', paciente.id, 'importarDatos:error:2catch', null, { documento: paciente.documento }, e);

                console.error(`Erro en download files: ${e.message}`);
                // No va return porque sigue con el proximo laboratorio dentro del for
                // return false;
            }
        }
        pool.close();
        return true;
    } catch (e) {
        await log(fakeRequest, 'microservices:integration:cda-laboratorio', paciente.id, 'importarDatos:error:1catch', null, { documento: paciente.documento }, e);

        // logger('Error', e);
        if (e && e.error === 'sips-pdf') {
            return false;
        }
        return true;
    }
}
