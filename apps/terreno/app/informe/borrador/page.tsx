'use client';

import { useEffect, useState } from 'react';
import { leerInformeBorrador, type InformeData } from '@/lib/informe';
import { InformeView } from '@/components/InformeView';

export default function InformeBorradorPage() {
  const [datos, setDatos] = useState<InformeData | null>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    setDatos(leerInformeBorrador());
    setListo(true);
  }, []);

  if (!listo) return null;

  if (!datos) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center px-8">
        <div className="space-y-3">
          <p className="text-ink-700 font-medium">No hay datos de informe disponibles.</p>
          <p className="text-sm text-ink-700/60">
            Abrí este informe desde acequia.
          </p>
          <a
            href="/mapa"
            className="inline-block mt-2 px-4 py-2 bg-moss-700 hover:bg-moss-900 text-bone-50 rounded-lg text-sm font-medium transition-colors"
          >
            Ir al mapa
          </a>
        </div>
      </div>
    );
  }

  return <InformeView datos={datos} />;
}
