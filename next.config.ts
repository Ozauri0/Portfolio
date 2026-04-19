import type { NextConfig } from "next";

// Headers de seguridad HTTP comunes
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: http:",
      // Permite fetch al backend (dev local) y a EmailJS
      `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'} https://api.emailjs.com`,
      "font-src 'self' data:",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

// Construir remotePatterns dinámicamente desde NEXT_PUBLIC_API_URL
// para que next/image pueda optimizar imágenes servidas por la API
function buildApiRemotePattern() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  try {
    const parsed = new URL(apiUrl);
    return {
      protocol: parsed.protocol.replace(':', '') as 'http' | 'https',
      hostname: parsed.hostname,
      ...(parsed.port ? { port: parsed.port } : {}),
      pathname: '/public/**',
    };
  } catch {
    return { protocol: 'http' as const, hostname: 'localhost', port: '5000', pathname: '/public/**' };
  }
}

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
      // Imágenes subidas y servidas por la API (dev y producción)
      buildApiRemotePattern(),
    ],
  },
  
  // Generar hashes únicos para archivos estáticos (cache busting)
  generateBuildId: async () => {
    return `build-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  },

  // Proxear /api/ y /public/ al contenedor de la API internamente.
  // Esto evita exponer el puerto 5000 al exterior: el browser solo habla con
  // el dominio del frontend y Next.js redirige las peticiones internamente.
  async rewrites() {
    const internalApiUrl = process.env.INTERNAL_API_URL || 'http://api:5000';
    return [
      {
        source: '/api/:path*',
        destination: `${internalApiUrl}/api/:path*`,
      },
      {
        source: '/public/:path*',
        destination: `${internalApiUrl}/public/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        // Archivos estáticos con hash - caché largo
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Todas las páginas HTML — sin caché + headers de seguridad (VUL-009)
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          ...securityHeaders,
        ],
      },
    ];
  },
};

export default nextConfig;

