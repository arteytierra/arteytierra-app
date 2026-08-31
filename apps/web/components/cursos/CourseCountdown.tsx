'use client';

import { useEffect, useState } from 'react';

interface Props {
  /** Fecha de inicio del curso, formato ISO (YYYY-MM-DD). */
  startDate: string;
}

/**
 * Urgencia basada en la fecha real de inicio (no en cupos disponibles).
 * Se calcula en el cliente para evitar desajustes de hidratación por huso horario/fecha de build.
 */
export function CourseCountdown({ startDate }: Props) {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const start = new Date(`${startDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setDays(Math.ceil((start.getTime() - today.getTime()) / 86_400_000));
  }, [startDate]);

  if (days === null || days < 0) return null;

  const texto =
    days === 0 ? 'Arranca hoy' :
    days === 1 ? 'Arranca mañana' :
    `Faltan ${days} días para arrancar`;

  return (
    <p className="mt-2 font-sans text-xs font-bold uppercase tracking-widest text-clay-500">
      ● {texto}
    </p>
  );
}
