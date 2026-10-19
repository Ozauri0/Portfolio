const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

// Fallar rápido si falta configuración obligatoria (sin secretos por defecto)
const { validateEnv } = require('./utils/env');
try {
  validateEnv();
} catch (error) {
  console.error(`❌ ${error.message}`);
  process.exit(1);
}

// Import database connection
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const analyticsRoutes = require('./routes/analytics');
const projectsRoutes = require('./routes/projects');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().then(() => require('./utils/maintenance').startMaintenance());

// CORS - DEBE IR PRIMERO
// En producción solo se acepta FRONTEND_URL; los orígenes locales/red privada solo en desarrollo
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = isProduction
  ? [process.env.FRONTEND_URL]
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      /^http:\/\/192\.168\.\d+\.\d+:(3000|3001|3002)$/,  // Red local 192.168.x.x
      /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}:(3000|3001|3002)$/, // Rango privado 172.16-172.31 (VUL-006)
      /^http:\/\/10\.\d+\.\d+\.\d+:(3000|3001|3002)$/,   // Rango 10.x.x.x
      process.env.FRONTEND_URL
    ];

const corsOptions = {
  origin: allowedOrigins.filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200,
  preflightContinue: false
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
}));

// Proxies de confianza. Con TRUSTED_PROXY_HOPS (p. ej. 2 = nginx + Cloudflare) req.ip es la IP
// real del visitante; sin él se confía en loopback/redes privadas (nginx directo, sin CDN).
const trustedHops = parseInt(process.env.TRUSTED_PROXY_HOPS, 10);
const trustProxySetting = trustedHops > 0 ? trustedHops : ['loopback', 'linklocal', 'uniquelocal'];

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 peticiones por ventana de tiempo
  message: {
    error: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Añadir esta opción para que sea compatible con la configuración de trust proxy
  trustProxy: trustProxySetting
});

// Rate limiting
app.use('/api/', limiter);

// Cookie parser
app.use(cookieParser());

// Body parser — límites reducidos por ruta (VUL-007)
app.use('/api/auth', express.json({ limit: '1kb' }));
app.use('/api/auth', express.urlencoded({ extended: true, limit: '1kb' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Trust proxy for correct IP detection
app.set('trust proxy', trustProxySetting);

// Logging middleware (sin PII en producción - VUL-015)
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  }
  next();
});

// Main routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/projects', projectsRoutes);

// Servir imágenes subidas estáticamente desde /public/
// Las imágenes se almacenan en PUBLIC_DIR (volumen compartido en Docker)
// Cross-Origin-Resource-Policy: cross-origin permite que el frontend (puerto distinto)
// cargue las imágenes. Helmet por defecto pone 'same-origin' y las bloquea.
const PUBLIC_DIR = process.env.PUBLIC_DIR || path.join(__dirname, '..', 'public');
app.use('/public', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(PUBLIC_DIR));

// Server health route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Portfolio API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      admin: '/api/admin'
    }
  });
});

// Middleware for not found routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  
  res.status(error.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Servidor iniciado exitosamente
📍 Puerto: ${PORT}
🌍 Entorno: ${process.env.NODE_ENV || 'development'}
🗄️  Base de datos: MongoDB
⏰ Timestamp: ${new Date().toISOString()}
  `);
});

// Graceful shutdown handling
const mongoose = require('mongoose');

process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido. Cerrando servidor gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT recibido. Cerrando servidor gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = app;
