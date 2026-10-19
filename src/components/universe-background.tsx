'use client';

import { useEffect, useRef } from 'react';

interface Star {
  x: number; // 0..1 del ancho
  y: number; // 0..1 del alto
  layer: 0 | 1 | 2; // 0 = lejana, 2 = cercana
  r: number;
  alpha: number;
  speed: number;
  phase: number;
  color: string; // "r,g,b"
  glow: boolean;
}

interface Shooting {
  x: number; y: number; vx: number; vy: number; life: number; length: number;
}

// Profundidad: las capas cercanas se mueven más al hacer scroll y derivan más rápido
const PARALLAX = [0.04, 0.1, 0.22];
const DRIFT = [1.2, 2.6, 5]; // px/s en horizontal
const PALETTE = ['235,240,255', '235,240,255', '235,240,255', '255,244,225', '150,190,255', '196,160,255'];

function rand(min: number, max: number) { return min + Math.random() * (max - min); }

// Fondo global: cielo estrellado fijo detrás de todo el contenido. Las secciones con fondo propio
// (zinc-900) lo tapan; donde el fondo es transparente se ve el universo.
export default function UniverseBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let w = 0, h = 0, dpr = 1;
    let stars: Star[] = [];
    let shooting: Shooting | null = null;
    let nextShoot = performance.now() + rand(3000, 6000);
    let raf = 0, last = performance.now(), time = 0;

    // Sprite de brillo para las estrellas más cercanas (se genera una sola vez)
    const glow = document.createElement('canvas');
    glow.width = glow.height = 64;
    const g = glow.getContext('2d')!;
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,0.9)');
    grad.addColorStop(0.15, 'rgba(200,215,255,0.35)');
    grad.addColorStop(1, 'rgba(200,215,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      const count = Math.round(Math.min(Math.max((w * h) / 7000, 90), 280));
      stars = Array.from({ length: count }, () => {
        const layer = (Math.random() < 0.6 ? 0 : Math.random() < 0.75 ? 1 : 2) as 0 | 1 | 2;
        return {
          x: Math.random(), y: Math.random(), layer,
          r: layer === 0 ? rand(0.4, 0.9) : layer === 1 ? rand(0.7, 1.3) : rand(1.1, 1.9),
          alpha: layer === 0 ? rand(0.25, 0.55) : layer === 1 ? rand(0.45, 0.8) : rand(0.7, 1),
          speed: rand(0.4, 1.6), phase: rand(0, Math.PI * 2),
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          glow: layer === 2 && Math.random() < 0.35,
        };
      });
    };

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const scroll = window.scrollY;

      for (const s of stars) {
        const px = (((s.x * w + time * DRIFT[s.layer] / 1000) % w) + w) % w;
        const py = (((s.y * h - scroll * PARALLAX[s.layer]) % h) + h) % h;
        const twinkle = reduced.matches ? 1 : 0.65 + 0.35 * Math.sin(time / 1000 * s.speed + s.phase);
        const a = s.alpha * twinkle;
        if (s.glow) {
          ctx.globalAlpha = a * 0.8;
          ctx.drawImage(glow, px - 16, py - 16, 32, 32);
        }
        ctx.globalAlpha = a;
        ctx.fillStyle = `rgb(${s.color})`;
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Estrella fugaz ocasional, con la cola en el degradado de la marca (azul a violeta)
      if (shooting) {
        const sh = shooting;
        const tail = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * 0.12, sh.y - sh.vy * 0.12);
        tail.addColorStop(0, `rgba(235,240,255,${0.9 * sh.life})`);
        tail.addColorStop(0.4, `rgba(96,165,250,${0.45 * sh.life})`);
        tail.addColorStop(1, 'rgba(168,85,247,0)');
        ctx.globalAlpha = 1;
        ctx.strokeStyle = tail;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(sh.x - sh.vx * 0.12, sh.y - sh.vy * 0.12);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      void now;
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) { last = now; return; }
      const dt = Math.min(now - last, 64);
      last = now; time += dt;

      if (!shooting && now > nextShoot) {
        const angle = rand(0.35, 0.7); // radianes hacia abajo
        const speed = rand(700, 1000);
        shooting = {
          x: rand(w * 0.1, w * 0.9), y: rand(0, h * 0.35),
          vx: Math.cos(angle) * speed * (Math.random() < 0.5 ? 1 : -1), vy: Math.sin(angle) * speed,
          life: 1, length: rand(120, 220),
        };
      }
      if (shooting) {
        shooting.x += shooting.vx * dt / 1000;
        shooting.y += shooting.vy * dt / 1000;
        shooting.life -= dt / 900;
        if (shooting.life <= 0 || shooting.x < -50 || shooting.x > w + 50 || shooting.y > h + 50) {
          shooting = null;
          nextShoot = now + rand(7000, 14000);
        }
      }
      draw(now);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      build();
      if (reduced.matches) { draw(performance.now()); return; } // cielo estático
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    start();
    window.addEventListener('resize', start);
    reduced.addEventListener('change', start);
    // En modo estático el scroll no redibuja solo: repintar al desplazarse
    const onScroll = () => { if (reduced.matches) draw(performance.now()); };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', start);
      window.removeEventListener('scroll', onScroll);
      reduced.removeEventListener('change', start);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Nebulosas muy tenues en los colores de la marca; derivan lentamente */}
      <div className="universe-nebula absolute -inset-[20%]" />
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
