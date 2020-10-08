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


export const DOMINIO = getEnv('IPS_DOMINIO', 'https://app.andes.gob.ar');
export const HOST = getEnv('IPS_HOST', 'https://testapp.hospitalitaliano.org.ar');
export const SECRET = getEnv('JWT_SECRET', 'federar');
export const NAME = getEnv('IPS_NAME', 'Andes');
export const ROLE = getEnv('IPS_ROLE', 'federador');
export const IDENT = getEnv('IPS_IDENT', '1');
export const SUB = getEnv('IPS_SUB', 'Ministerio de Salud example');
export const PAYLOAD = {
    name: NAME,
    role: ROLE,
    ident: IDENT,
    sub: SUB
};
