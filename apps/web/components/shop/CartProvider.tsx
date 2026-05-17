'use client';

import { createContext, useContext, useState, useCallback } from 'react';

interface CartUIContext {
  open: boolean;
  show: () => void;
  hide: () => void;
}

const Ctx = createContext<CartUIContext | null>(null);

export function useCartUI() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCartUI: falta <CartProvider>');
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => setOpen(false), []);
  return <Ctx.Provider value={{ open, show, hide }}>{children}</Ctx.Provider>;
}
