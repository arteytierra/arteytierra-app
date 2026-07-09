import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { InformeView } from '@/components/InformeView';
import type { InformeData } from '@/lib/informe';
import type { DatosClima } from '@/lib/clima';
import type { Extremos } from '@/lib/climaExtremos';
import type { DatosTopografia } from '@/lib/topografia';
import type { CaptacionSnapshot } from '@/lib/captacion';
import type { DatosSuelo } from '@/lib/suelos';
import type { RedAguaResumen } from '@/lib/hidraulica';
import type { RepresaResumen } from '@/lib/represa';
import type { RiegoResumen } from '@/lib/riego';
import { resumirCobertura, type DatosCobertura } from '@/lib/cobertura';
import { resumirEntorno, type DatosEntorno } from '@/lib/entorno';
import type { Zona } from '@/lib/zonificacion';
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
    extremos: meta['extremos'] as Extremos | undefined,
    topo:     meta['topo'] as DatosTopografia | undefined,
    captacion: meta['captacion'] as CaptacionSnapshot | undefined,
    suelo:    meta['suelo'] as DatosSuelo | undefined,
    redAgua:  meta['red_agua'] as RedAguaResumen | undefined,
    represa:  meta['represa'] as RepresaResumen | undefined,
    riego:    meta['riego'] as RiegoResumen | undefined,
    cobertura: (() => {
      const c = meta['cobertura'] as DatosCobertura | undefined;
      return c && Array.isArray(c.items) ? resumirCobertura(c) : undefined;
    })(),
    entorno: (() => {
      const e = meta['entorno'] as DatosEntorno | undefined;
      return e && (e.biodiversidad || e.ubicacion) ? resumirEntorno(e) : undefined;
    })(),
    zonas:    meta['zonas'] as Zona[] | undefined,
  };

  return <InformeView datos={informeData} compartido />;
}
