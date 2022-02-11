
import { logDatabase } from '../config.private';
import { Logger } from '@andes/log';
import * as mongoose from 'mongoose';

let logs: mongoose.Connection = mongoose.createConnection();

logs = mongoose.createConnection(logDatabase.log.host, logDatabase.log.options);

export const msCDANomivacLog = new Logger({
    connection: logs,
    type: 'CDANomivac',
    module: 'msCDANomivac',
    application: 'andes',
    bucketBy: 'h',
    bucketSize: 100
}); 