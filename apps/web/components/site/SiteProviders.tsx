'use client';

import { MotionConfig } from 'framer-motion';
import { ToastProvider } from '@arteytierra/ui';
import { CartProvider } from '@/components/shop/CartProvider';
import { CourseCartProvider } from '@/components/shop/CourseCartProvider';
import { CartSheet } from '@/components/shop/CartSheet';

export function SiteProviders({ children }: { children: React.ReactNode }) {
  return (
    // `reducedMotion="user"` respeta la preferencia del sistema en todo lo que
    // anime framer-motion. El bloque de globals.css apaga las animaciones CSS,
    // pero framer anima con estilos en línea desde JavaScript y no se entera:
    // sin esto, el panel de notificaciones y el aviso de conexión seguían
    // deslizándose para alguien que pidió que nada se mueva.
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <CartProvider>
          <CourseCartProvider>
            {children}
            <CartSheet />
          </CourseCartProvider>
        </CartProvider>
      </ToastProvider>
    </MotionConfig>
  );
}
