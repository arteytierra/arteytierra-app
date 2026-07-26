import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { SuscribirConfirm } from '@/components/SuscribirConfirm';
import type { PlanPago, Periodo } from '@/lib/suscribir';

export const metadata = { title: 'Suscribirme' };

const PLANES_VALIDOS: PlanPago[] = ['personal', 'disenador', 'estudio'];

export default async function SuscribirPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const plan = (sp.plan ?? '') as PlanPago;
  const periodo: Periodo = sp.periodo === 'mensual' ? 'mensual' : 'anual';

  if (!PLANES_VALIDOS.includes(plan)) redirect('/mapa');

  // Requiere sesión; si no hay, registrarse y volver acá.
  const user = await getCurrentUser();
  if (!user) {
    const next = `/suscribir?plan=${plan}&periodo=${periodo}`;
    redirect(`/registro?next=${encodeURIComponent(next)}`);
  }

  return <SuscribirConfirm plan={plan} periodo={periodo} />;
}
