import { cn } from '@arteytierra/ui';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KpiProps {
  label: string;
  value: string;
  hint?: string;
  trend?: number;
  className?: string;
}

export function KpiCard({ label, value, hint, trend, className }: KpiProps) {
  const trendUp = typeof trend === 'number' && trend >= 0;
  return (
    <div className={cn('rounded-2xl border border-ink-950/10 bg-bone-50 p-5', className)}>
      <p className="text-xs uppercase tracking-[0.14em] text-ink-800/60">{label}</p>
      <p className="mt-3 font-display text-3xl">{value}</p>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {typeof trend === 'number' && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5',
              trendUp ? 'bg-moss-100 text-moss-900' : 'bg-clay-100 text-clay-900',
            )}
          >
            {trendUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
        {hint && <span className="text-ink-800/55">{hint}</span>}
      </div>
    </div>
  );
}
