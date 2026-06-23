'use client';

/**
 * Selector de moneda. Setea la cookie `ay_cur` (la lee getBuyerCurrency en el
 * servidor) y recarga. Sirve de red de seguridad cuando el geo automático falla
 * (ej. conexiones satelitales/rurales en Argentina que geolocalizan fuera del país).
 */
export function CurrencySwitcher({ current }: { current: 'ARS' | 'USD' }) {
  function set(cur: 'ARS' | 'USD') {
    if (cur === current) return;
    document.cookie = `ay_cur=${cur}; path=/; max-age=${60 * 60 * 24 * 365}`;
    location.reload();
  }

  const base =
    'px-3 py-1.5 text-xs font-sans font-bold uppercase tracking-widest transition-colors';
  const on = 'bg-ink-950 text-bone-50';
  const off = 'text-ink-700 hover:bg-ink-950/5';

  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-[11px] font-sans uppercase tracking-widest text-ink-700/60">
        Ver precios en
      </span>
      <div className="inline-flex rounded-full border border-ink-950/15 overflow-hidden">
        <button
          type="button"
          onClick={() => set('ARS')}
          aria-pressed={current === 'ARS'}
          className={`${base} ${current === 'ARS' ? on : off}`}
        >
          ARS $
        </button>
        <button
          type="button"
          onClick={() => set('USD')}
          aria-pressed={current === 'USD'}
          className={`${base} ${current === 'USD' ? on : off}`}
        >
          USD
        </button>
      </div>
    </div>
  );
}
