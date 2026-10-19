// Fecha y hora siempre en una misma zona horaria explícita (no la del servidor ni UTC mezclado).
const SITE_TIMEZONE = process.env.SITE_TIMEZONE || 'America/Santiago';

const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: SITE_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  hourCycle: 'h23'
});

// Devuelve { date: 'YYYY-MM-DD', hour: 0-23 } de un instante en SITE_TIMEZONE
function siteParts(instant = new Date()) {
  const parts = Object.fromEntries(formatter.formatToParts(instant).map(p => [p.type, p.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: parseInt(parts.hour, 10) % 24 };
}

// Lista de fechas (YYYY-MM-DD) de los últimos `days` días, incluyendo hoy, en orden ascendente
function lastDates(days, now = new Date()) {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    dates.push(siteParts(new Date(now.getTime() - i * 24 * 60 * 60 * 1000)).date);
  }
  return [...new Set(dates)];
}

module.exports = { SITE_TIMEZONE, siteParts, lastDates };
