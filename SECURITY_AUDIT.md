# Auditoría de Seguridad — Portfolio

> **Fecha:** 20 de marzo de 2026  
> **Alcance:** API (Node/Express), Frontend (Next.js 15), Docker, gestión de tokens  
> **Severidades:** 🔴 Crítica | 🟠 Alta | 🟡 Media | 🟢 Baja

---

## Resumen ejecutivo

Se identificaron **20 hallazgos** distribuidos en las capas de autenticación, configuración del servidor, validación de entradas, infraestructura y privacidad. Los más urgentes son la ausencia de bloqueo ante ataques de fuerza bruta, el spoofing de IP en los logs de autenticación y la falta de rotación de refresh tokens.

| Severidad | Cantidad |
|-----------|----------|
| 🔴 Crítica | 3 |
| 🟠 Alta | 6 |
| 🟡 Media | 7 |
| 🟢 Baja | 4 |

---

## 🔴 Vulnerabilidades Críticas

---

### VUL-001 — Sin protección contra fuerza bruta en login

**Archivo:** [`api/routes/auth.js`](api/routes/auth.js)  
**Descripción:** El endpoint `POST /api/auth/login` no bloquea ni penaliza al atacante tras múltiples intentos fallidos. El rate limiter global (100 req / 15 min) es insuficiente para proteger contra contraseñas débiles.

**Cambio a realizar:**

1. Instalar `express-rate-limit` con configuración específica para auth:

```js
// api/server.js o api/routes/auth.js
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Solo 10 intentos por IP cada 15 minutos
  skipSuccessfulRequests: true,
  message: { error: 'Demasiados intentos de login. Intenta en 15 minutos.' }
});

router.post('/login', loginLimiter, async (req, res) => { ... });
```

2. Implementar bloqueo temporal de cuenta tras 5 fallos consecutivos:

```js
// api/models/User.js — agregar campos:
failedLoginAttempts: { type: Number, default: 0 },
lockUntil: { type: Date, default: null }

// En la ruta de login, antes de verificar la contraseña:
if (user.lockUntil && user.lockUntil > Date.now()) {
  return res.status(423).json({ error: 'Cuenta bloqueada temporalmente.' });
}
```

---

### VUL-002 — Spoofing de IP en logs de autenticación

**Archivo:** [`api/routes/auth.js`](api/routes/auth.js) — función `getClientIP`  
**Descripción:** La función lee `x-forwarded-for` como primera opción sin validar su contenido. Un atacante puede enviar un header falsificado y aparecer con cualquier IP en los `LoginLog`.

```js
// ACTUAL (vulnerable)
function getClientIP(req) {
  return req.headers['x-forwarded-for'] || // ← cualquiera puede falsificar esto
         req.connection.remoteAddress || ...
}
```

**Cambio a realizar:**

Usar exclusivamente `req.ip`, que Express resuelve correctamente con `trust proxy` ya configurado. Si hay proxy real, el header ya fue procesado de forma segura:

```js
// PROPUESTO
function getClientIP(req) {
  // req.ip ya considera trust proxy configurado en app.set('trust proxy', ...)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // Tomar solo la primera IP del encabezado y validar formato
    const firstIP = forwarded.split(',')[0].trim();
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(firstIP)) return firstIP;
  }
  return req.ip || req.socket?.remoteAddress || '0.0.0.0';
}
```

---

### VUL-003 — Refresh token sin rotación (token reuse)

**Archivo:** [`api/utils/tokenManager.js`](api/utils/tokenManager.js)  
**Descripción:** Al llamar a `verifyRefreshToken`, el token usado **no se revoca ni se reemplaza**. Si un atacante obtiene el refresh token (XSS, intercepción), puede usarlo indefinidamente y en paralelo con el usuario legítimo sin ser detectado.

Además, cada uso extiende la expiración 30 días más, haciendo la sesión virtualmente permanente.

**Cambio a realizar:**

Implementar **Refresh Token Rotation**: al verificar, revocar el token anterior y emitir uno nuevo:

