import { requireUser } from '@/lib/auth/session';
import { MapaTerrenoApp } from '@/components/MapaTerrenoApp';

export const metadata = { title: 'Mapa' };

export default async function MapaPage() {
  const user = await requireUser();

  return (
    <MapaTerrenoApp userName={user.fullName ?? user.email} />
  );
}
