import type { Metadata } from 'next';

export const metadata: Metadata = {
  // El layout raíz ya antepone 'acequia · '.
  title: 'Informe',
  description: 'Análisis de terreno — datos orientativos generados con la herramienta de Arte y Tierra.',
};

export default function InformeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white font-sans text-ink-900">
      {children}
    </div>
  );
}