```js
// api/utils/tokenManager.js
async function verifyRefreshToken(token, ipAddress, userAgent) {
  const refreshToken = await RefreshToken.findOne({ token, revoked: false });

  if (!refreshToken || refreshToken.expiresAt < new Date()) {
    // Posible token reuse — revocar toda la familia de tokens del usuario
    if (refreshToken) await revokeAllUserTokens(refreshToken.userId);
    throw new Error('Invalid or expired refresh token');
  }

  // Revocar el token usado
  refreshToken.revoked = true;
  refreshToken.revokedAt = new Date();
  await refreshToken.save();

  const user = await User.findById(refreshToken.userId).select('-password');
  if (!user) throw new Error('User not found');

  // Emitir nuevo refresh token
  const newRefreshToken = await generateRefreshToken(user, ipAddress, userAgent);

  return { user, newRefreshToken };
}
```

Y actualizar la ruta `/api/auth/refresh` para devolver y setear el nuevo refresh token en la cookie.

---

## 🟠 Vulnerabilidades Altas

---

### VUL-004 — Endpoint de settings expone variables de entorno

**Archivo:** [`api/routes/admin.js`](api/routes/admin.js) — ruta `GET /api/admin/settings`  
**Descripción:** La respuesta incluye `process.env.NODE_ENV` y `process.env.SUPABASE_URL`. Si `SUPABASE_URL` corresponde a un proyecto activo, expone la URL base de la base de datos o API de Supabase a cualquier admin comprometido (escalada horizontal de información).

```js
// ACTUAL — expone variables internas
res.json({
  settings: {
    environment: process.env.NODE_ENV,
    supabaseUrl: process.env.SUPABASE_URL  // ← no debería exponerse
  }
});
```

**Cambio a realizar:**

```js
// PROPUESTO — solo metadatos no sensibles
res.json({
  settings: {
    siteName: 'Portfolio Admin',
    version: '1.0.0',
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'development'
    // Nunca exponer URLs de servicios ni credenciales
  }
});
```

---

### VUL-005 — Protección anti-spam del formulario de contacto solo en cliente

**Archivo:** [`src/utils/email/spamProtection.ts`](src/utils/email/spamProtection.ts)  
**Descripción:** El límite de 1 email cada 5 minutos se controla con `localStorage`. Cualquier persona puede borrarlo desde DevTools o ignorarlo con `curl`/Postman, generando envíos masivos a través de EmailJS.

**Cambio a realizar:**

Dado que EmailJS se usa directamente desde el browser, la protección server-side requiere un proxy en la propia API Next.js:

```ts
// src/app/api/contact/route.ts (Route Handler de Next.js)
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

const ipRateMap = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const now = Date.now();
  const entry = ipRateMap.get(ip);

  if (entry && now < entry.resetAt) {
    if (entry.count >= 3) {
      return NextResponse.json({ error: 'Demasiados mensajes. Espera 15 minutos.' }, { status: 429 });
    }
    entry.count++;
  } else {
    ipRateMap.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
  }

  // Aquí llamar a EmailJS con el service key desde la variable de entorno del servidor
  // (sin NEXT_PUBLIC_) para que la clave no sea visible en el bundle del cliente
  ...
}
```

---

### VUL-006 — CORS con regex demasiado permisivo (172.x.x.x)

**Archivo:** [`api/server.js`](api/server.js)  
**Descripción:** El regex `/^http:\/\/172\.\d+\.\d+\.\d+:(3000|3001|3002)$/` acepta cualquier IP `172.0.0.0–172.255.255.255`. Solo el rango `172.16.0.0/12` (172.16–172.31) es privado. Los rangos 172.0–172.15 y 172.32–172.255 son IPs públicas que el atacante podría controlar.

**Cambio a realizar:**

```js
// PROPUESTO — restricción al rango privado real
/^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}:(3000|3001|3002)$/,
```

---

### VUL-007 — Límite del body parser excesivo en rutas de autenticación

**Archivo:** [`api/server.js`](api/server.js)  
**Descripción:** El body parser acepta hasta `10mb` globalmente. Para rutas de login/register esto es innecesario y facilita ataques DoS de payload gigante que consumen memoria del proceso Node.

