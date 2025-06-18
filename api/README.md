# Portfolio API

API backend para el portafolio con autenticación usando Supabase.

## 🚀 Características

- Autenticación completa (registro, login, logout)
- Integración con Supabase auto-hosteado
- Panel de administración
- Rate limiting y seguridad
- Manejo de errores robusto
- CORS configurado

## 📋 Prerrequisitos

- Node.js 16+ 
- Acceso a instancia de Supabase
- Variables de entorno configuradas

## ⚙️ Configuración

1. **Instalar dependencias:**
```bash
cd api
npm install
```

2. **Configurar variables de entorno:**
Edita el archivo `.env` con tus datos reales:

```env
SUPABASE_URL=https://supa.christianferrer.me
SUPABASE_ANON_KEY=tu_clave_anonima_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_clave_service_role_aqui
JWT_SECRET=tu_secreto_jwt_seguro_aqui
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

3. **Configurar Supabase:**
Asegúrate de que tu instancia de Supabase tenga:
- Autenticación habilitada
- Tabla `profiles` (opcional, para roles de admin)
- Políticas RLS configuradas según necesites

## 🏃‍♂️ Ejecución

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

## 📡 Endpoints

### Autenticación (`/api/auth`)
- `POST /register` - Registrar usuario
- `POST /login` - Iniciar sesión
- `POST /logout` - Cerrar sesión
- `GET /profile` - Obtener perfil del usuario
- `GET /verify` - Verificar token
- `POST /refresh` - Refrescar token

### Administración (`/api/admin`)
- `GET /dashboard` - Dashboard del admin
- `GET /users` - Listar usuarios
- `GET /settings` - Configuración del sistema
- `GET /logs` - Logs del sistema

### Sistema
- `GET /api/health` - Estado del servidor
- `GET /` - Información de la API

## 🔒 Seguridad

- Helmet para headers de seguridad
- Rate limiting (100 requests/15min)
- CORS configurado
- Validación de entrada
- Manejo seguro de errores

## 🗂️ Estructura

```
api/
├── config/
│   └── supabase.js       # Configuración de Supabase
├── middleware/
│   └── auth.js           # Middleware de autenticación
├── routes/
│   ├── auth.js           # Rutas de autenticación
│   └── admin.js          # Rutas de administración
├── .env                  # Variables de entorno
├── .gitignore           # Archivos ignorados por git
├── package.json         # Dependencias y scripts
├── server.js           # Servidor principal
└── README.md           # Este archivo
```

## 🧪 Testing

Para probar los endpoints, puedes usar herramientas como:
- Postman
- Insomnia  
- curl
- Thunder Client (VS Code)

### Ejemplo de uso con curl:

```bash
# Registrar usuario
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","fullName":"Test User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

## 🛠️ Desarrollo

1. El servidor se reinicia automáticamente con `nodemon`
2. Los logs se muestran en la consola
3. Usa el endpoint `/api/health` para verificar el estado

## 📝 Notas importantes

- Asegúrate de cambiar `JWT_SECRET` en producción
- Configura las políticas RLS en Supabase según tus necesidades
- El sistema de roles de admin requiere una tabla `profiles` con campo `role`
- Ajusta la configuración de CORS según tu dominio de producción

## 🐛 Solución de problemas

1. **Error de conexión a Supabase:** Verifica la URL y las claves API
2. **CORS errors:** Verifica la configuración de `FRONTEND_URL`
3. **Token inválido:** Asegúrate de enviar el header `Authorization: Bearer <token>`
