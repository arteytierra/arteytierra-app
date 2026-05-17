'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { cn } from '../utils/cn';

export interface FAQItem { q: string; a: string }

export function FAQ({ items, className }: { items: FAQItem[]; className?: string }) {
  return (
    <ul className={cn('divide-y divide-ink-950/10 border-y border-ink-950/10', className)}>
      {items.map((it, i) => (
        <FAQRow key={i} {...it} />
      ))}
    </ul>
  );
}

function FAQRow({ q, a }: FAQItem) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-6 py-6 text-left"
      >
        <span className="font-display text-lg md:text-xl text-ink-950">{q}</span>
        <span className="rounded-full border border-ink-950/15 p-2 text-ink-800">
          {open ? <Minus size={14} /> : <Plus size={14} />}
        </span>
      </button>
      <div
        className={cn(
          'grid overflow-hidden transition-[grid-template-rows] duration-500 ease-organic',
          open ? 'grid-rows-[1fr] pb-6' : 'grid-rows-[0fr]',
        )}
      >
        <div className="min-h-0 text-ink-800/80 max-w-prose">{a}</div>
      </div>
    </li>
  );
}
