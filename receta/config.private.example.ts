export const MONGO_HOST = '';

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

function getEnv(key: string, _default: any, type = 's') {
    if (!!process.env[key] === false) {
        return _default;
    }
    const value = process.env[key];
    switch (type) {
        case 'b': return value.toLowerCase() === 'true';
        case 'n': return parseInt(value, 10);
        default: return value;
    }
}

export const logDatabase = {
    log: {
        host: getEnv('MONGO_LOG', ``),
        options: {
            reconnectTries: Number.MAX_VALUE,
            reconnectInterval: 1500,
            useNewUrlParser: true
        }
    }
};

// Endpoints de sifaho y recetar para consultar estado de dispensa.
export const sistemasExternos: Record<string, { url: string; token?: string; rejectUnauthorized?: boolean }> = {
    sifaho: {
        url: getEnv('SIFAHO_RECETA_URL', ''),
        token: getEnv('SIFAHO_TOKEN', ''),
        rejectUnauthorized: getEnv('SIFAHO_SSL_VERIFY', true, 'b')
    },
    recetar: {
        url: getEnv('RECETAR_RECETA_URL', ''),
        token: getEnv('RECETAR_TOKEN', ''),
        rejectUnauthorized: getEnv('RECETAR_SSL_VERIFY', true, 'b')
    }
};