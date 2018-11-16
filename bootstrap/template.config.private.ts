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
        host: getEnv('Logs', 'connectionsString'),
        options: {
            reconnectTries: Number.MAX_VALUE,
            reconnectInterval: 1500,
        }
    }
};