**Cambio a realizar:**

Usar un límite pequeño en rutas de autenticación y el de 10mb solo donde realmente se necesite (p.ej. subida de imágenes de proyectos):

```js
// Limite estricto para auth
app.use('/api/auth', express.json({ limit: '1kb' }));

// Limite normal para resto
app.use('/api/', express.json({ limit: '1mb' }));
// Solo rutas de proyectos necesitan más
app.use('/api/projects/admin', express.json({ limit: '5mb' }));
```

---

### VUL-008 — Contraseña visible al escribir en createAdmin.js

**Archivo:** [`api/scripts/createAdmin.js`](api/scripts/createAdmin.js)  
**Descripción:** El campo de contraseña en el script interactivo usa `readline` estándar que muestra los caracteres al escribir. En un entorno con shell logging activo, la contraseña queda grabada en el historial.

**Cambio a realizar:**

```js
// Usar lectura silenciosa para la contraseña
const getPassword = () => new Promise((resolve) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Contraseña: ', (answer) => {
    rl.close();
    resolve(answer);
  });
  // Silenciar salida de caracteres
  rl._writeToOutput = (str) => {
    if (str.charCodeAt(0) === 13) rl.output.write('\n');
  };
});
```

O usar la librería `read` para input de contraseñas ocultas: `npm install read`.

---

### VUL-009 — Ausencia de headers de seguridad en el frontend (Next.js)

**Archivo:** [`next.config.ts`](next.config.ts)  
**Descripción:** El archivo de configuración de Next.js no define headers de seguridad como `Content-Security-Policy`, `X-Frame-Options`, `Permissions-Policy`, etc. Solo define headers de caché. Esto deja el frontend expuesto a clickjacking y ataques XSS indirectos.

**Cambio a realizar:**

Agregar al array `headers()` en `next.config.ts`:

```ts
{
  source: '/:path*',
  headers: [
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    {
      key: 'Content-Security-Policy',
      value: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",  // unsafe-inline solo si es necesario para Next.js
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "connect-src 'self' https://api.emailjs.com",
        "frame-ancestors 'none'",
      ].join('; ')
    },
  ]
}
```

---

## 🟡 Vulnerabilidades Medias

---

### VUL-010 — bcrypt cost factor insuficiente (rounds = 10)

**Archivo:** [`api/models/User.js`](api/models/User.js)  
**Descripción:** `bcrypt.genSalt(10)` es el valor mínimo recomendado. En hardware moderno (2024–2026) se puede forzar ~100.000 hashes/segundo. El OWASP recomienda al menos **12 rounds** para bcrypt, o migrar a Argon2.

**Cambio a realizar:**

```js
const salt = await bcrypt.genSalt(12); // Aumentar de 10 a 12
```

O migrar a `argon2` (más seguro ante GPUs):
```js
const argon2 = require('argon2');
this.password = await argon2.hash(this.password);
```

---

### VUL-011 — Modelo LoginLog requiere userId pero falla silenciosamente

**Archivo:** [`api/models/LoginLog.js`](api/models/LoginLog.js) y [`api/routes/auth.js`](api/routes/auth.js)  
**Descripción:** El schema define `userId` como `required: true`, pero cuando el login falla con un **email inexistente**, el log se intenta crear sin `userId`. El error es capturado silenciosamente en el `try-catch`, lo que significa que **los intentos de login con emails inválidos no se registran**.

**Cambio a realizar:**

```js
// api/models/LoginLog.js
userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: false,  // ← Optional: el usuario puede no existir
  default: null
},
```

---

### VUL-012 — Falta validación de formato de email y contraseña en login

**Archivo:** [`api/routes/auth.js`](api/routes/auth.js)  
**Descripción:** Solo se verifica que los campos no estén vacíos. No se valida el formato del email ni la longitud mínima de la contraseña, lo que puede facilitar ataques con payloads malformados o muy largos (ReDoS / DoS de bcrypt con contraseñas extremadamente largas).

**Cambio a realizar:**

