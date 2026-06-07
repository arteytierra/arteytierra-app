'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type ModalState =
  | { type: 'confirm';  message: string; onConfirm: () => void; onCancel?: () => void }
  | { type: 'prompt';   message: string; placeholder?: string; defaultValue?: string; onConfirm: (value: string) => void; onCancel?: () => void }
  | { type: 'alert';    message: string; onClose?: () => void };

// ─── Componente ───────────────────────────────────────────────────────────────

interface Props {
  modal:    ModalState | null;
  onClose:  () => void;
}

export function Modal({ modal, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (modal?.type === 'prompt') setTimeout(() => inputRef.current?.focus(), 50);
  }, [modal]);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); handleCancel(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal]);

  if (!modal) return null;

  function handleCancel() {
    const m = modal;
    if (!m) return;
    if (m.type === 'confirm') m.onCancel?.();
    if (m.type === 'prompt')  m.onCancel?.();
    if (m.type === 'alert')   m.onClose?.();
    onClose();
  }

  function handleConfirm() {
    const m = modal;
    if (!m) return;
    if (m.type === 'confirm') { m.onConfirm(); onClose(); return; }
    if (m.type === 'alert')   { m.onClose?.(); onClose(); return; }
    if (m.type === 'prompt') {
      const val = inputRef.current?.value ?? '';
      if (val.trim()) { m.onConfirm(val.trim()); onClose(); }
    }
  }

  const isConfirm = modal.type === 'confirm';
  const isPrompt  = modal.type === 'prompt';
  const isAlert   = modal.type === 'alert';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={handleCancel} />

      {/* Caja */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-bone-200 w-full max-w-sm p-5 space-y-4">
        {/* Cierre */}
        <button onClick={handleCancel} className="absolute top-3 right-3 text-ink-700/30 hover:text-ink-700 transition-colors">
          <X className="w-4 h-4" />
        </button>

        {/* Mensaje */}
        <p className="text-sm text-ink-800 leading-relaxed pr-5">{modal.message}</p>

        {/* Input para prompt */}
        {isPrompt && (
          <input
            ref={inputRef}
            type="text"
            defaultValue={modal.defaultValue ?? ''}
            placeholder={modal.placeholder ?? ''}
            onKeyDown={e => e.key === 'Enter' && handleConfirm()}
            className="w-full px-3 py-2 text-sm border border-bone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-moss-500/30 focus:border-moss-500"
          />
        )}

        {/* Botones */}
        <div className="flex gap-2 justify-end">
          {!isAlert && (
            <button
              onClick={handleCancel}
              className="px-4 py-1.5 text-sm text-ink-700 border border-bone-200 rounded-lg hover:bg-bone-50 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              isConfirm
                ? 'bg-clay-600 hover:bg-clay-700 text-white'
                : 'bg-moss-700 hover:bg-moss-900 text-bone-50'
            }`}
          >
            {isAlert ? 'Aceptar' : isConfirm ? 'Eliminar' : 'Aceptar'}
          </button>
        </div>
      </div>
    </div>
  );
}
