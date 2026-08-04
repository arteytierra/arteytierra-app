/**
 * Vectores para la Vista 3D (R2).
 *
 * Traduce las capas del plano 2D a tres FeatureCollections que MapLibre drapea
 * sobre el relieve: polígonos, líneas y puntos. El estilo viaja en las
 * propiedades de cada feature (`color`, `opacidad`, `grosor`, `dash`) para que
 * la Vista 3D pueda pintar todo con un puñado de capas data-driven, sin tener
 * que conocer cada tipo de elemento.
 *
 * Respeta el panel de Capas del 2D sin re-implementar el filtrado: recibe los
 * mismos arrays ya filtrados que se le pasan a MapLeaflet (`zonasFiltradas`,
 * `dibujosFiltrados`, …), así que lo que se ve en el plano es lo que se drapea.
 * `capas` sólo se consulta para el predio y las curvas de nivel, que no tienen
 * array filtrado propio.
 */
import type { CapasVisibles } from '@/components/MapLeaflet';
import type { Mojon } from './types';
import type { Zona } from './zonificacion';
import { CATEGORIAS_ZONA } from './zonificacion';
import type { Sector } from './sectores';
import { TIPOS_SECTOR } from './sectores';
import type { Camino } from './caminos';
import type { Pin } from './pines';
import type { ElementoAguada } from './aguadas';
import type { CurvaNivel } from './curvasNivel';
import type { ElementoDibujo } from './dibujos';

type LL = { lat: number; lng: number };
const pos = (v: LL): [number, number] => [v.lng, v.lat];
const anillo = (vs: LL[]): [number, number][] => {
  const r = vs.map(pos);
  const a = r[0], z = r[r.length - 1];
  if (a && z && (a[0] !== z[0] || a[1] !== z[1])) r.push(a);
  return r;
};

/**
 * Estilo que viaja en cada feature; lo leen las expresiones de MapLibre.
 * `dash` es una categoría y no un patrón de píxeles porque MapLibre no admite
 * `line-dasharray` data-driven: cada categoría se pinta en su propia capa.
 */
export type EstiloTrazo = 'punteada' | 'rayada';
export interface PropsVector {
  color: string;
  opacidad: number;
  grosor: number;
  /** Ausente = línea continua. */
  dash?: EstiloTrazo;
  nombre: string;
  /** Emoji/glifo para los puntos. */
  simbolo: string;
}

type Feat<G extends GeoJSON.Geometry> = GeoJSON.Feature<G, PropsVector>;
type FC<G extends GeoJSON.Geometry> = GeoJSON.FeatureCollection<G, PropsVector>;

export interface Vectores3D {
  poligonos: FC<GeoJSON.Polygon>;
  lineas:    FC<GeoJSON.LineString>;
  puntos:    FC<GeoJSON.Point>;
  /** Cuántos elementos se drapearon (para el cartel de la Vista 3D). */
  total: number;
}

export interface DatosVectores {
  mojones:   Mojon[];
  /** Todos estos llegan ya filtrados por el panel de Capas. */
  zonas?:    Zona[];
  sectores?: Sector[];
  caminos?:  Camino[];
  pines?:    Pin[];
  aguadas?:  ElementoAguada[];
  dibujos?:  ElementoDibujo[];
  curvas?:   CurvaNivel[];
  colorCurvas?: { normal: string; maestra: string };
  capas?:    CapasVisibles;
}

const COLOR_PREDIO = '#D9A441';

/** Un círculo geodésico aproximado, para los dibujos de tipo círculo. */
function circulo(lat: number, lng: number, radio_m: number, lados = 48): LL[] {
  const dLat = radio_m / 111_320;
  const dLng = radio_m / (111_320 * Math.cos((lat * Math.PI) / 180));
  return Array.from({ length: lados }, (_, i) => {
    const t = (i / lados) * 2 * Math.PI;
    return { lat: lat + dLat * Math.sin(t), lng: lng + dLng * Math.cos(t) };
  });
}

