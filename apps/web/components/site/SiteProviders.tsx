'use client';

import { ToastProvider } from '@arteytierra/ui';
import { CartProvider } from '@/components/shop/CartProvider';
import { CartSheet } from '@/components/shop/CartSheet';

export function SiteProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <CartProvider>
        {children}
        <CartSheet />
      </CartProvider>
    </ToastProvider>
  );
}
