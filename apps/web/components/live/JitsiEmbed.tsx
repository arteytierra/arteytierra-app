'use client';

import { useEffect, useRef } from 'react';

/**
 * Embed Jitsi via iframe. Requiere allow-camera/microphone.
 * Si en el futuro querés más control, switch a la SDK iframe `external_api.js`.
 */
export function JitsiEmbed({ url }: { url: string }) {
  const ref = useRef<HTMLIFrameElement | null>(null);

  // Foco automático al iframe para que captures clicks/keyboard.
  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <iframe
      ref={ref}
      src={url}
      title="Aula en vivo"
      allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
      sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      className="block w-full"
      style={{ height: 'calc(100vh - 65px)', border: 0 }}
    />
  );
}
