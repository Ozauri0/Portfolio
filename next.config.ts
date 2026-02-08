import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  
  // Generar hashes únicos para archivos estáticos (cache busting)
  generateBuildId: async () => {
    // Usa timestamp + random para garantizar builds únicos
    return `build-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  },
  
  // Configuración de headers para control de caché
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
        // Páginas HTML - sin caché para siempre obtener la última versión
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
