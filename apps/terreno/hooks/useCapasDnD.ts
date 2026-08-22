'use client';

import { useState, useEffect } from 'react';
import type { TipoElementoCapa } from '@/lib/capasUsuario';

const ORDEN_GRUPOS_INICIAL = [
  'topo', 'plano', 'hidrico', 'erosion', 'swales', 'cortinas', 'cortafuegos', 'silvopastura', 'sugerencias', 'analisis', 'terreno',
  'zonas', 'sectores', 'caminos', 'pines', 'dibujos', 'aguadas', 'arcSolar',
];

/**
 * Drag & drop del panel de Capas. Cubre dos gestos que comparten estado:
 *  - reordenar los GRUPOS de la leyenda (`makeDrag`), y
 *  - arrastrar un ELEMENTO (dibujo/camino/…) a una carpeta de usuario, o
 *    "archivar" un overlay de análisis en una carpeta (`dragFila` + `dropEnCarpeta`).
 *
 * `dragKey` y `dragBloqueado` los comparten ambos gestos (por eso viven juntos):
 * mientras se arrastra un slider/selector dentro de un grupo, `dragBloqueado`
 * apaga el drag nativo del grupo para no secuestrar el gesto. `overlayFolder`
 * (qué overlay quedó archivado en qué carpeta) se persiste en `localStorage`.
 *
 * Recibe `onMoverElemento` (mover un elemento a una carpeta) y `linkablesKeys`
 * (qué grupos son overlays archivables) para resolver `dropEnCarpeta`.
 *
 * Extraído de `PanelCapas` (Fase 1, etapa 6). No cambia comportamiento.
 */
export function useCapasDnD(
  onMoverElemento: (tipo: TipoElementoCapa, id: string, capaId: string) => void,
  linkablesKeys: Set<string>,
) {
  // ── Reordenar los grupos de la leyenda ──────────────────────────────────
  const [ordenGrupos, setOrdenGrupos] = useState(ORDEN_GRUPOS_INICIAL);
  const [dragKey, setDragKey] = useState<string | null>(null);
  // Mientras se arrastra un control (slider de intensidad / selector de color)
  // dentro de un grupo, el grupo NO debe ser draggable: el drag nativo del grupo
  // (para reordenar) secuestraba el arrastre del slider. Se rearma al soltar.
  const [dragBloqueado, setDragBloqueado] = useState(false);
  useEffect(() => {
    if (!dragBloqueado) return;
    const soltar = () => setDragBloqueado(false);
    window.addEventListener('mouseup', soltar);
    return () => window.removeEventListener('mouseup', soltar);
  }, [dragBloqueado]);
  const bloquearDrag = { onMouseDown: () => setDragBloqueado(true) };
  const makeDrag = (key: string) => ({
    draggable: !dragBloqueado,
    style: { order: ordenGrupos.indexOf(key), opacity: dragKey === key ? 0.4 : 1 },
    onDragStart: (e: React.DragEvent) => { e.dataTransfer.effectAllowed = 'move'; setDragKey(key); },
    onDragOver:  (e: React.DragEvent) => e.preventDefault(),
    onDrop: () => {
      if (!dragKey || dragKey === key) { setDragKey(null); return; }
      setOrdenGrupos(prev => {
        const arr = [...prev];
        const from = arr.indexOf(dragKey), to = arr.indexOf(key);
        if (from < 0 || to < 0) return prev;
        arr.splice(from, 1);
        arr.splice(to, 0, dragKey);
        return arr;
      });
      setDragKey(null);
    },
    onDragEnd: () => setDragKey(null),
  });

  // ── Arrastre de un ELEMENTO (dibujo/camino/…) entre carpetas de usuario ──
  const [dragItem, setDragItem] = useState<{ tipo: TipoElementoCapa; id: string } | null>(null);
  const [dropCapa, setDropCapa] = useState<string | null>(null);

  // ── Overlays de análisis archivados en una carpeta (persistido) ──
  const [overlayFolder, setOverlayFolder] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem('terreno.overlayFolder') || '{}'); } catch { return {}; }
  });
  useEffect(() => {
    try { localStorage.setItem('terreno.overlayFolder', JSON.stringify(overlayFolder)); } catch { /* ignore */ }
  }, [overlayFolder]);

  // dnd de item: props para una fila arrastrable
  const dragFila = (tipo: TipoElementoCapa, id: string) => ({
    draggable: !dragBloqueado,
    onDragStart: (e: React.DragEvent) => { e.stopPropagation(); e.dataTransfer.effectAllowed = 'move'; setDragItem({ tipo, id }); },
    onDragEnd: () => { setDragItem(null); setDropCapa(null); },
  });
  // dnd: la carpeta recibe tanto elementos (dibujo/camino/…) como overlays de análisis
  const dropEnCarpeta = (capaId: string) => ({
    onDragOver: (e: React.DragEvent) => {
      if (dragItem || (dragKey && linkablesKeys.has(dragKey))) { e.preventDefault(); e.stopPropagation(); setDropCapa(capaId); }
    },
    onDrop: (e: React.DragEvent) => {
      if (dragItem) {
        e.preventDefault(); e.stopPropagation();
        onMoverElemento(dragItem.tipo, dragItem.id, capaId);
        setDragItem(null); setDropCapa(null);
        return;
      }
      if (dragKey && linkablesKeys.has(dragKey)) {
        e.preventDefault(); e.stopPropagation();
        setOverlayFolder(prev => ({ ...prev, [dragKey]: capaId }));
        setDragKey(null); setDropCapa(null);
      }
    },
  });

  return {
    bloquearDrag, makeDrag, dragFila, dropEnCarpeta,
    overlayFolder, setOverlayFolder, dropCapa,
  };
}
