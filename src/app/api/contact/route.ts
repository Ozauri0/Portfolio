import { NextRequest, NextResponse } from 'next/server';

// En memoria para rate limiting (VUL-005)
// En producción se podría reemplazar con Redis para entornos multi-instancia
const ipRequestMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutos

function getRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = ipRequestMap.get(ip);

  if (!entry || now >= entry.resetAt) {
    ipRequestMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

export async function POST(req: NextRequest) {
  // Obtener IP del cliente
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  // Rate limit server-side (VUL-005)
  const { allowed } = getRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Demasiados mensajes enviados. Espera 15 minutos.' },
      { status: 429 }
    );
  }

  let body: { name?: string; email?: string; subject?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la solicitud inválido.' }, { status: 400 });
  }

  const { name, email, subject, message } = body;

  // Validaciones
  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Nombre, email y mensaje son requeridos.' }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'El email no tiene un formato válido.' }, { status: 400 });
  }

  if (name.length > 100 || (subject && subject.length > 200) || message.length > 5000) {
    return NextResponse.json({ error: 'Los campos exceden la longitud permitida.' }, { status: 400 });
  }

  // Credenciales de EmailJS desde variables del servidor (sin NEXT_PUBLIC_) - VUL-020
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY; // Opcional pero recomendado

  if (!serviceId || !templateId || !publicKey) {
    console.error('Faltan variables de entorno de EmailJS en el servidor.');
    return NextResponse.json({ error: 'Configuración del servidor incompleta.' }, { status: 500 });
  }

  try {
    // Llamar al API REST de EmailJS desde el servidor (VUL-020)
    const emailPayload: Record<string, unknown> = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        from_name: name,
        reply_to: email,
        subject: subject || 'Mensaje desde Portfolio',
        message,
      },
    };

    if (privateKey) {
      emailPayload.accessToken = privateKey;
    }

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error de EmailJS:', response.status, errorText);
      return NextResponse.json({ error: 'Error al enviar el mensaje.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Mensaje enviado correctamente.' });
  } catch (error) {
    console.error('Error al llamar EmailJS:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
