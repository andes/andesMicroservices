import { logDatabase } from '../config.private';
import { Logger } from '@andes/log';
import * as mongoose from 'mongoose';

let logs: mongoose.Connection = mongoose.createConnection();
logs = mongoose.createConnection(logDatabase.log.host, logDatabase.log.options);
export const msCDALaboratoriosLog = new Logger({
    connection: logs,
    type: 'cda-laboratorio-central',
    module: 'msCDALaboratorioCentral',
    application: 'andes',
    bucketBy: 'h',
    bucketSize: 100
});