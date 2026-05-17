'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { cn } from '../utils/cn';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  side?: 'right' | 'left' | 'bottom';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const variantsBySide: Record<'right' | 'left' | 'bottom', Variants> = {
  right: {
    hidden:  { x: '100%' },
    visible: { x: 0 },
    exit:    { x: '100%' },
  },
  left: {
    hidden:  { x: '-100%' },
    visible: { x: 0 },
    exit:    { x: '-100%' },
  },
  bottom: {
    hidden:  { y: '100%' },
    visible: { y: 0 },
    exit:    { y: '100%' },
  },
};

export function Sheet({ open, onClose, side = 'right', title, children, className }: SheetProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const sideClass = {
    right:  'right-0 top-0 h-full w-full max-w-md',
    left:   'left-0 top-0 h-full w-full max-w-md',
    bottom: 'bottom-0 left-0 right-0 max-h-[90vh] w-full rounded-t-2xl',
  }[side];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            variants={variantsBySide[side]}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'absolute bg-bone-50 shadow-float flex flex-col',
              sideClass,
              className,
            )}
          >
            <header className="flex items-center justify-between p-6 border-b border-ink-950/10">
              {title && <h2 className="font-display text-xl">{title}</h2>}
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="ml-auto rounded-full p-2 text-ink-800/60 hover:bg-bone-100"
              >
                <X size={18} />
              </button>
            </header>
            <div className="flex-1 overflow-auto p-6">{children}</div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
