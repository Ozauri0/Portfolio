import { NextRequest } from 'next/server';

const API_URL = process.env.INTERNAL_API_URL || 'http://portfolio-api:5000';

async function proxyRequest(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const url = `${API_URL}${pathname}${search}`;

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('connection');

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  if (!['GET', 'HEAD'].includes(request.method)) {
    init.body = request.body;
    // @ts-expect-error duplex is required for streaming request bodies
    init.duplex = 'half';
  }

  try {
    const response = await fetch(url, init);

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('transfer-encoding');
    responseHeaders.delete('connection');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch {
    return new Response(JSON.stringify({ error: 'API unavailable' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;
