export const ANDES_HOST = 'http://localhost:3002/api';

export const ANDES_KEY = '';

export const SIP_PLUS = {
    username: getEnv('SIP_PLUS_USERNAME', ''),
    password: getEnv('SIP_PLUS_PASSWORD', ''),
    host: getEnv('SIP_PLUS_URL', 'https://sipplus.org'),
}

export const fakeRequest = {
    user: {
        usuario: 'sipPlus',
        app: 'integracion-sipPlus',
        organizacion: 'sss'
    },
    ip: '',
    connection: {
        localAddress: ''
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

export const MONGO_HOST = getEnv('MONGO_HOST', `mongodb://localhost:27017/andes`);

