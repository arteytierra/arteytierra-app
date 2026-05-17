'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../utils/cn';

type ToastKind = 'success' | 'error' | 'info';
interface ToastItem { id: string; kind: ToastKind; message: string }

interface ToastCtx {
  toast: (kind: ToastKind, message: string) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast: falta <ToastProvider>');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((kind: ToastKind, message: string) => {
    const id = crypto.randomUUID();
    setItems((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => setItems((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 max-w-sm">
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 24, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              className={cn(
                'flex items-start gap-3 rounded-xl border bg-bone-50 shadow-raised p-4',
                t.kind === 'success' && 'border-success-500/30',
                t.kind === 'error'   && 'border-danger-500/30',
                t.kind === 'info'    && 'border-ink-950/10',
              )}
            >
              {t.kind === 'success' && <CheckCircle2 size={18} className="text-success-500 mt-0.5" />}
              {t.kind === 'error'   && <XCircle      size={18} className="text-danger-500  mt-0.5" />}
              {t.kind === 'info'    && <Info          size={18} className="text-water-500  mt-0.5" />}
              <p className="text-sm text-ink-950">{t.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
