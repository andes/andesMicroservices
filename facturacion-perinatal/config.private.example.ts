export const ANDES_HOST = 'http://localhost:3002/api';
export const ANDES_KEY = '';
export const fakeRequest = {
    user: {
        usuario: 'facturacion-perinatal',
        app: 'integracion-facturacion-perinatal',
        organizacion: 'sss'
    },
    ip: '',
    connection: {
        localAddress: ''
    }
};
export const conSql = {
    auth: {
        user: 'prueba',
        password: 'prueba'
    },
    serverSql: {
        server: '127.0.0.1',
        database: 'integracion'
    },
    pool: {
        acquire0TimeoutMillis: 15000
    }
};
export const connectionString = {
    user: conSql.auth.user,
    password: conSql.auth.password,
    server: conSql.serverSql.server,
    database: conSql.serverSql.database,
    connectionTimeout: 10000,
    requestTimeout: 45000,
    options: { enableArithAbort: true }
};

export const logDatabase = {
    log: {
        host: process.env.MONGO_LOG || `mongodb://localhost:27017/andesLogs`,
        options: {
            reconnectTries: Number.MAX_VALUE,
            reconnectInterval: 1500,
            useNewUrlParser: true
        }
    }
}
