import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { InformeView } from '@/components/InformeView';
import type { InformeData } from '@/lib/informe';
import type { DatosClima } from '@/lib/clima';
import type { DatosTopografia } from '@/lib/topografia';
import type { CaptacionSnapshot } from '@/lib/captacion';
import type { Mojon } from '@/lib/types';
import { calcularMetricas } from '@/lib/geometria';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function InformeTokenPage({ params }: PageProps) {
  const { token } = await params;

  // Cliente anónimo — la política RLS permite SELECT donde informe_publico = true
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data } = await (supabase as any)
    .schema('terreno')
    .from('proyectos')
    .select('nombre, updated_at, mojones, metadatos, informe_publico')
    .eq('informe_token', token)
    .single();

  if (!data || !data.informe_publico) return notFound();

  const meta = (data.metadatos ?? {}) as Record<string, unknown>;
  const mojones = (data.mojones ?? []) as Mojon[];

  const informeData: InformeData = {
    nombre:   String(data.nombre ?? 'Terreno sin nombre'),
    fecha:    String(data.updated_at ?? new Date().toISOString()),
    mojones,
    metricas: calcularMetricas(mojones) ?? undefined,
    clima:    meta['clima'] as DatosClima | undefined,
    topo:     meta['topo'] as DatosTopografia | undefined,
    captacion: meta['captacion'] as CaptacionSnapshot | undefined,
  };

  return <InformeView datos={informeData} compartido />;
}
