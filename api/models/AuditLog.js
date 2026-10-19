const mongoose = require('mongoose');

// Registro de acciones destructivas del panel de administración (quién, cuándo, qué)
const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true, maxlength: 60 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  email: { type: String, maxlength: 254, default: null },
  ipAddress: { type: String, maxlength: 64, default: null },
  details: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

// Retención de 1 año
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
