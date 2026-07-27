import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { CanjearForm } from '@/components/CanjearForm';

export const metadata = { title: 'Activar invitación' };

export default async function CanjearPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const codigo = (sp.codigo ?? '').toUpperCase();

  // Canjear exige cuenta: así se captura el contacto (email + nombre).
  const user = await getCurrentUser();
  if (!user) {
    const next = `/canjear${codigo ? `?codigo=${encodeURIComponent(codigo)}` : ''}`;
    redirect(`/registro?next=${encodeURIComponent(next)}`);
  }

  return <CanjearForm codigoInicial={codigo} />;
}
