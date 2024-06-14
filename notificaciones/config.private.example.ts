export const HOST = 'https://waapi.app/api/v1/instances/14333/client/action';

export const userScheduler = {
    user: {
        usuario: {
            nombre: 'Andes',
            apellido: 'Scheduler'
        },
        organizacion: {
            nombre: 'salud'
        }
    },
    ip: '0.0.0.0',
    connection: {
        localAddress: '0.0.0.0'
    }
};

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

export const logDatabase = {
    log: {
        host: getEnv('MONGO_LOG', `mongodb://localhost:27017/andesLogs`),
        options: {
            reconnectTries: Number.MAX_VALUE,
            reconnectInterval: 1500,
            useNewUrlParser: true
        }
    }
};