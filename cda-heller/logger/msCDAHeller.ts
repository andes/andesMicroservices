import { logDatabase } from '../config.private';
import { Logger } from '@andes/log';
import * as mongoose from 'mongoose';

let logs: mongoose.Connection = mongoose.createConnection();
logs = mongoose.createConnection(logDatabase.log.host, logDatabase.log.options);
export const msCDAHellerLog = new Logger({
    connection: logs,
    type: 'cda-heller',
    module: 'msCDAHeller',
    application: 'andes',
    bucketBy: 'h',
    bucketSize: 100
});