import Link from 'next/link';
import { Badge, formatMoney } from '@arteytierra/ui';
import { getCurrentUser } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/db/server';

export const metadata = { title: 'Mis pedidos' };

const TONE: Record<string, 'moss' | 'sun' | 'clay' | 'neutral'> = {
  paid: 'moss', pending: 'sun', failed: 'clay', refunded: 'clay', cancelled: 'neutral',
};

export default async function MisPedidosPage() {
  const user = (await getCurrentUser())!;
  const supabase = await createSupabaseServerClient();
  const { data: orders } = await supabase
    .schema('shop').from('orders')
    .select('id, total_cents, currency, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-950/15 bg-bone-50 p-12 text-center">
        <p className="font-display text-2xl">Aún no hiciste pedidos</p>
        <p className="mt-2 text-ink-800/65">Explorá la tienda para empezar.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {orders.map((o) => (
        <li key={o.id}>
          <Link
            href={`/orden/${o.id}/success`}
            className="flex items-center gap-4 rounded-xl border border-ink-950/10 bg-bone-50 px-5 py-4 hover:bg-bone-100"
          >
            <span className="font-mono text-xs text-ink-800/70">#{o.id.slice(0, 8)}</span>
            <span className="text-sm text-ink-800/65">
              {o.created_at ? new Date(o.created_at).toLocaleDateString('es-AR') : ''}
            </span>
            <Badge tone={TONE[o.status] ?? 'neutral'}>{o.status}</Badge>
            <span className="ml-auto font-medium">
              {formatMoney(o.total_cents, o.currency as never)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
