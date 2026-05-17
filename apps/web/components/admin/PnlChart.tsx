'use client';

import { formatMoney } from '@arteytierra/ui';

interface PnlPoint {
  month: string;
  income_cents: number;
  expense_cents: number;
  net_cents: number;
}

export function PnlChart({ data }: { data: PnlPoint[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-ink-800/55">Sin datos suficientes para graficar.</p>;
  }

  const max = Math.max(
    1,
    ...data.flatMap((d) => [d.income_cents, d.expense_cents]),
  );

  return (
    <div className="grid grid-flow-col auto-cols-fr gap-3 h-56 items-end">
      {data.map((d) => {
        const inH = (d.income_cents / max) * 100;
        const exH = (d.expense_cents / max) * 100;
        const label = new Date(d.month).toLocaleDateString('es-AR', {
          month: 'short',
          year: '2-digit',
        });
        return (
          <div key={d.month} className="flex flex-col items-center gap-2 group">
            <div className="flex h-full w-full items-end gap-1">
              <div
                className="flex-1 bg-moss-700 rounded-t-md transition-all duration-500 ease-organic"
                style={{ height: `${inH}%` }}
                title={`Ingresos: ${formatMoney(d.income_cents)}`}
              />
              <div
                className="flex-1 bg-clay-700 rounded-t-md transition-all duration-500 ease-organic"
                style={{ height: `${exH}%` }}
                title={`Gastos: ${formatMoney(d.expense_cents)}`}
              />
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-ink-800/60">{label}</p>
              <p className="text-xs font-medium">
                {formatMoney(d.net_cents)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PnlLegend() {
  return (
    <div className="flex gap-4 text-xs text-ink-800/70">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-sm bg-moss-700" /> Ingresos
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-sm bg-clay-700" /> Gastos
      </span>
    </div>
  );
}
