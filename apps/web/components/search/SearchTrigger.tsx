'use client';

import { Search } from 'lucide-react';

/**
 * Botón visible que dispara la apertura del CommandK global.
 * El componente CommandK (montado en RootLayout) escucha tanto el atajo
 * ⌘K como un evento custom `ay:open-search`.
 */
export function SearchTrigger() {
  function open() {
    window.dispatchEvent(new CustomEvent('ay:open-search'));
  }
  return (
    <button
      type="button"
      onClick={open}
      aria-label="Buscar"
      className="inline-flex items-center gap-2 rounded-full border border-ink-950/10 bg-bone-50 px-3 py-1.5 text-xs text-ink-800/70 hover:text-ink-950 hover:border-ink-950/20 transition-colors"
    >
      <Search size={14} />
      <span className="hidden md:inline">Buscar</span>
      <kbd className="hidden md:inline text-[10px] text-ink-800/55 rounded bg-bone-100 px-1 py-0.5 border border-ink-950/10">
        ⌘K
      </kbd>
    </button>
  );
}
