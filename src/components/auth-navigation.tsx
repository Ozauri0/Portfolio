'use client';

import Link from 'next/link';
import { LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

// Controles de sesión dentro del header: misma altura y estilo que el selector de idioma.
// No muestra nada si no hay sesión (el acceso al login es secreto).
export default function AuthNavigation() {
  const { language } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated || !user) return null;

  // El rol viene en la respuesta de login/refresh; la autorización real se valida en la API
  const isAdmin = user.role === 'admin';
  const logoutLabel = language === 'es' ? 'Cerrar sesión' : 'Log out';

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div
      className="flex items-center gap-0.5 rounded-full border border-white/10 bg-white/5 p-0.5 text-xs font-semibold"
      title={user.fullName || user.email}
    >
      {isAdmin && (
        <Link
          href="/admin"
          aria-label="Admin"
          className="inline-flex h-6 items-center gap-1.5 rounded-full px-2 text-purple-200 transition-colors hover:bg-purple-500/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 lg:px-2.5"
        >
          <Shield className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden lg:inline">Admin</span>
        </Link>
      )}
      <button
        type="button"
        onClick={handleLogout}
        aria-label={logoutLabel}
        title={logoutLabel}
        className="grid h-6 w-6 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-red-500/20 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
