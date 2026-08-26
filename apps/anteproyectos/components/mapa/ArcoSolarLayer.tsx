'use client';

import React from 'react';
import { Circle as LeafCircle, Marker, Polyline } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';
import type { DatosArcoSolar } from '@/lib/sitio/arcoSolar';
import { iconoCardinal, iconoNoon, iconoSunEvent } from './iconosSolar';

/**
 * Recorrido del sol dibujado sobre el mapa de selección de sitio — círculo
 * de horizonte, líneas cardinales, y un arco por fecha clave (solsticios y
 * equinoccios). Portado de `apps/terreno/components/mapa/vectorLayers.tsx`
 * (`ArcoSolarLayer`), mismo trazado y mismos íconos.
 */
export function ArcoSolarLayer({ datos }: { datos: DatosArcoSolar }) {
  const { centro, radio_m, arcos, brujula } = datos;

  return (
    <>
      <LeafCircle
        center={[centro.lat, centro.lng]}
        radius={radio_m}
        pathOptions={{ color: '#666', weight: 1, opacity: 0.28, fill: false, dashArray: '5 7', interactive: false }}
      />

      <Polyline
        positions={[
          [brujula.N.lat, brujula.N.lng],
          [brujula.S.lat, brujula.S.lng],
        ]}
        pathOptions={{ color: '#777', weight: 0.8, opacity: 0.22, dashArray: '3 7', interactive: false }}
      />
      <Polyline
        positions={[
          [brujula.E.lat, brujula.E.lng],
          [brujula.O.lat, brujula.O.lng],
        ]}
        pathOptions={{ color: '#777', weight: 0.8, opacity: 0.22, dashArray: '3 7', interactive: false }}
      />

      {(Object.entries(brujula) as [string, { lat: number; lng: number }][]).map(([dir, pos]) => (
        <Marker key={`arc-dir-${dir}`} position={[pos.lat, pos.lng]} icon={iconoCardinal(dir === 'O' ? 'O' : dir)} interactive={false} />
      ))}

      {arcos.map(arco => (
        <React.Fragment key={arco.fecha}>
          <Polyline
            positions={arco.puntos.map(p => [p.lat, p.lng] as LatLngTuple)}
            pathOptions={{ color: '#000', weight: 5, opacity: 0.18, interactive: false, lineCap: 'round', lineJoin: 'round' }}
          />
          <Polyline
            positions={arco.puntos.map(p => [p.lat, p.lng] as LatLngTuple)}
            pathOptions={{ color: arco.color, weight: 2.5, opacity: 0.92, interactive: false, lineCap: 'round', lineJoin: 'round' }}
          />

          <Marker position={[arco.amanecer.lat, arco.amanecer.lng]} icon={iconoSunEvent(arco.color, arco.amanecer.hora)} interactive={false} />
          <Marker position={[arco.atardecer.lat, arco.atardecer.lng]} icon={iconoSunEvent(arco.color, arco.atardecer.hora)} interactive={false} />
          <Marker
            position={[arco.mediodia.lat, arco.mediodia.lng]}
            icon={iconoNoon(arco.color, arco.mediodia.elevacion, arco.labelCorto)}
            interactive={false}
          />
        </React.Fragment>
      ))}
    </>
  );
}
