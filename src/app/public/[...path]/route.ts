import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  const apiUrl = process.env.INTERNAL_API_URL || 'http://portfolio-api:5000';
  const { pathname, search } = request.nextUrl;
  const url = `${apiUrl}${pathname}${search}`;

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower !== 'host' && lower !== 'connection' && lower !== 'transfer-encoding') {
      headers[key] = value;
    }
  });

  try {
    const response = await fetch(url, { headers, cache: 'no-store' });
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
  } catch {
    return new NextResponse('File not found', { status: 404 });
  }
}
