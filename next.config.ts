import type { NextConfig } from "next";

// Headers de seguridad HTTP comunes
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // La Content-Security-Policy (con nonce por petición) se define en src/middleware.ts
  // HSTS lo envía Nginx Proxy Manager (max-age 2 años); duplicarlo aquí generaba dos cabeceras
];

const nextConfig: NextConfig = {
  output: "standalone",

  // En producción se eliminan los console.log/info/debug; error y warn se conservan
  compiler: {
    removeConsole: { exclude: ['error', 'warn'] },
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
      {
        protocol: 'https',
        hostname: 'api.christianferrer.me',
      },
    ],
  },
  
  // Generar hashes únicos para archivos estáticos (cache busting)
  generateBuildId: async () => {
    return `build-${Date.now()}-${Math.random().toString(36).substring(7)}`;
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

