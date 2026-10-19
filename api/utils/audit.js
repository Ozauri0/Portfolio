const AuditLog = require('../models/AuditLog');

// Registra una acción del admin. Nunca rompe la petición: si falla el log solo se avisa.
async function audit(req, action, details = {}) {
  try {
    await AuditLog.create({
      action,
      userId: req.user?._id || null,
      email: req.user?.email || null,
      ipAddress: String(req.ip || '').slice(0, 64),
      details
    });
  } catch (error) {
    console.warn('No se pudo registrar la acción de auditoría:', error.message);
  }
}

module.exports = { audit };
