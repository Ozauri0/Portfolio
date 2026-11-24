import { proxyRequest } from '@/lib/apiProxy';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;
