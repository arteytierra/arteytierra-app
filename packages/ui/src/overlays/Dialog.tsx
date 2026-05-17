'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils/cn';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handle = () => onClose();
    el.addEventListener('close', handle);
    return () => el.removeEventListener('close', handle);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        'rounded-2xl bg-bone-50 shadow-float border border-ink-950/10 p-0',
        'backdrop:bg-ink-950/40 backdrop:backdrop-blur-sm',
        'open:animate-fade-up',
        'w-full max-w-lg',
        className,
      )}
    >
      {(title || true) && (
        <header className="flex items-start justify-between p-6 pb-3">
          {title && <h2 className="font-display text-2xl">{title}</h2>}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="ml-auto -mr-2 -mt-2 rounded-full p-2 text-ink-800/60 hover:bg-bone-100"
          >
            <X size={18} />
          </button>
        </header>
      )}
      <div className="p-6 pt-3">{children}</div>
    </dialog>
  );
}
