import { logDatabase } from '../config.private';
import { Logger } from '@andes/log';
import * as mongoose from 'mongoose';

let logs: mongoose.Connection = mongoose.createConnection();
logs = mongoose.createConnection(logDatabase.log.host, logDatabase.log.options);
export const msProfesionalSISA = new Logger({
    connection: logs,
    type: 'profesional-sisa',
    module: 'msProfesionalSISA',
    application: 'andes',
    bucketBy: 'h',
    bucketSize: 100
});