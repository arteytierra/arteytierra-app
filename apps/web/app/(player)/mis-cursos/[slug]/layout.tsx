import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { getCourseForLearner } from '@/lib/edu/queries';
import { PlayerShell } from '@/components/edu/PlayerShell';

export default async function PlayerLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const { slug } = await params;
  const data = await getCourseForLearner(slug, user.id);
  if (!data) notFound();

  return <PlayerShell slug={slug} data={data}>{children}</PlayerShell>;
}
