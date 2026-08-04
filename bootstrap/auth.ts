import * as passport from 'passport';
import * as passportJWT from 'passport-jwt';
import * as jwt from 'jsonwebtoken';
import * as express from 'express';
import * as mongoose from 'mongoose';
import { AndesCache } from '@andes/core';

const shiroTrie = require('shiro-trie');

export const jwtKey = process.env.JWT_KEY || '';

// -------------------------
// Cache — mismo patrón que RedisWebSockets del monolito
// Completar con los valores reales
// -------------------------

function getEnv(key: string, _default: any, type = 's') {
    if (!process.env[key]) return _default;
    const value = process.env[key];
    switch (type) {
        case 'b': return value.toLowerCase() === 'true';
        case 'n': return parseInt(value, 10);
        default: return value;
    }
}

export const RedisConfig = {
    active: getEnv('REDIS', true, 'b'),
    host: getEnv('REDIS_HOST', ''),   // ← completar con IP real de Redis
    port: getEnv('REDIS_PORT', 6379, 'n')
};

const cache = RedisConfig.active && RedisConfig.host
    ? new AndesCache({ adapter: 'redis', host: RedisConfig.host, port: RedisConfig.port })
    : new AndesCache({ adapter: 'memory' });

// -------------------------
// Extrae el token raw al req.token — necesario para la clave de Redis
// -------------------------

function extractTokenMiddleware(req: any, res: any, next: any) {
    if (req.headers?.authorization) {
        req.token = req.headers.authorization.substring(4);
    } else if (req.query?.token) {
        req.token = req.query.token;
    }
    next();
}

// -------------------------
// Recupera permisos para user-token-2 desde Redis o BD
// Replica recovertPayloadMiddleware del monolito
// -------------------------

async function recoverPayloadMiddleware(req: any, res: any, next: any) {
    if (req.user?.type === 'user-token-2' && req.user.organizacion) {
        try {
            // Intentar Redis primero — si falla, ir directo a BD
            let cached = null;
            try {
                cached = await cache.get(req.token);
            } catch (redisErr: any) {
                console.warn('[recoverPayload] Redis no disponible, consultando BD:', redisErr.message);
            }

            if (cached) {
                req.user.permisos = cached.permisos;
                return next();
            }

            // Consultar BD usando colección directa — evita conflictos de tipos con el schema
            const col = mongoose.connection.db.collection('authUsers');
            const usuarioSolo: any = await col.findOne({ usuario: Number(req.user.usuario) });

            if (!usuarioSolo) {
                return res.status(403).json({ message: 'Usuario no encontrado' });
            }

            const authOrg = usuarioSolo.organizaciones.find(
                (o: any) => String(o._id) === String(req.user.organizacion)
            );

            if (!authOrg) {
                return res.status(403).json({ message: 'Organización no encontrada' });
            }

            req.user.permisos = [
                ...(usuarioSolo.permisosGlobales || []),
                ...(authOrg.permisos || [])
            ];

            return next();

        } catch (err: any) {
            console.error('[recoverPayload] Error:', err.message);
            return res.status(500).json({ message: 'No se pudieron verificar los permisos del usuario' });
        }
    }
    next();
}

// -------------------------
// Cache de permisos por microservicio — evita consultar la BD en cada request
// -------------------------

const CACHE_KEY_PREFIX = 'ms-permisos:';
const CACHE_TTL = 60 * 60; // 1 hora

async function getPermisosFromCache(key: string): Promise<string[] | null> {
    try {
        const cached = await cache.get(CACHE_KEY_PREFIX + key);
        return cached ? cached.permisos : null;
    } catch {
        return null;
    }
}

async function setPermisosInCache(key: string, permisos: string[]) {
    try {
        await cache.set(CACHE_KEY_PREFIX + key, { permisos }, CACHE_TTL);
    } catch {
        // Si falla el cache no es crítico
    }
}

async function getPermisosFromDB(key: string): Promise<string[] | null> {
    try {
        const col = mongoose.connection.db.collection('microserviciosPermisos');
        const doc: any = await col.findOne({ key });
        return doc ? doc.permisos : null;
    } catch {
        return null;
    }
}

