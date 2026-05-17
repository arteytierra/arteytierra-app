import 'server-only';
import { createSupabaseServerClient } from '@/lib/db/server';

const MS_DAY = 86_400_000;

function isoDaysAgo(days: number) {
  return new Date(Date.now() - days * MS_DAY).toISOString();
}

export async function getDashboardMetrics() {
  const supabase = await createSupabaseServerClient();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const prevMonthStart = new Date(monthStart);
  prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);

  const [
    monthRevenue,
    prevRevenue,
    todayOrders,
    monthOrders,
    activeEnrollments,
    upcomingReservations,
    topProducts,
  ] = await Promise.all([
    supabase.from('orders').select('total_cents, currency')
      .eq('status', 'paid')
      .gte('paid_at', monthStart.toISOString()),

    supabase.from('orders').select('total_cents, currency')
      .eq('status', 'paid')
      .gte('paid_at', prevMonthStart.toISOString())
      .lt('paid_at', monthStart.toISOString()),

    supabase.from('orders').select('id', { count: 'exact', head: true })
      .eq('status', 'paid')
      .gte('paid_at', isoDaysAgo(1)),

    supabase.from('orders').select('id', { count: 'exact', head: true })
      .eq('status', 'paid')
      .gte('paid_at', monthStart.toISOString()),

    supabase.from('enrollments').select('id', { count: 'exact', head: true })
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`),

    supabase.from('reservations').select('id', { count: 'exact', head: true })
      .in('status', ['confirmed', 'pending'])
      .gte('starts_at', new Date().toISOString()),

    supabase.from('order_items').select('product_id, name_snapshot, qty, total_cents')
      .order('total_cents', { ascending: false })
      .limit(5),
  ]);

  const sumCents = (rows: { total_cents: number | null }[] | null) =>
    (rows ?? []).reduce((s, r) => s + (r.total_cents ?? 0), 0);

  const monthCents = sumCents(monthRevenue.data as never);
  const prevCents = sumCents(prevRevenue.data as never);
  const growth = prevCents > 0 ? ((monthCents - prevCents) / prevCents) * 100 : null;

  return {
    monthCents,
    prevCents,
    growth,
    todayOrdersCount: todayOrders.count ?? 0,
    monthOrdersCount: monthOrders.count ?? 0,
    activeEnrollmentsCount: activeEnrollments.count ?? 0,
    upcomingReservationsCount: upcomingReservations.count ?? 0,
    topProducts: (topProducts.data ?? []) as Array<{
      product_id: string; name_snapshot: string; qty: number; total_cents: number;
    }>,
  };
}

export async function getRecentOrders(limit = 10) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from('orders')
    .select('id, total_cents, currency, status, created_at, billing')
    .order('created_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}
