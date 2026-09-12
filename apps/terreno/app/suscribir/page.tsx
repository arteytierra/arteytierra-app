import { redirect } from 'next/navigation';
import {
  acequiaSelfCheckout,
  resolveAcequiaPaidPlan,
  type AcequiaBillingPeriod,
} from '@arteytierra/config/acequia';
import { getCurrentUser } from '@/lib/auth/session';
import { leerEstadoPagos } from '@/lib/estadoPagos';
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

  // Un plan válido puede no ser contratable solo. Estudio es el caso: sus cinco
  // asientos se dan de alta a mano y el checkout lo rechaza. Sin esta guarda la
  // pantalla de confirmación se mostraba igual y el error llegaba recién al
  // apretar el botón de pago, después de anunciar el precio.
  if (!acequiaSelfCheckout(plan)) redirect('/mapa');

  // Requiere sesión; si no hay, registrarse y volver acá.
  const user = await getCurrentUser();
  if (!user) {
    const next = `/suscribir?plan=${plan}&periodo=${periodo}`;
    redirect(`/registro?next=${encodeURIComponent(next)}`);
  }

  // Esta pantalla anuncia lo que va a pasar al apretar el botón, y lo que pasa
  // al apretar el botón lo decide la web, que es la que tiene las credenciales
  // de cobro. Por eso se lo pregunta en vez de leer su propio entorno: los días
  // de prueba y la cotización del peso viven allá.
  const pagos = await leerEstadoPagos();
  const primerCobro = new Date();
  primerCobro.setUTCDate(primerCobro.getUTCDate() + pagos.diasPrueba);
  const fechaPrimerCobro = new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(primerCobro);

  return (
    <SuscribirConfirm
      plan={plan}
      periodo={periodo}
      pagos={pagos}
      fechaPrimerCobro={fechaPrimerCobro}
    />
  );
}
