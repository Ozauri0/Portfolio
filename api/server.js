const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// CORS - DEBE IR PRIMERO
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    /^http:\/\/192\.168\.\d+\.\d+:(3000|3001|3002)$/,  // Permite cualquier IP de red local 192.168.x.x
    /^http:\/\/172\.\d+\.\d+\.\d+:(3000|3001|3002)$/,  // Permite IPs del rango 172.x.x.x
    /^http:\/\/10\.\d+\.\d+\.\d+:(3000|3001|3002)$/,   // Permite IPs del rango 10.x.x.x
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

// Handle preflight requests
app.options('*', cors());

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

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
  trustProxy: ['loopback', 'linklocal', 'uniquelocal']
});

// Rate limiting
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for correct IP detection
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} from ${req.ip}`);
  next();
});

// Main routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

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
