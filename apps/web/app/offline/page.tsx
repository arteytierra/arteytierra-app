'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Container, Section, Button } from '@arteytierra/ui';
import { WifiOff, RefreshCw, BookOpen } from 'lucide-react';

export default function OfflinePage() {
  const [online, setOnline] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  function retry() {
    setRetrying(true);
    if (navigator.onLine) {
      window.location.reload();
    } else {
      setTimeout(() => setRetrying(false), 1200);
    }
  }

  return (
    <Section tone="bone" spacing="lg">
      <Container className="max-w-prose text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-bone-100 flex items-center justify-center">
          <WifiOff className="h-7 w-7 text-mute" />
        </div>
        <p className="mt-6 text-xs uppercase tracking-[0.16em] text-clay-700">Sin conexión</p>
        <h1 className="font-display text-4xl mt-2">Estás offline.</h1>
        <p className="mt-4 text-ink-800/75">
          No detectamos conexión a internet.{' '}
          {online
            ? '¡La conexión volvió! Refrescá para retomar.'
            : 'Cuando vuelvas, podés refrescar.'}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={retry} disabled={retrying} variant="moss">
            <RefreshCw size={14} className={retrying ? 'animate-spin' : ''} />
            {online ? 'Reintentar' : 'Probar de nuevo'}
          </Button>
          <Link href="/mis-cursos">
            <Button variant="outline">
              <BookOpen size={14} />
              Mis cursos
            </Button>
          </Link>
        </div>

        <p className="mt-10 text-xs text-mute">
          Los videos descargados siguen disponibles en{' '}
          <Link href="/mis-cursos" className="underline">Mis cursos</Link>.
        </p>
      </Container>
    </Section>
  );
}
