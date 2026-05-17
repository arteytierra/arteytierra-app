import { requireStaff } from '@/lib/auth/session';
import { AdminShell } from '@/components/admin/AdminShell';

export const metadata = { title: 'Admin' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff('/admin');
  return <AdminShell user={user}>{children}</AdminShell>;
}
