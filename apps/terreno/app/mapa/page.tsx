import { requireUser } from '@/lib/auth/session';
import { getPlan, esCuentaInterna } from '@/lib/auth/plan';
import { MapaTerrenoApp } from '@/components/MapaTerrenoApp';

export const metadata = { title: 'Mapa' };

export default async function MapaPage() {
  const user = await requireUser('/mapa');
  const plan = await getPlan(user.id);
  // Las cuentas internas del estudio no chocan con el tope del plan (ver 0063).
  const sinTope = await esCuentaInterna(user.id);

  return (
    <MapaTerrenoApp userName={user.fullName ?? user.email} plan={plan} sinTope={sinTope} />
  );
}
