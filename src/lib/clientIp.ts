// El cliente controla las primeras entradas de X-Forwarded-For; solo las que añaden
// nuestros proxies (las últimas) son confiables. TRUSTED_PROXY_HOPS = nº de proxies
// de confianza delante de esta app (nginx = 1, Cloudflare + nginx = 2).
export function getClientIp(headers: Headers): string {
  const hops = Math.max(1, parseInt(process.env.TRUSTED_PROXY_HOPS ?? '1', 10) || 1);
  const parts = (headers.get('x-forwarded-for') ?? '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length > 0) {
    return parts[Math.max(0, parts.length - hops)];
  }
  return headers.get('x-real-ip')?.trim() || 'unknown';
}