```js
// Instalar: npm install express-validator
const { body, validationResult } = require('express-validator');

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8, max: 72 }) // bcrypt trunca a 72 chars
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Datos de entrada inválidos' });
  }
  // ... resto del handler
});
```

> **Importante:** el límite de 72 caracteres en bcrypt es conocido — contraseñas más largas no aumentan la seguridad pero consumen CPU. Validar `max: 72`.

---

### VUL-013 — IPs de visitantes almacenadas en texto plano (GDPR/privacidad)

**Archivo:** [`api/routes/analytics.js`](api/routes/analytics.js) y [`api/models/UniqueVisitor.js`]  
**Descripción:** Las IPs se guardan sin anonimización en la colección `UniqueVisitor`. La IP es un dato personal bajo GDPR/LOPD. Almacenarla en texto plano implica obligaciones de consentimiento y protección de datos.

**Cambio a realizar:**

Guardar un hash unidireccional de la IP (no reversible), suficiente para detectar unicidad:

```js
const crypto = require('crypto');

function anonymizeIP(ip) {
  // Usar un salt fijo del servidor (no la IP sola) para evitar rainbow tables
  const salt = process.env.IP_HASH_SALT || 'cambiar_esto';
  return crypto.createHmac('sha256', salt).update(ip).digest('hex');
}

const hashedIp = anonymizeIP(cleanIp);
const existingVisitor = await UniqueVisitor.findOne({ ipAddress: hashedIp });
```

---

### VUL-014 — Falta validación de URLs en campo `image` de proyectos

**Archivo:** [`api/routes/projects.js`](api/routes/projects.js)  
**Descripción:** El campo `image` acepta cualquier string sin validar que sea una URL. Un administrador comprometido podría insertar scripts o rutas relativas que causen comportamientos inesperados en el frontend.

**Cambio a realizar:**

```js
// Validar que sea una URL absoluta y segura
const isValidImageUrl = (url) => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

if (image && !isValidImageUrl(image)) {
  return res.status(400).json({ error: 'La URL de la imagen no es válida' });
}
```

---

### VUL-015 — Logging de emails e IPs en producción (console.log)

**Archivos:** [`api/middleware/auth.js`](api/middleware/auth.js), [`api/routes/auth.js`](api/routes/auth.js), [`api/server.js`](api/server.js)  
**Descripción:** Se hacen `console.log` con emails, IPs y roles de usuario. En producción, estos logs pueden enviarse a servicios de logging de terceros o quedar en archivos expuestos.

```js
console.log('✅ Login exitoso:', user.email, 'desde IP:', clientIP); // expone PII
console.log(`... from ${req.ip}`); // en cada request
```

**Cambio a realizar:**

Usar una librería de logging con niveles (e.g. `pino` o `winston`) que en producción NO exponga datos personales:

```js
const logger = require('pino')({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  redact: ['email', 'ip', 'ipAddress'] // Redactar campos sensibles automáticamente
});
```

---

### VUL-016 — Paginación sin validación de límites en consultas admin

**Archivo:** [`api/routes/admin.js`](api/routes/admin.js)  
**Descripción:** Los parámetros `page` y `limit` se usan directamente de `req.query` con `parseInt` sin establecer un máximo. Un atacante puede enviar `limit=1000000` y desencadenar una consulta masiva a MongoDB.

```js
const { page = 1, limit = 10 } = req.query; // Sin máximo
```

**Cambio a realizar:**

```js
const page = Math.max(1, parseInt(req.query.page) || 1);
const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10)); // Máximo 100
```

---

## 🟢 Hallazgos de Baja Severidad

---

### VUL-017 — Script `createAdmin.js` desplegado en producción

**Archivo:** [`api/scripts/createAdmin.js`](api/scripts/createAdmin.js)  
**Descripción:** El script de creación de admin forma parte del artefacto desplegado. Si alguien obtiene acceso shell, puede ejecutarlo para crear un nuevo admin.

**Recomendación:** Agregar el directorio `scripts/` al `.dockerignore` y asegurarse de que no esté accesible desde el servidor de producción, o protegerlo con una variable de entorno de "setup mode" que solo esté habilitada durante el despliegue inicial.

