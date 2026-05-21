'use client';

import { ToastProvider } from '@arteytierra/ui';
import { CartProvider } from '@/components/shop/CartProvider';
import { CourseCartProvider } from '@/components/shop/CourseCartProvider';
import { CartSheet } from '@/components/shop/CartSheet';

export function SiteProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <CartProvider>
        <CourseCartProvider>
          {children}
          <CartSheet />
        </CourseCartProvider>
      </CartProvider>
    </ToastProvider>
  );
}
