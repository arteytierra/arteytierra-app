'use client';

import { Marker, Polyline } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';
import { crearIconoAguada } from './iconos';
import type { ElementoAguada } from '@/lib/aguadas';
import type { CapasVisibles } from '../MapLeaflet';

/**
 * Capa de aguadas: represas (marcador) + swales/keylines (polilíneas punteadas).
 * Extraída del render de MapLeaflet (Fase 1). Sin cambio de comportamiento.
 */
export function AguadasLayer({ capas, aguadasLayer }: {
  capas:        CapasVisibles;
  aguadasLayer: ElementoAguada[];
}) {
  if (!capas.aguadas) return null;
  return (
    <>
      {aguadasLayer.map(a => {
        if (a.tipo === 'represa' && a.lat !== undefined && a.lng !== undefined) {
          return (
            <Marker key={a.id}
              position={[a.lat, a.lng]}
              icon={crearIconoAguada(a.tipo, a.nombre)}
            />
          );
        }
        if ((a.tipo === 'swale' || a.tipo === 'keyline') && a.vertices && a.vertices.length >= 2) {
          const color = a.tipo === 'swale' ? '#26A69A' : '#66BB6A';
          const dash  = a.tipo === 'swale' ? '8 5' : '16 6';
          return (
            <Polyline key={a.id}
              positions={a.vertices.map(v => [v.lat, v.lng] as LatLngTuple)}
              pathOptions={{ color, weight: 3, dashArray: dash, opacity: 0.9, interactive: false }}
            />
          );
        }
        return null;
      })}
    </>
  );
}
