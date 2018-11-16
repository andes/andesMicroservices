export const ANDES_HOST = 'http://localhost:3002/api';
export const ANDES_KEY = '';


function getEnv(key, _default, type = 's') {
    if (!!process.env[key] === false) {
        return _default;
    }
    let value = process.env[key];
    switch (type) {
        case 'b':
            return value.toLowerCase() === 'true';
        case 'n':
            return parseInt(value, 10);
        default:
            return value;
    }
}

export const conSqlPecas = {
    auth: {
        user: 'user',
        password: 'password'
    },
    serverSql: {
        server: 'ip',
        database: 'database'
    },
    table: {
        pecasTable: 'dbo.table'
    },
    pool: {
        acquireTimeoutMillis: 15000
    }
};

export const logDatabase = {
    log: {
        host: getEnv('Logs', 'connectionsString'),
        options: {
            reconnectTries: Number.MAX_VALUE,
            reconnectInterval: 1500,
            useNewUrlParser: true
        }
    }
};

