// Hosts antiguos de la API: algunas imágenes guardadas en Mongo tienen la URL absoluta
const LEGACY_API_HOSTS = new Set(['api.christianferrer.me']);

/**
 * Resuelve la URL de la imagen de un proyecto a una ruta del mismo dominio:
 *  - "/foto.jpg"                                    → "/public/foto.jpg"
 *  - "https://api.christianferrer.me/public/x.jpg"  → "/public/x.jpg"
 *  - "/public/x.jpg" o URLs externas                → sin cambios
 */
export function resolveImageUrl(image: string): string {
  if (!image) return image;
  if (/^https?:\/\//i.test(image)) {
    try {
      const url = new URL(image);
      if (LEGACY_API_HOSTS.has(url.hostname) && url.pathname.startsWith('/public/')) return url.pathname;
    } catch {
      return image;
    }
    return image;
  }
  if (image.startsWith('/') && !image.startsWith('/public/')) return `/public${image}`;
  return image;
}
