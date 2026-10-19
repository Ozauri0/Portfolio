// Detección de navegador/dispositivo a partir del User-Agent.
// El orden importa: los UA de Edge/Opera/Chrome iOS también contienen "Chrome" y "Safari",
// y el de Chrome contiene "Safari", por lo que se comprueban de más a menos específico.
export function getBrowserName(userAgent: string): string {
  const ua = userAgent || '';
  if (/Edg(e|A|iOS)?\//.test(ua)) return 'Edge';
  if (/OPR\/|Opera|OPiOS/.test(ua)) return 'Opera';
  if (/Firefox\/|FxiOS\//.test(ua)) return 'Firefox';
  if (/Chrome\/|CriOS\//.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua)) return 'Safari';
  return 'Desconocido';
}

export function getDeviceType(userAgent: string): string {
  const ua = userAgent || '';
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return 'Tablet';
  if (/iPhone|iPod|Mobile|Android/i.test(ua)) return 'Móvil';
  return 'Escritorio';
}
