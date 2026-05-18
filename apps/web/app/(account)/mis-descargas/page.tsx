import { Download, FileText } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';

export const metadata = { title: 'Mis descargas' };

export default async function MisDescargasPage() {
  const user = (await getCurrentUser())!;
  const admin = createSupabaseAdminClient();

  // Buscar order_items tipo ebook de órdenes pagadas del usuario
  const { data: items } = await admin
    .schema('shop').from('order_items')
    .select(`
      id, name_snapshot, order_id,
      orders!inner(user_id, status, paid_at),
      products(attributes)
    `)
    .eq('orders.user_id', user.id)
    .eq('orders.status', 'paid')
    .eq('product_type', 'ebook');

  const ebooks: Array<{ id: string; name: string; signedUrl: string | null; paidAt: string | null }> = [];
  for (const it of (items ?? []) as never as Array<{
    id: string; name_snapshot: string;
    orders: { paid_at: string | null };
    products: { attributes: Record<string, unknown> | null };
  }>) {
    const path = it.products?.attributes?.['ebook_path'] as string | undefined;
    let signedUrl: string | null = null;
    if (path) {
      const { data } = await admin.storage
        .from('ebooks')
        .createSignedUrl(path, 60 * 60 * 24 * 7);
      signedUrl = data?.signedUrl ?? null;
    }
    ebooks.push({
      id: it.id,
      name: it.name_snapshot,
      signedUrl,
      paidAt: it.orders.paid_at,
    });
  }

  if (ebooks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-950/15 bg-bone-50 p-12 text-center">
        <p className="font-display text-2xl">No tenés descargas aún</p>
        <p className="mt-2 text-ink-800/65">Tus ebooks y materiales aparecerán acá.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {ebooks.map((e) => (
        <li key={e.id} className="rounded-xl border border-ink-950/10 bg-bone-50 px-5 py-4">
          <div className="flex items-center gap-4">
            <FileText size={18} className="text-moss-700" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{e.name}</p>
              {e.paidAt && (
                <p className="text-xs text-ink-800/55 mt-0.5">
                  Comprado el {new Date(e.paidAt).toLocaleDateString('es-AR')}
                </p>
              )}
            </div>
            {e.signedUrl ? (
              <a
                href={e.signedUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-full bg-ink-950 text-bone-50 px-5 py-2.5 text-sm hover:bg-moss-700"
              >
                <Download size={14} /> Descargar
              </a>
            ) : (
              <span className="text-xs text-ink-800/55">Procesando…</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
