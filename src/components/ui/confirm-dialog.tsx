'use client';

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Diálogo modal accesible basado en <dialog>: el navegador atrapa el foco, Esc lo cierra
// y se expone como alertdialog a los lectores de pantalla (igual en Chrome, Firefox y Safari).
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      role="alertdialog"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      onCancel={(e) => {
        // Esc: dejar que el estado del padre controle el cierre
        e.preventDefault();
        if (!loading) onCancel();
      }}
      onClick={(e) => {
        if (e.target === ref.current && !loading) onCancel();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-0 text-white shadow-2xl backdrop:bg-black/70"
    >
      <div className="p-6">
        <h2 id="confirm-dialog-title" className="text-lg font-bold">{title}</h2>
        <p id="confirm-dialog-message" className="mt-2 text-sm text-gray-300">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" className="text-gray-300 hover:text-white" onClick={onCancel} disabled={loading} autoFocus>
            {cancelLabel}
          </Button>
          <Button type="button" className="bg-red-600 text-white hover:bg-red-700" onClick={onConfirm} disabled={loading}>
            {loading ? 'Procesando...' : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
