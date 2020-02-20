function getEnv(key, _default, type = 's') {
    if (!!process.env[key] === false) {
        return _default;
    }
    const value = process.env[key];
    switch (type) {
        case 'b':
            return value.toLowerCase() === 'true';
        case 'n':
            return parseInt(value, 10);
        default:
            return value;
    }
}

// Queda pendiente
export const VERSION = getEnv('ASYMMETRIK_FHIR_VERSION', '4_0_0');
export const DOMAIN = getEnv('DOMINIO', 'andes.gob.ar');
export const ROUTE = getEnv('ASYMMETRIK_SERVER_ROUTE', 'http://localhost:3000/');
export const HOST = getEnv('ASYMMETRIK_HOST', ROUTE + VERSION);
export const SECRET = getEnv('JWT_SECRET', '');
