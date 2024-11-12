import { logDatabase } from '../config.private';
import { Logger } from '@andes/log';
import * as mongoose from 'mongoose';

let logs: mongoose.Connection = mongoose.createConnection();
logs = mongoose.createConnection(logDatabase.log.host, logDatabase.log.options);

export const msCDAValidatorLog = new Logger({
    connection: logs,
    type: 'guardia',
    module: 'msCDAGuardias',
    application: 'andes',
    bucketBy: 'h',
    bucketSize: 100,
    expiredAt: '1 M'
});