export function construirVectores3D(d: DatosVectores): Vectores3D {
  const poligonos: Feat<GeoJSON.Polygon>[] = [];
  const lineas:    Feat<GeoJSON.LineString>[] = [];
  const puntos:    Feat<GeoJSON.Point>[] = [];

  const capas = d.capas;
  const visible = (grupo: keyof CapasVisibles) => !capas || capas[grupo];

  // La opacidad por defecto difiere: los rellenos van translúcidos, los trazos casi opacos.
  // `dash` se omite cuando no aplica: MapLibre filtra con ['has','dash'] y una
  // propiedad presente en null contaría como existente.
  const estilo = (base: number, p: Partial<PropsVector>): PropsVector => {
    const props: PropsVector = { color: '#ffffff', opacidad: base, grosor: 2, nombre: '', simbolo: '', ...p };
    if (props.dash == null) delete props.dash;
    return props;
  };
  const poly = (vs: LL[], p: Partial<PropsVector>) => {
    if (vs.length < 3) return;
    poligonos.push({ type: 'Feature', properties: estilo(0.3, p), geometry: { type: 'Polygon', coordinates: [anillo(vs)] } });
  };
  const line = (vs: LL[], p: Partial<PropsVector>) => {
    if (vs.length < 2) return;
    lineas.push({ type: 'Feature', properties: estilo(0.9, p), geometry: { type: 'LineString', coordinates: vs.map(pos) } });
  };
  const point = (v: LL, p: Partial<PropsVector>) => {
    puntos.push({ type: 'Feature', properties: estilo(1, p), geometry: { type: 'Point', coordinates: pos(v) } });
  };

  // ── Predio ──
  if (visible('terreno') && d.mojones.length >= 3) {
    poly(d.mojones, { color: COLOR_PREDIO, opacidad: 0.18, nombre: 'Predio' });
    line([...d.mojones, d.mojones[0]!], { color: COLOR_PREDIO, grosor: 3 });
  }
  for (const m of d.mojones) point(m, { color: COLOR_PREDIO, simbolo: String(m.numero), nombre: `Mojón ${m.numero}` });

  // ── Zonas ──
  for (const z of d.zonas ?? []) {
    const color = z.color ?? CATEGORIAS_ZONA[z.categoria].color;
    poly(z.vertices, { color, opacidad: 0.35, nombre: z.nombre });
    line([...z.vertices, z.vertices[0]!], { color, grosor: 2 });
  }

  // ── Sectores (contorno punteado, sin relleno fuerte) ──
  for (const s of d.sectores ?? []) {
    const color = s.color ?? TIPOS_SECTOR[s.tipo].color;
    poly(s.vertices, { color, opacidad: 0.13, nombre: s.nombre });
    line([...s.vertices, s.vertices[0]!], { color, grosor: 2, dash: 'punteada' });
  }

  // ── Caminos ──
  for (const c of d.caminos ?? []) {
    line(c.vertices, { color: c.color, grosor: 4, nombre: c.nombre });
  }

  // ── Aguadas ──
  for (const a of d.aguadas ?? []) {
    if (a.tipo === 'represa' && a.lat != null && a.lng != null) {
      point({ lat: a.lat, lng: a.lng }, { color: '#1E88E5', simbolo: '💧', nombre: a.nombre });
    } else if (a.vertices && a.vertices.length >= 2) {
      const color = a.tipo === 'swale' ? '#26A69A' : '#66BB6A';
      line(a.vertices, { color, grosor: 3, dash: a.tipo === 'swale' ? 'punteada' : 'rayada', nombre: a.nombre });
    }
  }

  // ── Curvas de nivel (misma regla de maestra que el 2D: cada 5 intervalos) ──
  if (visible('curvasNivel')) {
    const curvas = d.curvas ?? [];
    const cc = d.colorCurvas ?? { normal: '#8D6E63', maestra: '#5D4037' };
    const intervalo = curvas.length >= 2 ? curvas[1]!.cota - curvas[0]!.cota : 0;
    const pasoMaestra = intervalo * 5;
    for (const c of curvas) {
      const maestra = pasoMaestra > 0 && c.cota % pasoMaestra === 0;
      for (const l of c.lineas) {
        const pts = l.cerrada ? [...l.puntos, l.puntos[0]!] : l.puntos;
        line(pts, {
          color: maestra ? cc.maestra : cc.normal,
          grosor: maestra ? 2 : 1.1,
          opacidad: maestra ? 0.85 : 0.55,
          nombre: `${c.cota} m`,
        });
      }
    }
  }

  // ── Pines ──
  for (const p of d.pines ?? []) {
    point(p, { color: p.color, simbolo: p.icono, nombre: p.nombre });
  }

  // ── Dibujos libres ──
  {
    for (const el of d.dibujos ?? []) {
      const base = { color: el.color, nombre: el.nombre ?? '' };
      switch (el.tipo) {
        case 'linea':
        case 'curva':
          line(el.vertices, { ...base, grosor: el.grosor });
          break;
        case 'flecha':
          line(el.vertices, { ...base, grosor: el.grosor });
          break;
        case 'cota':
          line(el.vertices, { ...base, grosor: 2, dash: 'rayada' });
          break;
        case 'poligono':
          poly(el.vertices, { ...base, opacidad: el.opacidad });
          line([...el.vertices, el.vertices[0]!], { ...base, grosor: 2 });
          break;
        case 'circulo':
          poly(circulo(el.lat, el.lng, el.radio), { ...base, opacidad: el.opacidad });
          if (el.simbolo) point({ lat: el.lat, lng: el.lng }, { ...base, simbolo: el.simbolo });
          break;
        case 'texto':
          point(el, { ...base, simbolo: el.texto });
          break;
        case 'punto':
          point(el, { ...base, simbolo: '•' });
          break;
      }
    }
  }

  return {
    poligonos: { type: 'FeatureCollection', features: poligonos },
    lineas:    { type: 'FeatureCollection', features: lineas },
    puntos:    { type: 'FeatureCollection', features: puntos },
    total: poligonos.length + lineas.length + puntos.length,
  };
}
