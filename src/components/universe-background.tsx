'use client';

import { useEffect, useRef, useState } from 'react';

// Variantes para comparar (se elige con ?bg=galaxy | warp | nebula | planet; sin parámetro: base)
export type UniverseVariant = 'base' | 'galaxy' | 'warp' | 'nebula' | 'planet' | 'orbit';
const VARIANTS: UniverseVariant[] = ['base', 'galaxy', 'warp', 'nebula', 'planet', 'orbit'];

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
interface Point3 { x: number; y: number; z: number; c: string; s: number }

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
    // Variante "orbit": cámara 3D que sigue al cursor, campo de estrellas con profundidad,
    // planeta de puntos y anillo orbital detrás del avatar
    let deep: Point3[] = [];
    let sphere: Point3[] = [];
    let ring: Point3[] = [];
    let mouseX = 0, mouseY = 0, camX = 0, camY = 0;

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

      if (variant === 'orbit') {
        const nDeep = Math.round(Math.min(Math.max((w * h) / 2600, 260), 620));
        deep = Array.from({ length: nDeep }, () => ({
          x: rand(-1.6, 1.6), y: rand(-1.1, 1.1), z: rand(0.08, 1),
          c: PALETTE[Math.floor(Math.random() * PALETTE.length)], s: rand(0.6, 1.4),
        }));
        // Esfera de Fibonacci: puntos repartidos uniformemente; color según latitud (azul -> violeta)
        const nSphere = w < 768 ? 520 : 900;
        const golden = Math.PI * (3 - Math.sqrt(5));
        sphere = Array.from({ length: nSphere }, (_, i) => {
          const y = 1 - (i / (nSphere - 1)) * 2;
          const r = Math.sqrt(1 - y * y);
          const th = golden * i;
          return { x: Math.cos(th) * r, y, z: Math.sin(th) * r, c: y > 0.2 ? '150,190,255' : y > -0.35 ? '170,160,255' : '196,140,255', s: 1 };
        });
        const nRing = w < 768 ? 320 : 560;
        ring = Array.from({ length: nRing }, () => {
          const a = rand(0, Math.PI * 2), rr = rand(1.35, 1.85);
          return { x: Math.cos(a) * rr, y: rand(-0.025, 0.025), z: Math.sin(a) * rr, c: Math.random() < 0.5 ? '235,240,255' : '196,160,255', s: rand(0.6, 1.5) };
        });
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

    // Rotación de un punto 3D (yaw alrededor de Y, pitch alrededor de X)
    const rotate = (p: { x: number; y: number; z: number }, yaw: number, pitch: number) => {
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      const x1 = p.x * cy + p.z * sy, z1 = -p.x * sy + p.z * cy;
      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      return { x: x1, y: p.y * cp - z1 * sp, z: p.y * sp + z1 * cp };
    };

    const drawDeep = (dt: number) => {
      const f = Math.min(w, h) * 0.9, cx = w / 2 + camX * w * 0.04, cy = h / 2 + camY * h * 0.04;
      const speed = reduced.matches ? 0 : (0.018 + boost * 0.09) * dt / 1000;
      for (const p of deep) {
        p.z -= speed;
        if (p.z < 0.06) { p.z = 1; p.x = rand(-1.6, 1.6); p.y = rand(-1.1, 1.1); }
        // la cámara gira levemente con el cursor: las estrellas cercanas se desplazan más (paralaje 3D real)
        const x = p.x - camX * 0.12 * (1 - p.z), y = p.y - camY * 0.08 * (1 - p.z);
        const px = cx + (x / p.z) * f * 0.5, py = cy + (y / p.z) * f * 0.5;
        if (px < -10 || px > w + 10 || py < -10 || py > h + 10) continue;
        const near = 1 - p.z;
        ctx.globalAlpha = Math.min(1, 0.15 + near * 1.1);
        ctx.fillStyle = `rgb(${p.c})`;
        const size = p.s * (0.5 + near * 2.2);
        ctx.fillRect(px - size / 2, py - size / 2, size, size);
      }
    };

    const drawOrbit = () => {
      const anchor = document.querySelector('[data-universe-anchor]');
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      if (rect.bottom < -rect.height * 2 || rect.top > h + rect.height * 2) return;
      const ox = rect.left + rect.width / 2, oy = rect.top + rect.height / 2;
      const R = rect.width * (w < 768 ? 0.6 : 0.78); // en móvil más contenido para no cruzar el texto
      const t = reduced.matches ? 0.8 : time / 1000;
      const yaw = t * 0.18 + camX * 0.35, pitch = -0.32 + camY * 0.2;
      const persp = (z: number) => 6 / (6 + z); // cámara lejana: perspectiva suave
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      // halo suave detrás del planeta
      ctx.globalAlpha = 0.55;
      ctx.drawImage(core, ox - R * 1.6, oy - R * 1.6, R * 3.2, R * 3.2);
      for (const p of sphere) {
        const q = rotate(p, yaw, pitch);
        const k = persp(q.z);
        const front = (1 - q.z) / 2; // 1 = cara visible
        ctx.globalAlpha = 0.12 + front * 0.75;
        ctx.fillStyle = `rgb(${p.c})`;
        const size = Math.min(2.4, (0.8 + front * 1.3) * k);
        ctx.fillRect(ox + q.x * R * k - size / 2, oy + q.y * R * k - size / 2, size, size);
      }
      // anillo inclinado que gira en sentido contrario
      // inclinado como el de Saturno: casi horizontal visto desde arriba y girado en diagonal (roll)
      const ringYaw = -t * 0.32 + camX * 0.35, ringPitch = pitch - 0.08, roll = -0.42;
      const cr = Math.cos(roll), sr = Math.sin(roll);
      for (const p of ring) {
        const r0 = rotate(p, ringYaw, ringPitch);
        const q = { x: r0.x * cr - r0.y * sr, y: r0.x * sr + r0.y * cr, z: r0.z };
        const k = persp(q.z);
        const front = Math.max(0, Math.min(1, (1.6 - q.z) / 3.2));
        ctx.globalAlpha = 0.3 + front * 0.65;
        ctx.fillStyle = `rgb(${p.c})`;
        const size = Math.min(2.6, p.s * (0.8 + front * 1.1) * k);
        ctx.fillRect(ox + q.x * R * k - size / 2, oy + q.y * R * k - size / 2, size, size);
      }
      ctx.restore();
    };

    const draw = (now: number, dt: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const scroll = window.scrollY;

      if (variant === 'orbit') {
        camX += (mouseX - camX) * 0.05; camY += (mouseY - camY) * 0.05;
        drawDeep(dt);
        drawOrbit();
      }
      if (variant === 'galaxy') drawGalaxy();
      if (variant === 'warp' && !reduced.matches) drawWarp(dt);

      for (const s of stars) {
        if (variant === 'orbit' && s.layer !== 0) continue;
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
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      root.style.setProperty('--mx', String(mouseX));
      root.style.setProperty('--my', String(mouseY));
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
