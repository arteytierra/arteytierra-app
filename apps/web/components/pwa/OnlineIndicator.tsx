'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Banner que aparece cuando se pierde conexión y desaparece al recuperarla.
 * Muestra 2s un mensaje de "conexión restablecida" cuando vuelve.
 */
export function OnlineIndicator() {
  const [online, setOnline] = useState(true);
  const [showRecovered, setShowRecovered] = useState(false);

  useEffect(() => {
    setOnline(navigator.onLine);

    const onUp = () => {
      setOnline(true);
      setShowRecovered(true);
      setTimeout(() => setShowRecovered(false), 2200);
    };
    const onDown = () => setOnline(false);

    window.addEventListener('online', onUp);
    window.addEventListener('offline', onDown);
    return () => {
      window.removeEventListener('online', onUp);
      window.removeEventListener('offline', onDown);
    };
  }, []);

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-0 inset-x-0 z-[70] bg-amber-100 text-amber-900 text-sm px-4 py-2 flex items-center justify-center gap-2"
          role="status"
        >
          <WifiOff size={14} /> Estás offline. Algunas funciones estarán limitadas.
        </motion.div>
      )}
      {online && showRecovered && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-0 inset-x-0 z-[70] bg-leaf/15 text-leaf text-sm px-4 py-2 flex items-center justify-center gap-2"
          role="status"
        >
          <Wifi size={14} /> Conexión restablecida.
        </motion.div>
      )}
    </AnimatePresence>
  );
}
