import { proxyRequest } from '@/lib/apiProxy';

// Imágenes subidas: las sirve la API en /public/*, se exponen en el mismo dominio vía proxy
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const GET = proxyRequest;
export const HEAD = proxyRequest;
