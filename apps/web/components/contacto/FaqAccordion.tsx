'use client';

import { useState } from 'react';
import { CONTACTO_FAQ, type FaqItem } from '@/lib/seo/faq-contacto';

export function FaqAccordion({ items = CONTACTO_FAQ }: { items?: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="flex flex-col">
      {items.map((item, i) => (
        <div key={i} className="border-t border-clay-700/30 last:border-b">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between py-5 text-left"
          >
            <span className="font-sans font-bold text-sm text-ink-950 pr-4">{item.q}</span>
            <span className="text-clay-700 font-bold text-lg flex-shrink-0">{open === i ? '−' : '+'}</span>
          </button>
          {open === i && (
            <p className="font-sans text-sm text-ink-700 leading-relaxed pb-5">{item.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}
