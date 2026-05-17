import { PageHeader } from '@/components/admin/PageHeader';
import { listCoupons } from '@/lib/admin/coupons';
import { CouponsTable } from '@/components/admin/coupons/CouponsTable';

export const metadata = { title: 'Cupones · Admin' };
export const dynamic = 'force-dynamic';

export default async function CuponesPage() {
  const coupons = await listCoupons();
  return (
    <>
      <PageHeader title="Cupones" description="Descuentos puntuales y campañas." />
      <CouponsTable initial={coupons} />
    </>
  );
}
