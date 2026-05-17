'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@arteytierra/ui';

interface Props {
  blockedDates: string[];           // YYYY-MM-DD ISO
  minDate?: Date;
  maxDate?: Date;
  /** Modo rango vs día único */
  mode?: 'range' | 'single';
  /** Callback con la selección */
  onChange?: (sel: { start: Date | null; end: Date | null }) => void;
  /** Mínimo de noches para rango */
  minNights?: number;
}

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function isoDay(d: Date) {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    .toISOString()
    .slice(0, 10);
}

export function AvailabilityCalendar({
  blockedDates,
  minDate,
  maxDate,
  mode = 'range',
  onChange,
  minNights = 1,
}: Props) {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);
  const lowerBound = minDate ?? today;

  const [cursor, setCursor] = useState(() => new Date(lowerBound.getFullYear(), lowerBound.getMonth(), 1));
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);

  const blocked = useMemo(() => new Set(blockedDates), [blockedDates]);

  const monthGrid = useMemo(() => buildGrid(cursor), [cursor]);

  function setSelection(s: Date | null, e: Date | null) {
    setStart(s);
    setEnd(e);
    onChange?.({ start: s, end: e });
  }

  function pick(d: Date) {
    const key = isoDay(d);
    if (blocked.has(key)) return;
    if (d < lowerBound) return;
    if (maxDate && d > maxDate) return;

    if (mode === 'single') {
      setSelection(d, d);
      return;
    }

    if (!start || (start && end)) {
      setSelection(d, null);
      return;
    }
    if (d <= start) {
      setSelection(d, null);
      return;
    }

    // Validar que no haya días bloqueados en el rango
    const between = enumerateDays(start, d);
    if (between.some((day) => blocked.has(isoDay(day)))) {
      setSelection(d, null);
      return;
    }
    const nights = Math.round((d.getTime() - start.getTime()) / 86_400_000);
    if (nights < minNights) {
      setSelection(d, null);
      return;
    }
    setSelection(start, d);
  }

  return (
    <div className="rounded-2xl border border-ink-950/10 bg-bone-50 p-5">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          className="rounded-md p-1.5 hover:bg-bone-100"
          aria-label="Mes anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <p className="font-display text-lg capitalize">
          {cursor.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
        </p>
        <button
          type="button"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          className="rounded-md p-1.5 hover:bg-bone-100"
          aria-label="Mes siguiente"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[10px] uppercase tracking-wider text-ink-800/50 mb-1">
        {WEEKDAYS.map((d, i) => <span key={i}>{d}</span>)}
      </div>

      <div className="grid grid-cols-7 gap-1 text-sm">
        {monthGrid.map((d, i) => {
          const key = d ? isoDay(d) : `empty-${i}`;
          if (!d) return <span key={key} />;

          const isPast = d < lowerBound;
          const isBlocked = blocked.has(isoDay(d));
          const isStart = start && isoDay(d) === isoDay(start);
          const isEnd = end && isoDay(d) === isoDay(end);
          const inRange = start && end && d > start && d < end;
          const selected = isStart || isEnd;

          return (
            <button
              key={key}
              type="button"
              disabled={isPast || isBlocked}
              onClick={() => pick(d)}
              className={cn(
                'aspect-square rounded-md flex items-center justify-center transition-colors',
                isPast && 'text-ink-800/25 cursor-not-allowed',
                isBlocked && !isPast && 'text-ink-800/30 line-through cursor-not-allowed bg-bone-100/50',
                selected && 'bg-ink-950 text-bone-50',
                inRange && 'bg-moss-100 text-moss-900',
                !isPast && !isBlocked && !selected && !inRange && 'hover:bg-bone-100',
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function buildGrid(month: Date): Array<Date | null> {
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstWeekday = (new Date(year, m, 1).getDay() + 6) % 7; // L=0
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const grid: Array<Date | null> = [];
  for (let i = 0; i < firstWeekday; i++) grid.push(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(new Date(year, m, d));
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

function enumerateDays(from: Date, to: Date): Date[] {
  const out: Date[] = [];
  for (let d = new Date(from.getTime() + 86_400_000); d < to; d.setDate(d.getDate() + 1)) {
    out.push(new Date(d));
  }
  return out;
}