// -------------------------
// Inicialización de passport
// -------------------------

export function initialize(app: express.Express) {
    passport.use(new passportJWT.Strategy(
        {
            secretOrKey: jwtKey,
            jwtFromRequest: passportJWT.ExtractJwt.fromExtractors([
                passportJWT.ExtractJwt.fromAuthHeaderWithScheme('jwt'),
                passportJWT.ExtractJwt.fromUrlQueryParameter('token')
            ])
        },
        (jwt_payload, done) => {
            done(null, jwt_payload);
        }
    ));
    app.use(passport.initialize());
}

export const Middleware = {
    // authenticate({ recoverPayload: true }) para cargar permisos de user-token-2
    authenticate(options: { recoverPayload?: boolean } = {}) {
        const middlewares: any[] = [
            passport.authenticate('jwt', { session: false }),
            extractTokenMiddleware
        ];
        if (options.recoverPayload) {
            middlewares.push(recoverPayloadMiddleware);
        }
        return middlewares;
    },

    // authorize(['recetas:read', 'huds:visualizacionParcialHuds:receta'])
    // Usa shiro-trie igual que el monolito — soporta wildcards jerárquicos
    // Los app-token verifican sus permisos embebidos contra los permisos requeridos
    authorize(permisosRequeridos: string[]) {
        return (req: any, res: any, next: any) => {
            const permisosUsuario = req.user?.permisos || [];
            const esAppToken = req.user?.type === 'app-token';

            const shiro = shiroTrie.new();
            shiro.add(permisosUsuario);

            const tienePermiso = permisosRequeridos.some(p => shiro.check(p));

            if (tienePermiso) return next();

            const mensaje = esAppToken
                ? 'App sin permisos para realizar esta acción'
                : 'No tiene permisos para realizar esta acción';

            return res.status(403).json({ message: mensaje });
        };
    },

    // authorizeByKey('ms-recetas')
    // Para user-token-2: busca permisos requeridos en microserviciosPermisos por key
    // Para app-token: busca por req.user.app.nombre que coincide con el campo key en la colección
    // Cachea el resultado en Redis por 1 hora
    authorizeByKey(key: string) {
        return async (req: any, res: any, next: any) => {
            const permisosUsuario = req.user?.permisos || [];
            const esAppToken = req.user?.type === 'app-token';

            // Para ambos tipos de token usar el key del microservicio
            // y verificar que el token tenga al menos uno de los permisos requeridos
            const keyBusqueda = key;

            try {
                // Intentar Redis primero
                let permisosRequeridos = await getPermisosFromCache(keyBusqueda);

                // Si no está en cache, consultar BD
                if (!permisosRequeridos) {
                    permisosRequeridos = await getPermisosFromDB(keyBusqueda);
                    if (permisosRequeridos) {
                        await setPermisosInCache(keyBusqueda, permisosRequeridos);
                    }
                }

                if (!permisosRequeridos) {
                    return res.status(500).json({ message: `No se encontraron permisos para: ${keyBusqueda}` });
                }

                const shiro = shiroTrie.new();
                shiro.add(permisosUsuario);

                const tienePermiso = permisosRequeridos.some((p: string) => shiro.check(p));

                if (tienePermiso) return next();

                const mensaje = esAppToken
                    ? 'App sin permisos para realizar esta acción'
                    : 'No tiene permisos para realizar esta acción';

                return res.status(403).json({ message: mensaje });

            } catch (err: any) {
                return res.status(500).json({ message: 'No se pudieron verificar los permisos del microservicio' });
            }
        };
    },

    optionalAuth() {
        return (req: any, res: any, next: any) => {
            try {
                const extractor = passportJWT.ExtractJwt.fromAuthHeaderWithScheme('jwt');
                const token = extractor(req);
                const tokenData = jwt.verify(token, jwtKey);
                if (tokenData) {
                    req.user = tokenData;
                }
                next();
            } catch (e) {
                next();
            }
        };
    }
};
