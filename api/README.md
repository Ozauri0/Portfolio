# 🚀 Portfolio API - MongoDB + Express.js

> API backend para portfolio personal con autenticación JWT y MongoDB

[![Node.js](https://img.shields.io/badge/Node.js-v16+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v6+-green.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-v4-blue.svg)](https://expressjs.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-orange.svg)](https://jwt.io/)

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Stack Tecnológico](#-stack-tecnológico)
- [Inicio Rápido](#-inicio-rápido)
- [Configuración](#️-configuración)
- [Estructura de la API](#-estructura-de-la-api)
- [Migración desde Supabase](#-migración-desde-supabase)

## ✨ Características

- 🔐 **Autenticación JWT** - Sistema completo de login/logout
- 👥 **Gestión de Usuarios** - Con roles (admin/user)
- 📊 **Analytics** - Tracking de visitantes y clicks
- 🛡️ **Seguridad** - Rate limiting, CORS, Helmet
- 📝 **Logs** - Sistema de auditoría de logins
- 🎨 **Panel Admin** - Dashboard con estadísticas

## 🛠️ Stack Tecnológico

- **Runtime**: Node.js v16+
- **Framework**: Express.js
- **Base de Datos**: MongoDB con Mongoose
- **Autenticación**: JWT (JSON Web Tokens)
- **Seguridad**: bcryptjs, helmet, express-rate-limit
- **Desarrollo**: nodemon

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js v16 o superior
- MongoDB (local o Atlas)
- npm o yarn

### Instalación

```bash
# 1. Clonar el repositorio
git clone <tu-repo>

# 2. Ir a la carpeta de la API
cd api

# 3. Instalar dependencias
npm install

# 4. Crear usuario administrador (en carpeta de scripts)
npm run create-admin

# 6. Iniciar servidor
npm run dev
```

El servidor estará disponible en `http://localhost:5000`

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la carpeta `api/`:

```env
# Servidor
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/portfolio

# JWT
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRES_IN=24h

# Frontend
FRONTEND_URL=http://localhost:3000
```

## 📡 Estructura de la API

### Endpoints Principales

#### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/login` | Iniciar sesión | No |
| POST | `/logout` | Cerrar sesión | Sí |
| GET | `/profile` | Obtener perfil | Sí |
| GET | `/verify` | Verificar token | Sí |
| POST | `/refresh` | Refrescar token | Sí |

#### Analytics (`/api/analytics`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/track-click` | Registrar click | No |
| POST | `/track-visitor` | Registrar visitante | No |
| GET | `/stats` | Estadísticas públicas | No |

#### Admin (`/api/admin`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/dashboard` | Panel admin | Admin |
| GET | `/users` | Listar usuarios | Admin |
| GET | `/logs` | Logs de login | Admin |
| GET | `/visitor-stats` | Stats visitantes | Admin |
| GET | `/visitor-chart` | Datos gráficos | Admin |
| POST | `/reset-social` | Reiniciar stats social | Admin |
| POST | `/reset-projects` | Reiniciar stats proyectos | Admin |

### Ejemplo de Petición

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'

# Petición autenticada
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer <tu_token>"
```

## 🔄 Migración desde Supabase

Esta API fue migrada de Supabase a MongoDB + JWT.

### ¿Qué cambió?

| Antes (Supabase) | Ahora (MongoDB) |
|------------------|-----------------|
| PostgreSQL | MongoDB |
| Supabase Auth | JWT Custom |
| Gestión automática | Control total |

**⚠️ El frontend NO requiere cambios** - La API mantiene la misma estructura de respuestas.

## 📂 Estructura del Proyecto

```
api/
├── config/
│   └── database.js          # Conexión MongoDB
├── middleware/
│   └── auth.js             # Autenticación JWT
├── models/
│   ├── User.js             # Modelo Usuario
│   ├── LoginLog.js         # Logs de login
│   ├── UniqueVisitor.js    # Visitantes únicos
│   └── AnalyticsClick.js   # Analytics clicks
├── routes/
│   ├── auth.js             # Rutas autenticación
│   ├── admin.js            # Rutas admin
│   └── analytics.js        # Rutas analytics
├── scripts/
│   └── createAdmin.js      # Crear usuario admin
├── server.js               # Servidor principal
├── .env.example            # Template variables
├── package.json
├── MIGRATION.md            # Guía migración
└── CHANGELOG_MIGRATION.md  # Historial cambios
```

## 🧪 Testing

### Health Check

```bash
curl http://localhost:5000/api/health
```

### Crear Usuario Admin

```bash
npm run create-admin
```

### Iniciar en Desarrollo

```bash
npm run dev
```

## 🔒 Seguridad

- ✅ Passwords hasheados con bcrypt (10 rounds)
- ✅ JWT con expiración configurable
- ✅ Rate limiting (100 req/15min)
- ✅ CORS configurado
- ✅ Helmet para headers de seguridad
- ✅ Validación de inputs
- ✅ Sistema de roles (admin/user)

## 📊 Base de Datos

### Colecciones

- **users** - Usuarios del sistema
- **loginlogs** - Registro de inicios de sesión
- **uniquevisitors** - Visitantes únicos
- **analyticsclicks** - Estadísticas de clicks

Ver modelos en `models/` para estructura completa.


## 📚 Scripts Disponibles

```bash
npm start          # Iniciar en producción
npm run dev        # Iniciar en desarrollo (con nodemon)
npm run create-admin  # Crear usuario administrador
```