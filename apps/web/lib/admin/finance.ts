import 'server-only';
import { createSupabaseServerClient } from '@/lib/db/server';

export interface TxRow {
  id: string;
  date: string;
  amount_cents: number;
  currency: string;
  type: 'income' | 'expense' | 'transfer';
  description: string | null;
  attachment_url: string | null;
  account_id: string;
  category_id: string | null;
  project: string | null;
}

export interface TxFilters {
  from?: string;       // YYYY-MM-DD
  to?: string;
  type?: 'income' | 'expense' | 'transfer' | 'all';
  categoryId?: string;
  q?: string;
}

export async function listTransactions(filters: TxFilters = {}, limit = 200) {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from('transactions')
    .select('id, date, amount_cents, currency, type, description, attachment_url, account_id, category_id, project')
    .order('date', { ascending: false })
    .limit(limit);

  if (filters.from) query = query.gte('date', filters.from);
  if (filters.to)   query = query.lte('date', filters.to);
  if (filters.type && filters.type !== 'all') query = query.eq('type', filters.type);
  if (filters.categoryId) query = query.eq('category_id', filters.categoryId);
  if (filters.q) query = query.ilike('description', `%${filters.q}%`);

  const { data } = await query;
  return (data ?? []) as TxRow[];
}

export async function getMonthlyPnl(months = 6) {
  const supabase = await createSupabaseServerClient();
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);

  const { data } = await supabase
    .from('monthly_pnl')
    .select('month, currency, income_cents, expense_cents, net_cents')
    .gte('month', since.toISOString().slice(0, 10))
    .order('month', { ascending: true });

  return (data ?? []) as Array<{
    month: string;
    currency: string;
    income_cents: number;
    expense_cents: number;
    net_cents: number;
  }>;
}

export async function getFinanceMeta() {
  const supabase = await createSupabaseServerClient();
  const [{ data: accounts }, { data: categories }] = await Promise.all([
    supabase.from('accounts').select('id, name, currency, kind').eq('is_active', true).order('name'),
    supabase.from('categories').select('id, name, type, color').order('name'),
  ]);
  return {
    accounts: (accounts ?? []) as Array<{ id: string; name: string; currency: string; kind: string }>,
    categories: (categories ?? []) as Array<{ id: string; name: string; type: 'income'|'expense'; color: string | null }>,
  };
}

export async function getExpensesByCategoryThisMonth() {
  const supabase = await createSupabaseServerClient();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { data } = await supabase.from('transactions')
    .select('amount_cents, category_id, categories(name, color)')
    .eq('type', 'expense')
    .gte('date', monthStart.toISOString().slice(0, 10));

  const map = new Map<string, { name: string; color: string | null; cents: number }>();
  for (const row of (data ?? []) as never[]) {
    const r = row as { amount_cents: number; category_id: string | null; categories: { name: string; color: string | null } | null };
    const key = r.category_id ?? 'sin-categoria';
    const name = r.categories?.name ?? 'Sin categoría';
    const color = r.categories?.color ?? null;
    const cur = map.get(key) ?? { name, color, cents: 0 };
    cur.cents += r.amount_cents;
    map.set(key, cur);
  }
  return [...map.values()].sort((a, b) => b.cents - a.cents);
}
