const mongoose = require('mongoose');

// Visitantes únicos por día (fecha en la zona horaria del sitio) y su distribución por hora.
// Permite que el gráfico del admin muestre histórico real: UniqueVisitor solo guarda la última visita.
const dailyVisitSchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD en SITE_TIMEZONE
    required: true,
    unique: true
  },
  visits: {
    type: Number,
    default: 0
  },
  // Mapa hora (0-23) -> visitas; se crea con $inc en el upsert, por eso es un objeto y no un arreglo
  hours: {
    type: Object,
    default: {}
  }
});

module.exports = mongoose.model('DailyVisit', dailyVisitSchema);
