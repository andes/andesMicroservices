# @andes/bootstrap

Librería compartida de autenticación y autorización para los microservicios de ANDES.

## Configuración inicial

### 1. Crear el archivo de configuración

Copiar el archivo de ejemplo y completar los valores reales:

```bash
cp auth.example.ts auth.ts
```

Editar `auth.ts` y completar:

```typescript
export const jwtKey = process.env.JWT_KEY || 'TU_CLAVE_JWT_REAL';

export const RedisConfig = {
    active: getEnv('REDIS', true, 'b'),
    host: getEnv('REDIS_HOST', 'IP_DEL_SERVIDOR_REDIS'),
    port: getEnv('REDIS_PORT', 6379, 'n')
};
```

> ⚠️ `auth.ts` está en `.gitignore` — porque contiene datos sensibles.

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

Cada microservicio define los permisos requeridos para cada ruta según su dominio. Los permisos disponibles están en la API de ANDES.

```typescript
router.get('/ruta',
    Middleware.authenticate({ recoverPayload: true }),
    Middleware.authorize(['modulo:permiso']),
    async (req, res) => {
        // req.user.permisos contiene los permisos del usuario
    }
);
```

Por ejemplo:
- `bi-queries` → `Middleware.authorize(['visualizacionInformacion:biQueries'])`
- `ms-recetas` → `Middleware.authorize(['recetas:read'])`
- `ms-notificaciones` → `Middleware.authorize(['notificaciones:read'])`


### Solo verificar app-token (sifaho/recetar)

```typescript
router.get('/ruta',
    Middleware.authenticate(),
    appTokenProtected,  // middleware propio del microservicio
    async (req, res) => { ... }
);
```

---

## Cómo funciona

### `Middleware.authenticate({ recoverPayload: true })`

1. Verifica la firma del JWT con `jwtKey`
2. Si el token es `user-token-2`, carga los permisos del usuario:
   - Primero intenta **Redis** usando el token como clave (mismo cache que el monolito)
   - Si Redis no está disponible, consulta **MongoDB** directamente en `authUsers`
3. Los permisos quedan disponibles en `req.user.permisos`

### `Middleware.authorize(['permiso:requerido'])`

- Usa `shiro-trie` para verificar permisos jerárquicos (ej: `huds:visualizacionParcialHuds:*`)
- Los `app-token` pasan directamente sin pasar por `authorize()` porque sus permisos vienen embebidos en el payload del token — no necesitan consultar Redis ni la BD
- Su control de acceso se maneja por separado mediante `appTokenProtected`, que verifica que el token esté activo en la colección `authApps`
- Devuelve `403` si el usuario no tiene los permisos requeridos

### Respuestas de error

| Código | Causa |
|--------|-------|
| `401` | Token inválido, expirado o ausente |
| `403` | Token válido pero sin permisos suficientes |
| `500` | Redis y BD no disponibles — no se pudieron verificar permisos |

---

## Permisos disponibles

Los permisos están definidos en la API de ANDES. Algunos ejemplos:

| Permiso | Descripción |
|---------|-------------|
| `huds:visualizacionHuds` | Ver HUDS completa |
| `huds:visualizacionParcialHuds:receta` | Ver solo recetas |
| `visualizacionInformacion:biQueries` | Acceso a BI Queries |

---

## Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `JWT_KEY` | Clave para firmar/verificar tokens JWT | vacío (requerido) |
| `REDIS_HOST` | IP o hostname del servidor Redis | vacío |
| `REDIS_PORT` | Puerto del servidor Redis | `6379` |
| `REDIS` | Activar/desactivar Redis (`true`/`false`) | `true` |
