const RefreshToken = require('../models/RefreshToken');

const DAY_MS = 24 * 60 * 60 * 1000;

// Limpieza periódica de refresh tokens expirados o revocados hace tiempo.
// (Los LoginLog se limpian solos con su índice TTL.)
async function runCleanup() {
  try {
    const result = await RefreshToken.cleanupExpired();
    if (result.deletedCount > 0) {
      console.log(`🧹 Refresh tokens eliminados: ${result.deletedCount}`);
    }
  } catch (error) {
    console.error('Error en la limpieza de refresh tokens:', error.message);
  }
}

function startMaintenance() {
  runCleanup();
  const timer = setInterval(runCleanup, DAY_MS);
  timer.unref(); // no impide que el proceso termine
  return timer;
}

module.exports = { startMaintenance, runCleanup };
