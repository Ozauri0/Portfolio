// Valida las variables de entorno obligatorias al arrancar. No existen valores por defecto
// para secretos: si falta alguno o es demasiado corto, la API no inicia.
const MIN_SECRET_LENGTH = 32;

const REQUIRED = [
  { name: 'MONGODB_URI' },
  { name: 'JWT_SECRET', secret: true },
  { name: 'IP_HASH_SALT', secret: true }
];

function validateEnv(env = process.env) {
  const problems = [];

  for (const { name, secret } of REQUIRED) {
    const value = env[name];
    if (!value) {
      problems.push(`${name} no está definida`);
    } else if (secret && value.length < MIN_SECRET_LENGTH) {
      problems.push(`${name} debe tener al menos ${MIN_SECRET_LENGTH} caracteres`);
    }
  }

  if (env.NODE_ENV === 'production' && !env.FRONTEND_URL) {
    problems.push('FRONTEND_URL no está definida (requerida en producción para CORS)');
  }

  if (problems.length > 0) {
    throw new Error(`Configuración de entorno inválida:\n - ${problems.join('\n - ')}`);
  }
}

module.exports = { validateEnv, MIN_SECRET_LENGTH };
