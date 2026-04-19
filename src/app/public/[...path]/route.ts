import { NextRequest } from 'next/server';

const API_URL = process.env.INTERNAL_API_URL || 'http://portfolio-api:5000';

export async function GET(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const url = `${API_URL}${pathname}${search}`;

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('connection');

  try {
    const response = await fetch(url, { headers });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('transfer-encoding');
    responseHeaders.delete('connection');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch {
    return new Response('File not found', { status: 404 });
  }
}
