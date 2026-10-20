'use client';

import { useEffect, useRef, useState } from 'react';

// Variantes para comparar (se elige con ?bg=galaxy | warp | nebula | planet; sin parámetro: base)
export type UniverseVariant = 'base' | 'galaxy' | 'warp' | 'nebula' | 'planet';
const VARIANTS: UniverseVariant[] = ['base', 'galaxy', 'warp', 'nebula', 'planet'];

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

interface GalaxyDot { arm: number; t: number; off: number; size: number; alpha: number; color: string }
interface WarpStar { a: number; r: number; k: number; w: number }

// Profundidad: las capas cercanas se mueven más al hacer scroll y derivan más rápido
const PARALLAX = [0.04, 0.1, 0.22];
const DRIFT = [1.2, 2.6, 5]; // px/s en horizontal
const PALETTE = ['235,240,255', '235,240,255', '235,240,255', '255,244,225', '150,190,255', '196,160,255'];

function rand(min: number, max: number) { return min + Math.random() * (max - min); }

// Fondo global: cielo estrellado fijo detrás de todo el contenido. Las secciones con fondo propio
// (zinc-900) lo tapan; donde el fondo es transparente se ve el universo.
export default function UniverseBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [variant, setVariant] = useState<UniverseVariant>('base');

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('bg') as UniverseVariant | null;
    if (requested && VARIANTS.includes(requested)) setVariant(requested);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !root || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let w = 0, h = 0, dpr = 1;
    let stars: Star[] = [];
    let galaxy: GalaxyDot[] = [];
    let warp: WarpStar[] = [];
    let shooting: Shooting | null = null;
    let nextShoot = performance.now() + rand(3000, 6000);
    let raf = 0, last = performance.now(), time = 0;
    let lastScroll = window.scrollY, boost = 0;

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

    // Sprite del núcleo de la galaxia
    const core = document.createElement('canvas');
    core.width = core.height = 256;
    const c = core.getContext('2d')!;
    const cg = c.createRadialGradient(128, 128, 0, 128, 128, 128);
    cg.addColorStop(0, 'rgba(255,244,225,0.95)');
    cg.addColorStop(0.12, 'rgba(255,214,170,0.55)');
    cg.addColorStop(0.35, 'rgba(120,150,255,0.22)');
    cg.addColorStop(0.7, 'rgba(168,85,247,0.08)');
    cg.addColorStop(1, 'rgba(168,85,247,0)');
    c.fillStyle = cg;
    c.fillRect(0, 0, 256, 256);

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

      // Galaxia espiral: dos brazos logarítmicos, más densos hacia el núcleo
      galaxy = [];
      if (variant === 'galaxy') {
        const n = Math.round(Math.min(Math.max((w * h) / 650, 1400), 2800));
        for (let i = 0; i < n; i++) {
          const t = Math.pow(Math.random(), 0.75);
          const color = t < 0.14 ? '255,244,225' : t < 0.5 ? '165,195,255' : t < 0.8 ? '190,165,255' : '230,170,255';
          galaxy.push({
            arm: i % 2, t, off: rand(-1, 1) * (0.55 - t * 0.35),
            size: rand(0.7, 1.7) * (t < 0.14 ? 1.2 : 1), alpha: rand(0.25, 0.95) * (1 - t * 0.45), color,
          });
        }
      }

      // Hiperespacio: estrellas que salen del centro; el scroll las acelera
      warp = [];
      if (variant === 'warp') {
        const n = Math.round(Math.min(Math.max((w * h) / 4500, 120), 360));
        warp = Array.from({ length: n }, () => ({ a: rand(0, Math.PI * 2), r: Math.pow(Math.random(), 1.6) * Math.hypot(w, h) * 0.6, k: rand(0.5, 1.5), w: rand(0.5, 1.5) }));
      }
    };

    const drawGalaxy = () => {
      const cx = w * (w < 768 ? 0.5 : 0.74);
      const cy = h * (w < 768 ? 0.22 : 0.3) - window.scrollY * 0.1;
      const R = Math.min(w, h) * (w < 768 ? 0.5 : 0.62);
      const tilt = 0.42, spin = reduced.matches ? 0.6 : time / 1000 * 0.045;
      if (cy < -R || cy > h + R) return;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.9;
      const gs = R * 0.95;
      ctx.drawImage(core, cx - gs, cy - gs * tilt, gs * 2, gs * 2 * tilt);
      for (const p of galaxy) {
        const theta = p.arm * Math.PI + p.t * 2.7 * Math.PI + p.off + spin;
        const rr = p.t * R;
        const x = cx + Math.cos(theta) * rr;
        const y = cy + Math.sin(theta) * rr * tilt;
        ctx.globalAlpha = p.alpha * (reduced.matches ? 1 : 0.8 + 0.2 * Math.sin(time / 700 + p.t * 40));
        ctx.fillStyle = `rgb(${p.color})`;
        ctx.fillRect(x, y, p.size, p.size);
      }
      ctx.restore();
    };

    const drawWarp = (dt: number) => {
      const cx = w * 0.5, cy = h * 0.46, max = Math.hypot(w, h) * 0.62;
      ctx.save();
      ctx.lineCap = 'round';
      for (const s of warp) {
        const speed = (22 + s.r * 0.22) * s.k * (0.28 + boost) * dt / 1000;
        const r0 = s.r, r1 = s.r + speed;
        s.r = r1;
        if (s.r > max) { s.r = rand(4, 70); s.a = rand(0, Math.PI * 2); continue; }
        const f = Math.min(1, r1 / (max * 0.8));
        const x1 = cx + Math.cos(s.a) * r1, y1 = cy + Math.sin(s.a) * r1;
        const tail = Math.max(r0, r1 - (3 + boost * 70) * f);
        const x0 = cx + Math.cos(s.a) * tail, y0 = cy + Math.sin(s.a) * tail;
        ctx.strokeStyle = `rgba(${f > 0.55 ? '200,185,255' : '150,190,255'},${0.15 + 0.75 * f})`;
        ctx.lineWidth = (0.4 + f * 1.4) * s.w;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      }
      ctx.restore();
    };

    const draw = (now: number, dt: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const scroll = window.scrollY;

      if (variant === 'galaxy') drawGalaxy();
      if (variant === 'warp' && !reduced.matches) drawWarp(dt);

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

      // El scroll (velocidad suavizada) acelera el hiperespacio
      const sy = window.scrollY;
      boost += (Math.min(Math.abs(sy - lastScroll) / 14, 5) - boost) * 0.08;
      lastScroll = sy;
      root.style.setProperty('--sy', String(sy));

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
      draw(now, dt);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      build();
      if (reduced.matches) { draw(performance.now(), 16); return; } // cielo estático
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    // Paralaje con el cursor (nebulosas y planeta)
    const onPointer = (e: PointerEvent) => {
      root.style.setProperty('--mx', String((e.clientX / window.innerWidth - 0.5) * 2));
      root.style.setProperty('--my', String((e.clientY / window.innerHeight - 0.5) * 2));
    };

    start();
    window.addEventListener('resize', start);
    reduced.addEventListener('change', start);
    if (!reduced.matches) window.addEventListener('pointermove', onPointer, { passive: true });
    // En modo estático el scroll no redibuja solo: repintar al desplazarse
    const onScroll = () => { if (reduced.matches) draw(performance.now(), 16); };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', start);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      reduced.removeEventListener('change', start);
    };
  }, [variant]);

  return (
    <div ref={rootRef} aria-hidden="true" data-universe={variant} className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Nebulosas en los colores de la marca; en la variante "nebula" son mucho más intensas y siguen al cursor */}
      <div className={`${variant === 'nebula' ? 'universe-nebula-rich' : 'universe-nebula'} absolute -inset-[20%]`} />
      {variant === 'planet' && (
        <>
          <div className="universe-planet-glow" />
          <div className="universe-planet" />
        </>
      )}
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
