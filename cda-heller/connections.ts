import * as mongoose from 'mongoose';
import * as configPrivate from './config.private';

export class Connections {
    static logs: mongoose.Connection;

    static initialize() {
        this.logs = mongoose.createConnection(configPrivate.logDatabase.log.host, configPrivate.logDatabase.log.options);
    }
}
