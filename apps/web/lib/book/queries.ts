import 'server-only';
import { createSupabaseAdminClient } from '@/lib/db/admin';

export interface BookingResource {
  id: string;
  product_id: string;
  kind: 'lodging' | 'consult' | 'immersion';
  capacity: number | null;
  calendar_settings: Record<string, unknown>;
}

export interface AvailabilitySlot {
  id: string;
  starts_at: string;
  ends_at: string;
  price_cents: number | null;
  status: 'open' | 'blocked' | 'booked';
}

/** Devuelve el recurso reservable asociado a un producto. */
export async function getResourceByProductSlug(slug: string) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('shop').from('products')
    .select(`
      id, slug, name, subtitle, description_mdx, gallery, base_price_cents,
      compare_at_cents, currency, attributes, type, category, stock,
      resources(id, kind, capacity, calendar_settings)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (!data) return null;
  const resource = (data as never as { resources: BookingResource[] }).resources?.[0];
  return { product: data, resource: resource ?? null };
}

/** Disponibilidad de un recurso en un rango. */
export async function getAvailability(
  resourceId: string,
  from: Date,
  to: Date,
): Promise<AvailabilitySlot[]> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('book').from('availability')
    .select('id, starts_at, ends_at, price_cents, status')
    .eq('resource_id', resourceId)
    .gte('starts_at', from.toISOString())
    .lte('ends_at', to.toISOString())
    .order('starts_at', { ascending: true });
  return (data ?? []) as AvailabilitySlot[];
}

/** Fechas reservadas o bloqueadas (ISO dates). Usadas para tachar en el calendario. */
export async function getBlockedDates(
  resourceId: string,
  from: Date,
  to: Date,
): Promise<string[]> {
  const admin = createSupabaseAdminClient();

  // 1) availability con status blocked/booked
  const { data: av } = await admin
    .schema('book').from('availability')
    .select('starts_at, ends_at, status')
    .eq('resource_id', resourceId)
    .in('status', ['blocked', 'booked'])
    .gte('ends_at', from.toISOString())
    .lte('starts_at', to.toISOString());

  // 2) reservas confirmadas o pendientes (hold de 15 min)
  const { data: res } = await admin
    .schema('book').from('reservations')
    .select('starts_at, ends_at, status, created_at')
    .eq('resource_id', resourceId)
    .in('status', ['confirmed', 'pending', 'checked_in'])
    .gte('ends_at', from.toISOString())
    .lte('starts_at', to.toISOString());

  const dates = new Set<string>();
  const addRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    for (let d = new Date(s); d < e; d.setDate(d.getDate() + 1)) {
      dates.add(d.toISOString().slice(0, 10));
    }
  };
  (av ?? []).forEach((a) => addRange(a.starts_at, a.ends_at));
  // hold de 15 min para pendientes
  const now = Date.now();
  (res ?? []).forEach((r) => {
    if (r.status === 'pending') {
      const created = new Date(r.created_at ?? Date.now()).getTime();
      if (now - created > 15 * 60 * 1000) return; // expirado, no bloquea
    }
    addRange(r.starts_at, r.ends_at);
  });

  return [...dates].sort();
}

export async function listMyReservations(userId: string) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('book').from('reservations')
    .select(`
      id, starts_at, ends_at, guests, status, notes, created_at,
      resources!inner(kind,
        products(slug, name, gallery))
    `)
    .eq('user_id', userId)
    .order('starts_at', { ascending: true });
  return (data ?? []) as never as Array<{
    id: string; starts_at: string; ends_at: string; guests: number;
    status: string; notes: string | null; created_at: string;
    resources: { kind: string; products: { slug: string; name: string; gallery: unknown } };
  }>;
}
