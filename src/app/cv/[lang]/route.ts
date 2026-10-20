import { readFile } from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

// Los CV viven en /cv (fuera de public/: en producción public/ es un volumen de Docker compartido con la API,
// y un archivo nuevo dentro de la imagen no aparecería). El Dockerfile copia /cv junto al servidor.
const FILES: Record<string, { file: string; download: string }> = {
  es: { file: 'cv-es.pdf', download: 'Christian_Ferrer_CV_ES.pdf' },
  en: { file: 'cv-en.pdf', download: 'Christian_Ferrer_CV_EN.pdf' },
};

export async function GET(_request: NextRequest, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const entry = FILES[lang];
  if (!entry) return NextResponse.json({ error: 'CV no encontrado' }, { status: 404 });

  try {
    const pdf = await readFile(path.join(process.cwd(), 'cv', entry.file));
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${entry.download}"`,
        'Content-Length': String(pdf.length),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'CV no disponible' }, { status: 404 });
  }
}
