import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from '@/lib/clientIp';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

async function proxyRequest(request: NextRequest) {
  const apiUrl = process.env.INTERNAL_API_URL || 'http://portfolio-api:5000';
  const { pathname, search } = request.nextUrl;
  const url = `${apiUrl}${pathname}${search}`;

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (
      lower !== 'host' &&
      lower !== 'connection' &&
      lower !== 'transfer-encoding' &&
      lower !== 'x-forwarded-for' &&
      lower !== 'x-real-ip'
    ) {
      headers[key] = value;
    }
  });
  // Reescribir la IP del cliente: se descarta lo que envió el cliente en estos headers
  const clientIp = getClientIp(request.headers);
  if (clientIp !== 'unknown') headers['x-forwarded-for'] = clientIp;

  const fetchOptions: RequestInit & { duplex?: string } = {
    method: request.method,
    headers,
    cache: 'no-store',
  };

  if (!['GET', 'HEAD'].includes(request.method)) {
    fetchOptions.body = await request.arrayBuffer();
  }

  try {
    const response = await fetch(url, fetchOptions);
    const data = await response.arrayBuffer();

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (lower !== 'transfer-encoding' && lower !== 'connection' && lower !== 'content-length') {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error('[API Proxy Error]', url, err);
    return NextResponse.json({ error: 'API unavailable' }, { status: 502 });
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;
