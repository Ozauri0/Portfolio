const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },
  email: {
    type: String,
    required: true,
    maxlength: 254
  },
  ipAddress: {
    type: String,
    required: true,
    maxlength: 64
  },
  userAgent: {
    type: String,
    default: 'Unknown',
    maxlength: 300
  },
  loginTime: {
    type: Date,
    default: Date.now
  },
  success: {
    type: Boolean,
    default: true
  },
  location: {
    type: String,
    default: 'Unknown',
    maxlength: 100
  }
});

// Index for faster queries
loginLogSchema.index({ userId: 1, loginTime: -1 });

// TTL: los logs de login se eliminan solos tras LOGIN_LOG_RETENTION_DAYS (90 por defecto).
// El índice ascendente también sirve para ordenar por loginTime descendente.
const RETENTION_DAYS = parseInt(process.env.LOGIN_LOG_RETENTION_DAYS, 10) || 90;
loginLogSchema.index({ loginTime: 1 }, { expireAfterSeconds: RETENTION_DAYS * 24 * 60 * 60 });

const clip = (value, max) => String(value ?? '').slice(0, max);

// Crea un registro truncando los campos controlados por el cliente (evita entradas gigantes)
loginLogSchema.statics.record = function ({ userId, email, ipAddress, userAgent, success }) {
  return this.create({
    userId,
    email: clip(email, 254),
    ipAddress: clip(ipAddress, 64),
    userAgent: clip(userAgent || 'Unknown', 300),
    loginTime: new Date(),
    success
  });
};

module.exports = mongoose.model('LoginLog', loginLogSchema);
