'use client';

import { useState, useEffect, useCallback } from 'react';

export type TemaVista = 'claro' | 'sepia' | 'oscuro';

const ANCHO_PANEL_DEFAULT = 304;
const ANCHO_CAPAS_DEFAULT = 300;
const ANCHO_MIN = 220;
const ANCHO_MAX = 560;

/**
 * Preferencias de la "cáscara" de vista, persistidas por dispositivo en
 * `localStorage`: tema (claro/sepia/oscuro) y anchos regulables del panel
 * izquierdo y del sidebar de Capas.
 *
 * Extraído de `MapaTerrenoApp` (Fase 1, etapa 1). No cambia comportamiento:
 * mismas claves de storage, mismos límites de ancho y mismo `data-theme`.
 */
export function useVistaShell() {
  // ── Tema (data-theme en <html> + persistencia) ──────────────────────────
  const [tema, setTema] = useState<TemaVista>('claro');
  useEffect(() => {
    const t = (typeof localStorage !== 'undefined' && localStorage.getItem('terreno_tema')) as TemaVista | null;
    if (t === 'sepia' || t === 'oscuro' || t === 'claro') setTema(t);
  }, []);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (tema === 'claro') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', tema);
    try { localStorage.setItem('terreno_tema', tema); } catch { /* ignore */ }
  }, [tema]);
  const ciclarTema = useCallback(() => {
    setTema(t => (t === 'claro' ? 'sepia' : t === 'sepia' ? 'oscuro' : 'claro'));
  }, []);

  // ── Anchos regulables del panel izquierdo y del sidebar de Capas ─────────
  const [anchoPanel, setAnchoPanel] = useState<number>(() => {
    if (typeof window === 'undefined') return ANCHO_PANEL_DEFAULT;
    return Number(localStorage.getItem('terreno.anchoPanel')) || ANCHO_PANEL_DEFAULT;
  });
  const [anchoCapas, setAnchoCapas] = useState<number>(() => {
    if (typeof window === 'undefined') return ANCHO_CAPAS_DEFAULT;
    return Number(localStorage.getItem('terreno.anchoCapas')) || ANCHO_CAPAS_DEFAULT;
  });
  const [redimensionando, setRedimensionando] = useState(false);
  useEffect(() => { try { localStorage.setItem('terreno.anchoPanel', String(anchoPanel)); } catch { /* ignore */ } }, [anchoPanel]);
  useEffect(() => { try { localStorage.setItem('terreno.anchoCapas', String(anchoCapas)); } catch { /* ignore */ } }, [anchoCapas]);
  const iniciarResize = useCallback((cual: 'panel' | 'capas') => (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = cual === 'panel' ? anchoPanel : anchoCapas;
    const set = cual === 'panel' ? setAnchoPanel : setAnchoCapas;
    const dir = cual === 'panel' ? 1 : -1; // el panel crece a la derecha; Capas, a la izquierda
    setRedimensionando(true);
    document.body.style.cursor = 'col-resize';
    const onMove = (ev: MouseEvent) => set(Math.min(ANCHO_MAX, Math.max(ANCHO_MIN, startW + dir * (ev.clientX - startX))));
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      setRedimensionando(false);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [anchoPanel, anchoCapas]);

  return { tema, setTema, ciclarTema, anchoPanel, anchoCapas, redimensionando, iniciarResize };
}
