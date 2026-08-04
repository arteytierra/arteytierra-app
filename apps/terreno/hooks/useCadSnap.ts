'use client';

import { useMemo, useState } from 'react';
import { interseccionSegmentos } from '@/lib/dibujos';
import type { SnapSegmento } from '@/components/MapLeaflet';
import type { Mojon } from '@/lib/types';
import type { Zona } from '@/lib/zonificacion';
import type { Sector } from '@/lib/sectores';
import type { Camino } from '@/lib/caminos';
import type { Pin } from '@/lib/pines';
import type { ElementoAguada } from '@/lib/aguadas';
import type { ElementoDibujo, DibujoEnCurso } from '@/lib/dibujos';

type Vertice = { lat: number; lng: number };
/** Solo se lee `.vertices` de los modos de dibujo en curso (zona/sector/camino). */
type ConVertices = { vertices: Vertice[] } | null;

interface Params {
  mojones:       Mojon[];
  zonas:         Zona[];
  sectores:      Sector[];
  caminos:       Camino[];
  pines:         Pin[];
  aguadasLayer:  ElementoAguada[];
  dibujos:       ElementoDibujo[];
  dibujoEnCurso: DibujoEnCurso | null;
  modoZona:      ConVertices;
  modoSector:    ConVertices;
  modoCamino:    ConVertices;
}

/**
 * CAD: snap (F3) y ortho (F8), y los candidatos de enganche (Fase B del refactor
 * de MapaTerrenoApp). Dueño de los toggles snap/ortho y de los dos useMemos
 * pesados (segmentos y puntos de snap) que se derivan de TODA la geometría de
 * diseño, leída de solo lectura. Extraído tal cual: mismas dependencias, mismos
 * topes de rendimiento (1500 segmentos, 4000 puntos, intersecciones si ≤160 segs).
 */
export function useCadSnap({
  mojones, zonas, sectores, caminos, pines, aguadasLayer, dibujos,
  dibujoEnCurso, modoZona, modoSector, modoCamino,
}: Params) {
  const [snapActivo,  setSnapActivo]  = useState(true);
  const [orthoActivo, setOrthoActivo] = useState(false);

  // ─── Snap: segmentos (para perpendicular, punto más cercano e intersección) ──
  const snapSegmentos = useMemo<SnapSegmento[]>(() => {
    const segs: SnapSegmento[] = [];
    const push = (verts: Array<{ lat: number; lng: number }>, cerrado: boolean) => {
      for (let i = 0; i < verts.length - 1; i++) segs.push({ a: { lat: verts[i]!.lat, lng: verts[i]!.lng }, b: { lat: verts[i + 1]!.lat, lng: verts[i + 1]!.lng } });
      if (cerrado && verts.length > 2) { const a = verts[verts.length - 1]!, b = verts[0]!; segs.push({ a: { lat: a.lat, lng: a.lng }, b: { lat: b.lat, lng: b.lng } }); }
    };
    if (mojones.length >= 2) push(mojones, mojones.length >= 3);
    zonas.forEach(z => push(z.vertices, true));
    sectores.forEach(s => push(s.vertices, true));
    caminos.forEach(c => push(c.vertices, false));
    dibujos.forEach(d => {
      if (d.tipo === 'linea' || d.tipo === 'curva' || d.tipo === 'cota') push(d.vertices, false);
      else if (d.tipo === 'poligono') push(d.vertices, true);
    });
    return segs.length > 1500 ? segs.slice(0, 1500) : segs;
  }, [mojones, zonas, sectores, caminos, dibujos]);

  // ─── Snap: puntos candidatos (vértices, medios, centros, intersecciones) ────────
  const snapPuntos = useMemo(() => {
    const pts: Array<{ lat: number; lng: number }> = [];

    const agregarConMedios = (verts: Array<{ lat: number; lng: number }>, cerrado: boolean) => {
      for (let i = 0; i < verts.length; i++) {
        const a = verts[i]!;
        pts.push({ lat: a.lat, lng: a.lng });
        const j = cerrado ? (i + 1) % verts.length : i + 1;
        const b = verts[j];
        if (b && (cerrado || i < verts.length - 1)) {
          pts.push({ lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 });
        }
      }
    };

    agregarConMedios(mojones, mojones.length >= 3);
    zonas.forEach(z => agregarConMedios(z.vertices, true));
    sectores.forEach(s => agregarConMedios(s.vertices, true));
    caminos.forEach(c => agregarConMedios(c.vertices, false));
    pines.forEach(p => pts.push({ lat: p.lat, lng: p.lng }));
    aguadasLayer.forEach(a => {
      if (a.lat !== undefined && a.lng !== undefined) pts.push({ lat: a.lat, lng: a.lng });
      if (a.vertices) agregarConMedios(a.vertices, false);
    });
    dibujos.forEach(d => {
      if (d.tipo === 'circulo' || d.tipo === 'texto' || d.tipo === 'punto') pts.push({ lat: d.lat, lng: d.lng });
      else agregarConMedios(d.vertices, d.tipo === 'poligono');
    });
    // Vértices del dibujo en curso (permite cerrar polígonos con precisión)
    if (dibujoEnCurso) dibujoEnCurso.vertices.forEach(v => pts.push(v));
    if (modoZona)      modoZona.vertices.forEach(v => pts.push(v));
    if (modoSector)    modoSector.vertices.forEach(v => pts.push(v));
    if (modoCamino)    modoCamino.vertices.forEach(v => pts.push(v));

    // Intersecciones entre segmentos (acotado para no degradar rendimiento)
    if (snapSegmentos.length <= 160) {
      for (let i = 0; i < snapSegmentos.length; i++) {
        for (let j = i + 1; j < snapSegmentos.length; j++) {
          const x = interseccionSegmentos(snapSegmentos[i]!.a, snapSegmentos[i]!.b, snapSegmentos[j]!.a, snapSegmentos[j]!.b);
          if (x) pts.push(x);
        }
      }
    }

    return pts.length > 4000 ? pts.slice(0, 4000) : pts;
  }, [mojones, zonas, sectores, caminos, pines, aguadasLayer, dibujos, dibujoEnCurso, modoZona, modoSector, modoCamino, snapSegmentos]);

  return { snapActivo, setSnapActivo, orthoActivo, setOrthoActivo, snapSegmentos, snapPuntos };
}
