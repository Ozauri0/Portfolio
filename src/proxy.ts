import { NextRequest, NextResponse } from 'next/server';

const isDev = process.env.NODE_ENV === 'development';

// CSP con nonce por petición: sin 'unsafe-inline' ni 'unsafe-eval' en scripts (producción).
// style-src mantiene 'unsafe-inline' porque React/Next emiten atributos style y estilos inline.
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const connectSrc = ["'self'", 'https://cloudflareinsights.com'];
  if (isDev) connectSrc.push('http://localhost:*', 'ws://localhost:*');

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://static.cloudflareinsights.com${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    // Las imágenes subidas se sirven en el mismo dominio (/public, vía proxy a la API)
    `img-src 'self' data: blob: https:${isDev ? ' http:' : ''}`,
    `connect-src ${connectSrc.join(' ')}`,
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    // Solo si la petición llegó por https (nginx envía X-Forwarded-Proto): Safari/WebKit también
    // aplica la directiva a http://localhost y rompería la carga de recursos en local
    ...(!isDev && request.headers.get('x-forwarded-proto') === 'https' ? ['upgrade-insecure-requests'] : []),
  ].join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!api|public/|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
