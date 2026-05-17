import { NextResponse, type NextRequest } from 'next/server';
import { requireStaff } from '@/lib/auth/session';
import { listTransactions, getFinanceMeta, type TxFilters } from '@/lib/admin/finance';

export const runtime = 'nodejs';

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(request: NextRequest) {
  await requireStaff();

  const sp = request.nextUrl.searchParams;
  const filters: TxFilters = {
    from: sp.get('from') ?? undefined,
    to: sp.get('to') ?? undefined,
    type: (sp.get('type') as TxFilters['type']) ?? undefined,
    categoryId: sp.get('categoryId') ?? undefined,
    q: sp.get('q') ?? undefined,
  };

  const [txs, meta] = await Promise.all([
    listTransactions(filters, 10_000),
    getFinanceMeta(),
  ]);

  const catMap = new Map(meta.categories.map((c) => [c.id, c.name]));
  const accMap = new Map(meta.accounts.map((a) => [a.id, a.name]));

  const header = ['Fecha', 'Tipo', 'Descripción', 'Categoría', 'Cuenta', 'Proyecto', 'Moneda', 'Monto'];
  const lines = [header.join(',')];

  for (const t of txs) {
    lines.push([
      t.date,
      t.type,
      csvEscape(t.description),
      csvEscape(t.category_id ? catMap.get(t.category_id) : ''),
      csvEscape(accMap.get(t.account_id) ?? ''),
      csvEscape(t.project),
      t.currency,
      (t.amount_cents / 100).toFixed(2),
    ].join(','));
  }

  const csv = '﻿' + lines.join('\n'); // BOM para Excel
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="finanzas-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
