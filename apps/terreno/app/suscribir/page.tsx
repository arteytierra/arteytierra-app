import { redirect } from 'next/navigation';
import { addAcequiaTrialDays, resolveAcequiaPaidPlan, type AcequiaBillingPeriod } from '@arteytierra/config/acequia';
import { getCurrentUser } from '@/lib/auth/session';
import { SuscribirConfirm } from '@/components/SuscribirConfirm';

export const metadata = { title: 'Suscribirme' };

export default async function SuscribirPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const plan = resolveAcequiaPaidPlan(sp.plan ?? '');
  const periodo: AcequiaBillingPeriod = sp.periodo === 'mensual' ? 'mensual' : 'anual';

  if (!plan) redirect('/mapa');

  // Requiere sesión; si no hay, registrarse y volver acá.
  const user = await getCurrentUser();
  if (!user) {
    const next = `/suscribir?plan=${plan}&periodo=${periodo}`;
    redirect(`/registro?next=${encodeURIComponent(next)}`);
  }

  const trialEnabled = process.env.ACEQUIA_TRIAL_ENABLED === 'true';
  // Los días de prueba salen del catálogo compartido: si cambian, cambian acá y
  // en el plan de PayPal a la vez, que es donde tienen que coincidir sí o sí.
  const firstCharge = addAcequiaTrialDays();
  const firstChargeDate = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }).format(firstCharge);

  return <SuscribirConfirm plan={plan} periodo={periodo} trialEnabled={trialEnabled} firstChargeDate={firstChargeDate} />;
}