---

### VUL-018 — Dependencias potencialmente desactualizadas

**Archivo:** [`api/package.json`](api/package.json)  
**Descripción:** `bcryptjs ^2.4.3` tiene años sin actualizaciones importantes. `express ^4.18.x` — Express 5 está disponible en estable desde 2024. 

**Recomendación:**
```sh
# Auditar vulnerabilidades conocidas
cd api && npm audit

# Actualizar dependencias
npm install express@latest bcryptjs@latest jsonwebtoken@latest
```

---

### VUL-019 — Docker Compose sin red interna aislada para la API

**Archivo:** [`docker-compose.yml`](docker-compose.yml)  
**Descripción:** El compose solo define el servicio del frontend. Si en el futuro se agrega la API y MongoDB al compose, deberían estar en una red interna para que MongoDB no sea accesible desde fuera del contenedor.

**Recomendación:**

```yaml
services:
  api:
    ...
    networks:
      - internal
  mongo:
    ...
    networks:
      - internal
    # Sin ports: expuestos al host

  portfolio:
    ...
    networks:
      - internal
      - external

networks:
  internal:
    internal: true
  external:
```

---

### VUL-020 — EmailJS keys expuestas en el bundle del cliente

**Archivo:** [`src/utils/email/emailService.ts`](src/utils/email/emailService.ts)  
**Descripción:** `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`, `SERVICE_ID` y `TEMPLATE_ID` se incluyen en el bundle JavaScript enviado al navegador. Aunque EmailJS está diseñado para uso en cliente, estas keys permiten a cualquier persona enviar emails haciéndose pasar por el formulario del portfolio.

**Recomendación:** Crear un Route Handler en Next.js (`/api/contact`) que actúe como proxy usando la SDK de EmailJS en el servidor con claves **sin el prefijo `NEXT_PUBLIC_`**, para que nunca lleguen al cliente.

---

## Plan de acción priorizado

| Prioridad | ID | Descripción | Esfuerzo |
|-----------|-----|-------------|----------|
| 1 | VUL-001 | Rate limit estricto en login + bloqueo de cuenta | Bajo |
| 2 | VUL-003 | Implementar rotación de refresh tokens | Medio |
| 3 | VUL-002 | Corrección de getClientIP para evitar spoofing | Bajo |
| 4 | VUL-009 | Headers de seguridad en Next.js (CSP, X-Frame) | Bajo |
| 5 | VUL-005 | Rate limit server-side en formulario de contacto | Medio |
| 6 | VUL-007 | Reducir límite body parser en rutas auth | Bajo |
| 7 | VUL-004 | Eliminar variables de entorno del endpoint settings | Bajo |
| 8 | VUL-012 | Validar formato email y longitud contraseña | Bajo |
| 9 | VUL-010 | Aumentar bcrypt rounds a 12 | Bajo |
| 10 | VUL-011 | Hacer userId opcional en LoginLog | Bajo |
| 11 | VUL-016 | Validar parámetros de paginación (max limit) | Bajo |
| 12 | VUL-006 | Corregir regex CORS para 172.x.x.x | Bajo |
| 13 | VUL-013 | Anonimizar IPs con HMAC antes de guardar | Medio |
| 14 | VUL-014 | Validar URLs de imágenes en proyectos | Bajo |
| 15 | VUL-015 | Reemplazar console.log con logger en producción | Medio |
| 16 | VUL-020 | Mover EmailJS a Route Handler server-side | Medio |
| 17 | VUL-008 | Ocultar input de contraseña en createAdmin.js | Bajo |
| 18 | VUL-017 | Excluir scripts/ del artefacto de producción | Bajo |
| 19 | VUL-018 | Auditar y actualizar dependencias | Bajo |
| 20 | VUL-019 | Aislar servicios en redes internas Docker | Bajo |

---

## Dependencias recomendadas a agregar

```bash
# API
npm install express-validator pino helmet@latest

# Frontend (para route handler de contacto)
# No se necesitan dependencias nuevas, usar fetch del servidor
```

---

*Generado en auditoría manual de código — no sustituye a un pentest profesional.*
