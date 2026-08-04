# @andes/bootstrap

Librería compartida de autenticación y autorización para los microservicios de ANDES.

## Configuración inicial

### 1. Completar el archivo de configuración

Editar `auth.ts` y completar:

```typescript
export const jwtKey = process.env.JWT_KEY || 'TU_CLAVE_JWT_REAL';

export const RedisConfig = {
    active: getEnv('REDIS', true, 'b'),
    host: getEnv('REDIS_HOST', 'IP_DEL_SERVIDOR_REDIS'),
    port: getEnv('REDIS_PORT', 6379, 'n')
};
```

> ⚠️ estos datos son de caracter sensibles y no deben subirse a github.

### 2. Compilar el bootstrap

```bash
npm install
npm run tsc
```

### 3. Reinstalar en cada microservicio

Después de modificar y compilar el bootstrap, hay que reinstalarlo en cada microservicio que lo use:

```bash
cd ../nombre-del-microservicio
rm -rf node_modules/@andes/bootstrap
npm install
```

---

## Uso en microservicios

### Autenticación básica (solo verificar token JWT)

```typescript
import { Microservice, Middleware } from '@andes/bootstrap';

router.get('/ruta', Middleware.authenticate(), async (req, res) => {
    // req.user contiene el payload del token
});
```

### Autenticación con carga de permisos (user-token-2)

router.get('/ruta',
    Middleware.authenticate({ recoverPayload: true }),
    Middleware.authorizeByKey('nombre-del-microservicio'),
    async (req, res) => { ... }
);
```
---

## Flujo de control de permisos

### Para app-token (Sifaho, Recetar, etc.)

Request con app-token
        ↓
smartAuth — decodifica el token
        ↓
appTokenProtected — verifica que el token esté activo en authApps (BD)
        ↓
authorizeByKey('ms-recetas')
    ├── Busca permisos requeridos en Redis (cache, TTL 1 hora)
    ├── Si no está en cache → consulta colección microserviciosPermisos en BD
    └── Verifica con shiro-trie que el token tenga al menos un permiso requerido
        ↓
    ✓ Autorizado → Handler
    ✗ Sin permisos → 403

### Para user-token-2 (usuarios de Andes)

Request con user-token-2
        ↓
smartAuth — detecta user-token-2, delega a passport
        ↓
passport.authenticate('jwt') — verifica firma con JWT_KEY
        ↓
extractTokenMiddleware — guarda token raw en req.token (clave de Redis)
        ↓
recoverPayloadMiddleware — carga permisos del usuario:
    ├── Busca en Redis por req.token (cache del monolito, TTL 24hs)
    └── Si no está en cache → consulta authUsers en MongoDB directamente
        ↓
authorizeByKey('nombre-del-microservicio')
    ├── Busca permisos requeridos en Redis (TTL 1 hora)
    ├── Si no está en cache → consulta microserviciosPermisos en BD
    └── Verifica con shiro-trie que req.user.permisos incluya al menos uno
        ↓
    ✓ Autorizado → Handler
    ✗ Sin permisos → 403
    ✗ Redis y BD caídos → 500

## Colección microserviciosPermisos

Define qué permisos son necesarios para acceder a cada microservicio. Crear un documento por microservicio en la BD de Andes:

* key — identificador único. Para user-token-2 coincide con el nombre del microservicio. Para app-token coincide con el nombre en authApps.
* permisos — lista de permisos requeridos. Basta con tener uno para acceder. Soporta wildcards jerárquicos via shiro-trie (ej: huds:*).

---

### Códigos de respuesta

| Código | Causa | Descripción |
| :---: | :--- | :--- |
| **401** | Token inválido, expirado o ausente | El cliente no está autenticado o la credencial no es correcta. |
| **403** | Token válido pero sin permisos suficientes | El token existe pero no tiene el rol necesario, o fue revocado. |
| **500** | Error interno del servidor | No se pudieron verificar los permisos — Redis y BD no disponibles. |

---

### Cache Redis

El bootstrap usa el mismo servidor Redis que el monolito de Andes:

* Permisos de usuario (user-token-2) — cacheados por el monolito al hacer login con TTL de 24 horas. El bootstrap los lee directamente sin necesidad de consultar la BD.
* Permisos de microservicio (microserviciosPermisos) — cacheados por el bootstrap con TTL de 1 hora. Si se modifica un documento, el cambio se refleja en máximo 1 hora.

Si Redis no está disponible, ambos flujos hacen fallback a MongoDB automáticamente.