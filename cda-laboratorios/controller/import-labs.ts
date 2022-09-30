import { conSql } from '../config.private';
import * as moment from 'moment';
import * as sql from 'mssql';
import { Matching } from '@andes/match';
import * as operations from './operations';
import * as fs from 'fs';
import { InformeLAB } from '../utils/informes/informe-lab';
import { userScheduler } from '../config.private';
import { msCDALaboratoriosLog } from '../logger/msCDALaboratorios';
const log = msCDALaboratoriosLog.startTrace();

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
        sexo: pacLab.sexo === 'indeterminado' ? 'otro' : pacLab.sexo
    };
    const match = new Matching();
    return match.matchPersonas(pacElastic, pacDto, weights, 'Levenshtein');
}

export async function importarDatos(paciente) {
    try {
        const pool = await new sql.ConnectionPool(connection).connect();
        let laboratorios: any = await operations.getEncabezados(pool, paciente);

        // obtengo el paciente del SIPS central para realizar matching
        let pacienteSips = await operations.getPacienteSIPS(pool, paciente);
        const value = pacienteSips ? matchPaciente(paciente, pacienteSips) : 0;

        if (value >= cota && laboratorios?.recordset?.length) {
            for (const lab of laboratorios?.recordset) {
                try {

                    const details: any = await operations.getDetalles(pool, lab.idProtocolo, lab.idEfector);
                    const organizacion: any = await operations.organizacionBySisaCode(lab.efectorCodSisa);

                    let validado = true;
                    let hiv = false;

                    if (validado && details?.recordset) {
                        details.recordset.forEach(detail => {
                            validado = validado && (detail.profesional_val !== '');
                            hiv = hiv || /hiv|vih/i.test(detail.item);
                        });

                        const fecha = moment(lab.fecha, 'DD/MM/YYYY');

                        const profesional = {
                            nombre: lab.solicitante,
                            apellido: '-' // Nombre y Apellido viene junto en los registros de laboratorio de SQL
                        };

                        const resultados = await operations.getImpresionResultados(pool, lab.idProtocolo, lab.idEfector);
                        const informe = new InformeLAB(resultados.recordset[0], resultados.recordset, 'Laboratorio');
                        fs.readFile((await informe.informe() as string), async (err, data) => {

                            if (err) { return false; }

                            const file = 'data:application/pdf;base64,' + data.toString('base64');

                            const dto = {
                                id: lab.idProtocolo,
                                organizacion: organizacion._id,
                                fecha: fecha.toDate(),
                                tipoPrestacion: '4241000179101',
                                paciente,
                                confidencialidad: hiv ? 'R' : 'N',
                                profesional,
                                cie10: 'Z01.7',
                                file,
                                texto: 'Exámen de Laboratorio'
                            };

                            return await operations.postCDA(dto);
                        });

                    }
                } catch (e) {
                    await log.error('cda-laboratorios:import:laboratorios', { error: e, paciente }, e.message, userScheduler);
                }
            }
        } else {
            // si no matchea se guarda en logs
            if (pacienteSips && value < cota) {
                let pacienteAndes = {
                    id: paciente._id,
                    documento: paciente.documento,
                    estado: paciente.estado,
                    nombre: paciente.nombre,
                    apellido: paciente.apellido,
                    sexo: paciente.sexo,
                    genero: paciente.genero,
                    fechaNacimiento: paciente.fechaNacimiento
                };
                await log.info('cda-laboratorios:importarDatos:notMatching', { matching: value, pacienteAndes, pacienteSips }, userScheduler);
            }
        }
        pool.close();
        return true;
    } catch (e) {
        await log.error('cda-laboratorios:import:laboratorios', { error: e, paciente }, e.message, userScheduler);
        if (e && e.error === 'sips-pdf') {
            return false;
        }
        return true;
    }
}
