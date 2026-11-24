'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import AuthNavigation from '@/components/auth-navigation';
import { cn } from '@/lib/utils';

// Secciones de la página (deben existir con estos id en el DOM)
export const SECTION_IDS = ['home', 'about', 'skills', 'projects', 'contact'] as const;
type SectionId = (typeof SECTION_IDS)[number];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}

export default function SiteHeader() {
  const { language, setLanguage } = useLanguage();
  const t = translations[language].nav;

  const [active, setActive] = useState<SectionId>('home');
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLUListElement>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  // Estado de scroll: fondo más opaco al bajar + barra de progreso de lectura
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setScrolled(y > 24);
        setProgress(max > 0 ? Math.min(1, y / max) : 0);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Sección activa: la que cruza la franja central del viewport
  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActive(visible.target.id as SectionId);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Posición de la "píldora" que marca el enlace activo (desktop)
  const measure = useCallback(() => {
    const list = linksRef.current;
    const link = list?.querySelector<HTMLElement>(`[data-section="${active}"]`);
    if (!list || !link) return;
    setIndicator({ left: link.offsetLeft, width: link.offsetWidth });
  }, [active]);

  useLayoutEffect(() => {
    measure();
  }, [measure, language]);

  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  // Menú móvil: cerrar con Escape o al tocar fuera
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    const onClick = (e: MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [menuOpen]);

  const go = (id: SectionId) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    scrollToSection(id);
  };

  const links = SECTION_IDS.map((id) => ({ id, label: t[id] }));

  return (
    <>
      {/* Barra de progreso de lectura */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"
        style={{ transform: `scaleX(${progress})` }}
      />

      <header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3 md:pt-4"
      >
        <div className="w-full max-w-6xl">
          <nav
            aria-label="Principal"
            className={cn(
              'flex items-center justify-between gap-3 rounded-full border px-3 py-2 transition-all duration-300 md:px-4',
              scrolled || menuOpen
                ? 'border-white/10 bg-black/70 shadow-lg shadow-black/40 backdrop-blur-xl'
                : 'border-white/5 bg-black/20 backdrop-blur-md',
            )}
          >
            {/* Marca */}
            <a
              href="#home"
              onClick={go('home')}
              className="group flex shrink-0 items-center rounded-full px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-sm font-semibold tracking-wide text-transparent transition-colors duration-300 group-hover:from-blue-400 group-hover:to-purple-500 sm:text-base">
                Christian Ferrer
              </span>
            </a>

            {/* Enlaces (desktop) */}
            <ul ref={linksRef} className="relative hidden items-center md:flex">
              {indicator && (
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 rounded-full bg-white/10 ring-1 ring-white/10 transition-all duration-300 ease-out"
                  style={{ left: indicator.left, width: indicator.width }}
                />
              )}
              {links.map(({ id, label }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    data-section={id}
                    onClick={go(id)}
                    aria-current={active === id ? 'true' : undefined}
                    className={cn(
                      'relative block rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
                      active === id ? 'text-white' : 'text-zinc-400 hover:text-white',
                    )}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Acciones */}
            <div className="flex items-center gap-2">
              <AuthNavigation />

              {/* Selector de idioma segmentado */}
              <div
                role="group"
                aria-label="Language"
                className="relative grid grid-cols-2 rounded-full border border-white/10 bg-white/5 p-0.5 text-xs font-semibold"
              >
                {/* Indicador que se desliza entre ES y EN */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                    language === 'en' && 'translate-x-full',
                  )}
                />
                {(['es', 'en'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    aria-pressed={language === lang}
                    className={cn(
                      'relative z-10 rounded-full px-2.5 py-1 uppercase transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
                      language === lang ? 'text-black' : 'text-zinc-400 hover:text-white',
                    )}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              {/* CTA (desktop) */}
              <a
                href="#contact"
                onClick={go('contact')}
                className="hidden items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition-all duration-200 hover:bg-zinc-200 hover:shadow-md hover:shadow-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 lg:inline-flex"
              >
                {t.cta}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>

              {/* Botón menú (móvil) */}
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav"
                aria-label={menuOpen ? t.closeMenu : t.openMenu}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 md:hidden"
              >
                {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </nav>

          {/* Panel móvil */}
          <div
            id="mobile-nav"
            className={cn(
              'mt-2 origin-top overflow-hidden rounded-3xl border border-white/10 bg-black/80 backdrop-blur-xl transition-all duration-300 md:hidden',
              menuOpen ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0',
            )}
            aria-hidden={!menuOpen}
          >
            <ul className="flex flex-col p-2">
              {links.map(({ id, label }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={go(id)}
                    tabIndex={menuOpen ? 0 : -1}
                    aria-current={active === id ? 'true' : undefined}
                    className={cn(
                      'flex items-center justify-between rounded-2xl px-4 py-3 text-base font-medium transition-colors',
                      active === id ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white',
                    )}
                  >
                    {label}
                    {active === id && (
                      <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-500" />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>
    </>
  );
}
