'use client';

import { ShoppingBag } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../utils/cn';

export function CartButton({
  count = 0,
  onClick,
  className,
}: {
  count?: number;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={`Carrito (${count})`}
      className={cn(
        'relative inline-flex items-center justify-center rounded-full p-2.5 hover:bg-bone-100 transition-colors',
        className,
      )}
    >
      <ShoppingBag size={18} />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-moss-700 text-bone-50 text-[10px] flex items-center justify-center tabular-nums"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
