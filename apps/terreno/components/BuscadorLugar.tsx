'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Loader2, MapPin } from 'lucide-react';

export interface ResultadoBusqueda {
  nombre: string;
  lat: number;
  lng: number;
  tipo: string;
  bbox?: [number, number, number, number];
}

/**
 * Barra de búsqueda de localidad/dirección. Consulta `/api/geocoder` (que rutea
 * Nominatim por el server) con debounce y muestra un dropdown de resultados.
 * Al elegir uno, el padre vuela el mapa hasta ahí y deja un marcador temporal.
 */
export function BuscadorLugar({ onElegir }: { onElegir: (r: ResultadoBusqueda) => void }) {
  const [q, setQ] = useState('');
  const [abierto, setAbierto] = useState(false);
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([]);
  const [cargando, setCargando] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const buscar = useCallback((texto: string) => {
    if (debRef.current) clearTimeout(debRef.current);
    if (texto.trim().length < 3) { setResultados([]); setCargando(false); return; }
    setCargando(true);
    debRef.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/geocoder?q=${encodeURIComponent(texto.trim())}`);
        const j = await r.json() as { resultados?: ResultadoBusqueda[] };
        setResultados(j.resultados ?? []);
        setAbierto(true);
      } catch { setResultados([]); }
      finally { setCargando(false); }
    }, 400);
  }, []);

  const elegir = (r: ResultadoBusqueda) => {
    onElegir(r);
    setQ(r.nombre.split(',')[0] ?? r.nombre);
    setAbierto(false);
  };
  const limpiar = () => { setQ(''); setResultados([]); setAbierto(false); };

  return (
    <div ref={boxRef} className="relative w-full no-print">
      <div className="flex items-center bg-bone-50 rounded-lg border border-bone-200 focus-within:border-sun-400 transition-colors">
        <Search className="w-3.5 h-3.5 ml-2 text-ink-700/40 shrink-0" />
        <input
          value={q}
          onChange={e => { setQ(e.target.value); buscar(e.target.value); }}
          onFocus={() => resultados.length > 0 && setAbierto(true)}
          placeholder="Buscar localidad…"
          className="flex-1 min-w-0 bg-transparent px-2 py-1.5 text-[12px] text-ink-900 placeholder:text-ink-700/40 focus:outline-none"
        />
        {cargando
          ? <Loader2 className="w-3.5 h-3.5 mr-2 text-ink-700/40 animate-spin shrink-0" />
          : q
            ? <button onClick={limpiar} title="Limpiar" className="mr-1.5 p-0.5 text-ink-700/40 hover:text-clay-600 transition-colors"><X className="w-3.5 h-3.5" /></button>
            : null}
      </div>

      {abierto && resultados.length > 0 && (
        <ul className="absolute right-0 mt-1 w-full max-h-64 overflow-y-auto bg-white rounded-lg shadow-lg border border-bone-200 py-1 z-[500]">
          {resultados.map((r, i) => (
            <li key={i}>
              <button onClick={() => elegir(r)} className="w-full text-left px-2.5 py-1.5 hover:bg-bone-100 flex items-start gap-1.5 transition-colors">
                <MapPin className="w-3 h-3 mt-0.5 text-moss-600 shrink-0" />
                <span className="text-[11px] text-ink-800 leading-tight">{r.nombre}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {abierto && !cargando && resultados.length === 0 && q.trim().length >= 3 && (
        <div className="absolute right-0 mt-1 w-full bg-white rounded-lg shadow-lg border border-bone-200 px-3 py-2 text-[11px] text-ink-700/50 z-[500]">
          Sin resultados
        </div>
      )}
    </div>
  );
}
