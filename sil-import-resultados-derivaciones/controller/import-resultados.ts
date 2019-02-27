import { conSql } from '../config.private';
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
                return reject({ error: 'sips-pdf', status: response.statusCode });
            }
        }).on('error', (e) => {
            // tslint:disable-next-line:no-console
            console.error(`No se pudo descarga el pdf: ${e.message}`);
            return reject(e);
        });

    });
}
