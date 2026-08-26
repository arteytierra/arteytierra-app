'use client';

import { useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { calcularArcoSolar } from '@/lib/sitio/arcoSolar';
import { ArcoSolarLayer } from './ArcoSolarLayer';

const ICONO_SITIO = L.divIcon({
  html: `<div style="
    width:26px;height:26px;border-radius:50% 50% 50% 0;
    background:#D9A441;transform:rotate(-45deg);
    border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);
  "></div>`,
  className: '',
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

interface Props {
  lat: number | null;
  lng: number | null;
  onSeleccionar: (lat: number, lng: number) => void;
}

function CapturaClick({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/**
 * Mapa Leaflet real (montado sólo en cliente, ver `MapaSitio.tsx`). Click
 * para ubicar el sitio; una vez ubicado, dibuja el recorrido del sol del año
 * (`ArcoSolarLayer`, portado de terreno) centrado en el punto — así elegir
 * el sitio ya muestra de entrada cómo pega el sol, en vez de un lat/lng a
 * ciegas que sólo se entiende después de generar el anteproyecto.
 */
export function MapaSitioInterno({ lat, lng, onSeleccionar }: Props) {
  const tieneSitio = lat !== null && lng !== null && !Number.isNaN(lat) && !Number.isNaN(lng);
  const centro = useMemo<[number, number]>(() => (tieneSitio ? [lat!, lng!] : [18.2537, -66.1057]), [tieneSitio, lat, lng]);
  const [radio, setRadio] = useState(200);

  const datosArco = useMemo(() => (tieneSitio ? calcularArcoSolar(lat!, lng!, radio) : null), [tieneSitio, lat, lng, radio]);

  return (
    <MapContainer center={centro} zoom={tieneSitio ? 17 : 12} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CapturaClick
        onClick={(clickLat, clickLng) => {
          onSeleccionar(clickLat, clickLng);
          setRadio(200);
        }}
      />
      {tieneSitio && <Marker position={[lat!, lng!]} icon={ICONO_SITIO} />}
      {datosArco && <ArcoSolarLayer datos={datosArco} />}
    </MapContainer>
  );
}
