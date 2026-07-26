import { requireUser } from '@/lib/auth/session';
import { getPlan } from '@/lib/auth/plan';
import { MapaTerrenoApp } from '@/components/MapaTerrenoApp';

export const metadata = { title: 'Mapa' };

export default async function MapaPage() {
  const user = await requireUser();
  const plan = await getPlan(user.id);

  return (
    <MapaTerrenoApp userName={user.fullName ?? user.email} plan={plan} />
  );
}
