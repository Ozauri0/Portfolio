'use client';

import React, { useCallback, useEffect, useState } from 'react';

export interface ToastState {
  type: 'success' | 'error';
  message: string;
}

// Aviso no bloqueante (sustituye a alert()); se descarta solo a los 5 s
export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const show = useCallback((type: ToastState['type'], message: string) => setToast({ type, message }), []);
  const dismiss = useCallback(() => setToast(null), []);

  return { toast, show, dismiss };
}

export function Toast({ toast, onDismiss }: { toast: ToastState | null; onDismiss: () => void }) {
  if (!toast) return null;
  const isError = toast.type === 'error';
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`fixed bottom-4 right-4 z-[60] flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${
        isError
          ? 'border-red-800/60 bg-red-950 text-red-200'
          : 'border-green-800/60 bg-green-950 text-green-200'
      }`}
    >
      <span className="flex-1">{toast.message}</span>
      <button type="button" aria-label="Cerrar aviso" onClick={onDismiss} className="opacity-70 hover:opacity-100">×</button>
    </div>
  );
}
