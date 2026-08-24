/**
 * Vistas 3D del anteproyecto.
 *
 * Siguen la misma regla que los planos: la volumetría sale de la geometría
 * calculada, no de un generador de imágenes. Son proyecciones axonométricas
 * del MISMO modelo que dibujan la planta, los techos y las fachadas, así que
 * lo que se ve en 3D es exactamente lo que está acotado en los planos: si la
 * cumbrera corre E-O en la planta de techos, corre E-O acá.
 *
 * No son renders fotorrealistas —no hay materiales, vegetación ni cielo—; son
 * vistas volumétricas para entender la casa. Para la imagen fotorrealista está
 * `lib/render/prompt.ts`, que describe este mismo volumen en palabras para
 * pasárselo a un generador de imágenes: ahí la imagen ilustra, no mide.
 */
import { TECNICAS_MURO, type TecnicaMuro } from '../conocimiento/parametros';
import { aberturasExteriores, type Abertura } from './aberturas';
import { hemisferioDe } from './bioclimatica';
import type { AnteproyectoGenerado } from './generador';
import { puntosHuella } from './huella';

/** Coordenadas de mundo: x hacia el este, y hacia el norte, z hacia arriba. */
export interface Punto3 {
  x: number;
  y: number;
  z: number;
}

export interface Cara {
  pts: Punto3[];
  color: string;
  /** 0 = terreno y sombra (siempre al fondo); 1 = edificio. */
  capa: number;
  borde?: string;
  anchoBorde?: number;
  /** El terreno se dibuja plano, sin sombreado direccional. */
  planoDeFondo?: boolean;
}

export interface Vista3D {
  id: string;
  nombre: string;
  /** Rumbo desde el que se mira, en grados desde el norte hacia el este. */
  azimut: number;
  /** Altura del punto de vista sobre el horizonte, en grados. */
  elevacion: number;
  descripcion: string;
}

/**
 * Las cinco vistas que pidió el encargo. Cuatro esquinas para leer el volumen
 * completo (dos altas y dos a la altura de los ojos, que es como se ve la casa
 * al llegar) y una aérea para entender techos y aleros.
 */
export const VISTAS_3D: Vista3D[] = [
  { id: 'ne-alta', nombre: 'Aérea desde el noreste', azimut: 45, elevacion: 32, descripcion: 'Volumen general, encuentro de faldones y aleros.' },
  { id: 'no-alta', nombre: 'Aérea desde el noroeste', azimut: 315, elevacion: 32, descripcion: 'Contracara del volumen: la cara opuesta del techo y los muros.' },
  { id: 'se-ojo', nombre: 'A la vista desde el sureste', azimut: 135, elevacion: 11, descripcion: 'Altura de los ojos: la casa como se ve al llegar caminando.' },
  { id: 'so-ojo', nombre: 'A la vista desde el suroeste', azimut: 225, elevacion: 11, descripcion: 'Altura de los ojos, cara opuesta: proporción de muro y sombra de alero.' },
  { id: 'cenital', nombre: 'Cenital', azimut: 20, elevacion: 62, descripcion: 'Lectura del techo completo y de la proyección del alero sobre el terreno.' },
];

// ── Paleta ──────────────────────────────────────────────────────────────────

/**
 * Color aproximado del muro terminado según la técnica: es el revoque de
 * tierra de esa técnica, no un color de diseño.
 */
const COLOR_MURO: Record<TecnicaMuro, string> = {
  adobe: '#C89B6A',
  tapial: '#C4A277',
  quincha: '#D9C4A0',
  'paja-encofrada': '#DCC896',
  fardos: '#D8C98F',
  cordwood: '#B08A5E',
  'cana-trenzada': '#D2BE97',
};

const COLOR_TECHO = '#8E6A4E';
const COLOR_TIMPANO = '#B99B78';
const COLOR_TERRENO = '#A3B489';
const COLOR_SOMBRA = '#7E8E69';
const COLOR_VIDRIO = '#8FB6CE';
const COLOR_PUERTA = '#6B4E38';
const COLOR_GALERIA = '#C9BC9C';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function aplicarLuz(hex: string, factor: number): string {
  const n = parseInt(hex.slice(1), 16);
  const canal = (desplazamiento: number) =>
    Math.max(0, Math.min(255, Math.round(((n >> desplazamiento) & 255) * factor)));
  return `#${((canal(16) << 16) | (canal(8) << 8) | canal(0)).toString(16).padStart(6, '0')}`;
}

// ── Geometría ───────────────────────────────────────────────────────────────

const rad = (grados: number) => (grados * Math.PI) / 180;

/** Normal de un polígono por el método de Newell (tolera vértices no coplanares). */
function normalDe(pts: Punto3[]): Punto3 {
  let x = 0;
  let y = 0;
  let z = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]!;
    const b = pts[(i + 1) % pts.length]!;
    x += (a.y - b.y) * (a.z + b.z);
    y += (a.z - b.z) * (a.x + b.x);
    z += (a.x - b.x) * (a.y + b.y);
  }
  const largo = Math.hypot(x, y, z) || 1;
  return { x: x / largo, y: y / largo, z: z / largo };
}

function centroide(pts: Punto3[]): Punto3 {
  const s = pts.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y, z: acc.z + p.z }), { x: 0, y: 0, z: 0 });
  return { x: s.x / pts.length, y: s.y / pts.length, z: s.z / pts.length };
}

/**
 * Deja la normal apuntando hacia afuera del edificio invirtiendo el orden de
 * los vértices si hace falta. Sin esto, la mitad de las caras se descartaría
 * por el culling y el volumen aparecería agujereado.
 */
function haciaAfuera(pts: Punto3[], centro: Punto3): Punto3[] {
  const n = normalDe(pts);
  const c = centroide(pts);
  const haciaFuera = n.x * (c.x - centro.x) + n.y * (c.y - centro.y) + n.z * (c.z - centro.z);
  return haciaFuera < 0 ? [...pts].reverse() : pts;
}

/** Dirección desde la que llega la luz, según la latitud real del sitio. */
export function direccionSol(lat: number | undefined): { x: number; y: number; z: number; altitudDeg: number; azimutDeg: number } {
  // Sol de media mañana: la altura del equinoccio a mediodía rebajada, que es
  // cuando el volumen se lee mejor (sombras largas pero no rasantes).
  const altitud = Math.max(20, Math.min(65, (90 - Math.abs(lat ?? 25)) * 0.75));
  // En el hemisferio norte el sol está al sur; en el sur, al norte.
  const azimut = lat === undefined ? 135 : hemisferioDe(lat) === 'sur' ? 45 : 135;
  const a = rad(azimut);
  const e = rad(altitud);
  return { x: Math.sin(a) * Math.cos(e), y: Math.cos(a) * Math.cos(e), z: Math.sin(e), altitudDeg: altitud, azimutDeg: azimut };
}

// ── Modelo ──────────────────────────────────────────────────────────────────

/**
 * Construye las caras del edificio a partir del anteproyecto.
 *
 * Trabaja en coordenadas de planta (x hacia el este, y hacia el sur, como en
 * los planos) y traduce a coordenadas de mundo centradas en el edificio.
 */
export function modelo3D(ap: AnteproyectoGenerado): Cara[] {
  const W = ap.ancho_m;
  const D = ap.profundo_m;
  const hm = ap.altura_muro_m;
  const hc = ap.altura_cumbrera_m;
  const e = ap.alero_m;

  /** De coordenadas de planta a coordenadas de mundo, centrado en el edificio. */
  const P = (px: number, py: number, z: number): Punto3 => ({ x: px - W / 2, y: D / 2 - py, z });

  const centro: Punto3 = { x: 0, y: 0, z: hm / 2 };
  const caras: Cara[] = [];
  const agregar = (pts: Punto3[], color: string, extra: Partial<Cara> = {}) => {
    caras.push({ pts: haciaAfuera(pts, centro), color, capa: 1, borde: '#3B3226', anchoBorde: 0.022, ...extra });
  };

  // Terreno.
  const margen = Math.max(W, D) * 0.45 + e + 2.5;
  caras.push({
    pts: [P(-margen, -margen, -0.02), P(W + margen, -margen, -0.02), P(W + margen, D + margen, -0.02), P(-margen, D + margen, -0.02)],
    color: COLOR_TERRENO,
    capa: 0,
    planoDeFondo: true,
  });

  // Techo a dos aguas: la caída del alero sale de la pendiente real, así que
  // el alero baja respecto del muro en lugar de quedar horizontal.
  const luz = ap.ejeCumbrera === 'E-O' ? D : W;
  const pendiente = luz > 0 ? hc / (luz / 2) : 0;
  const zCumbrera = hm + hc;
  const zAlero = hm - e * pendiente;

  let esquinasTecho: Punto3[];
  if (ap.ejeCumbrera === 'E-O') {
    const yMedio = D / 2;
    agregar([P(-e, -e, zAlero), P(W + e, -e, zAlero), P(W + e, yMedio, zCumbrera), P(-e, yMedio, zCumbrera)], COLOR_TECHO);
    agregar([P(-e, D + e, zAlero), P(W + e, D + e, zAlero), P(W + e, yMedio, zCumbrera), P(-e, yMedio, zCumbrera)], COLOR_TECHO);
    // Tímpanos: el triángulo de muro entre el nivel del muro y la cumbrera.
    agregar([P(0, 0, hm), P(0, D, hm), P(0, yMedio, zCumbrera)], COLOR_TIMPANO);
    agregar([P(W, 0, hm), P(W, D, hm), P(W, yMedio, zCumbrera)], COLOR_TIMPANO);
    esquinasTecho = [
      P(-e, -e, zAlero), P(W + e, -e, zAlero), P(W + e, D + e, zAlero), P(-e, D + e, zAlero),
      P(-e, yMedio, zCumbrera), P(W + e, yMedio, zCumbrera),
    ];
  } else {
    const xMedio = W / 2;
    agregar([P(-e, -e, zAlero), P(-e, D + e, zAlero), P(xMedio, D + e, zCumbrera), P(xMedio, -e, zCumbrera)], COLOR_TECHO);
    agregar([P(W + e, -e, zAlero), P(W + e, D + e, zAlero), P(xMedio, D + e, zCumbrera), P(xMedio, -e, zCumbrera)], COLOR_TECHO);
    agregar([P(0, 0, hm), P(W, 0, hm), P(xMedio, 0, zCumbrera)], COLOR_TIMPANO);
    agregar([P(0, D, hm), P(W, D, hm), P(xMedio, D, zCumbrera)], COLOR_TIMPANO);
    esquinasTecho = [
      P(-e, -e, zAlero), P(W + e, -e, zAlero), P(W + e, D + e, zAlero), P(-e, D + e, zAlero),
      P(xMedio, -e, zCumbrera), P(xMedio, D + e, zCumbrera),
    ];
  }

  // Muros: extrusión del perímetro real de la huella.
  const colorMuro = COLOR_MURO[ap.tecnicaMuro];
  const perimetro = puntosHuella(ap.ambientes, 0);
  for (let i = 0; i < perimetro.length; i++) {
    const [x1, y1] = perimetro[i]!;
    const [x2, y2] = perimetro[(i + 1) % perimetro.length]!;
    agregar([P(x1, y1, 0), P(x2, y2, 0), P(x2, y2, hm), P(x1, y1, hm)], colorMuro);
  }

  // La galería curva del perfil orgánico, como plataforma sobre el terreno.
  if (ap.envolvente === 'organica') {
    const d = e * 1.6;
    const pts: Punto3[] = [];
    for (let i = 0; i < 48; i++) {
      const t = (i / 48) * Math.PI * 2;
      pts.push(P(W / 2 + (W / 2 + d) * Math.cos(t), D / 2 + (D / 2 + d) * Math.sin(t), 0.06));
    }
    caras.push({ pts, color: COLOR_GALERIA, capa: 0, borde: '#8a8a80', anchoBorde: 0.02 });
  }

  // Aberturas: separadas 4 cm del plano del muro para que el ordenamiento por
  // profundidad las dibuje siempre por delante de su propio muro.
  const SALIENTE = 0.04;
  for (const a of aberturasExteriores(ap)) {
    agregar(puntosAbertura(a, P, SALIENTE), a.clase === 'ventana' ? COLOR_VIDRIO : COLOR_PUERTA, { anchoBorde: 0.018 });
  }

  // Sombra proyectada del techo sobre el terreno.
  const sol = direccionSol(ap.lat);
  if (sol.z > 0.05) {
    const proyectados = esquinasTecho.map(p => ({
      x: p.x - (p.z / sol.z) * sol.x,
      y: p.y - (p.z / sol.z) * sol.y,
      z: 0.01,
    }));
    const contorno = envolventeConvexa(proyectados);
    if (contorno.length >= 3) caras.push({ pts: contorno, color: COLOR_SOMBRA, capa: 0, planoDeFondo: true });
  }

  return caras;
}

function puntosAbertura(a: Abertura, P: (px: number, py: number, z: number) => Punto3, saliente: number): Punto3[] {
  const i = a.centro_m - a.ancho_m / 2;
  const f = a.centro_m + a.ancho_m / 2;
  const z0 = a.antepecho_m;
  const z1 = a.antepecho_m + a.alto_m;
  switch (a.lado) {
    case 'N': {
      const y = a.plano_m - saliente;
      return [P(i, y, z0), P(f, y, z0), P(f, y, z1), P(i, y, z1)];
    }
    case 'S': {
      const y = a.plano_m + saliente;
      return [P(i, y, z0), P(f, y, z0), P(f, y, z1), P(i, y, z1)];
    }
    case 'O': {
      const x = a.plano_m - saliente;
      return [P(x, i, z0), P(x, f, z0), P(x, f, z1), P(x, i, z1)];
    }
    default: {
      const x = a.plano_m + saliente;
      return [P(x, i, z0), P(x, f, z0), P(x, f, z1), P(x, i, z1)];
    }
  }
}

/** Envolvente convexa en planta (cadena monótona), para la sombra del techo. */
function envolventeConvexa(pts: Punto3[]): Punto3[] {
  const orden = [...pts].sort((a, b) => a.x - b.x || a.y - b.y);
  if (orden.length < 3) return orden;
  const cruz = (o: Punto3, a: Punto3, b: Punto3) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const media = (fuente: Punto3[]): Punto3[] => {
    const salida: Punto3[] = [];
    for (const p of fuente) {
      while (salida.length >= 2 && cruz(salida[salida.length - 2]!, salida[salida.length - 1]!, p) <= 0) salida.pop();
      salida.push(p);
    }
    salida.pop();
    return salida;
  };
  return [...media(orden), ...media(orden.reverse())];
}

// ── Proyección ──────────────────────────────────────────────────────────────

interface Camara {
  /** Hacia la cámara: sirve de eje de profundidad y para descartar caras. */
  c: Punto3;
  /** Derecha en pantalla. */
  u: Punto3;
  /** Arriba en pantalla. */
  v: Punto3;
}

export function camaraDe(azimutDeg: number, elevacionDeg: number): Camara {
  const a = rad(azimutDeg);
  const e = rad(elevacionDeg);
  return {
    c: { x: Math.sin(a) * Math.cos(e), y: Math.cos(a) * Math.cos(e), z: Math.sin(e) },
    u: { x: -Math.cos(a), y: Math.sin(a), z: 0 },
    v: { x: -Math.sin(a) * Math.sin(e), y: -Math.cos(a) * Math.sin(e), z: Math.cos(e) },
  };
}

const punto = (a: Punto3, b: Punto3) => a.x * b.x + a.y * b.y + a.z * b.z;

/** Proyección axonométrica: sin punto de fuga, las paralelas siguen paralelas. */
function proyectar(p: Punto3, cam: Camara): { x: number; y: number } {
  return { x: punto(p, cam.u), y: -punto(p, cam.v) };
}

// ── Render ──────────────────────────────────────────────────────────────────

export function renderVista3D(ap: AnteproyectoGenerado, vista: Vista3D): string {
  const cam = camaraDe(vista.azimut, vista.elevacion);
  const sol = direccionSol(ap.lat);
  const caras = modelo3D(ap);

  const visibles = caras
    .map(cara => {
      const n = normalDe(cara.pts);
      const haciaCamara = punto(n, cam.c);
      const profundidad = punto(centroide(cara.pts), cam.c);
      return { cara, n, haciaCamara, profundidad };
    })
    // Caras que miran para el otro lado: no se ven y taparían el interior.
    .filter(f => f.cara.capa === 0 || f.haciaCamara > 0.001)
    .sort((a, b) => a.cara.capa - b.cara.capa || a.profundidad - b.profundidad);

  // Encuadre: se calcula sobre los puntos realmente dibujados.
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  const proyectadas = visibles.map(f => {
    const pts = f.cara.pts.map(p => proyectar(p, cam));
    for (const p of pts) {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }
    return { ...f, pts };
  });
  if (!Number.isFinite(minX)) return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"></svg>';

  const cuerpo = proyectadas
    .map(f => {
      const lambert = Math.max(0, punto(f.n, sol));
      // Algo de luz difusa de cielo para que las caras a contraluz no queden
      // negras: una casa nunca se ve así.
      const luz = f.cara.planoDeFondo ? 1 : 0.5 + 0.5 * lambert;
      const d = f.pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(3)} ${p.y.toFixed(3)}`).join(' ') + ' Z';
      const borde = f.cara.borde
        ? ` stroke="${f.cara.borde}" stroke-width="${f.cara.anchoBorde ?? 0.02}" stroke-linejoin="round"`
        : '';
      return `<path d="${d}" fill="${aplicarLuz(f.cara.color, luz)}"${borde}/>`;
    })
    .join('');

  const escala = escalaHumana(ap, cam);
  const rosa = rosaDeLosVientos(ap, cam);

  const pad = Math.max(maxX - minX, maxY - minY) * 0.07 + 0.6;
  const vbX = minX - pad;
  const vbY = minY - pad * 1.9; // margen extra arriba para el rótulo
  const vbW = maxX - minX + pad * 2;
  const vbH = maxY - minY + pad * 2.9;
  const fuente = vbW * 0.028;

  const rotulo = `<text x="${vbX + pad * 0.4}" y="${vbY + fuente * 1.5}" font-size="${fuente}" fill="#2b2b28" font-family="var(--font-sans, sans-serif)">${esc(vista.nombre)} · ${ap.ancho_m.toFixed(2)} × ${ap.profundo_m.toFixed(2)} m · h. total ${ap.altura_total_m.toFixed(2)} m</text>`;

  return `<svg viewBox="${vbX.toFixed(2)} ${vbY.toFixed(2)} ${vbW.toFixed(2)} ${vbH.toFixed(2)}" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif">
    <rect x="${vbX.toFixed(2)}" y="${vbY.toFixed(2)}" width="${vbW.toFixed(2)}" height="${vbH.toFixed(2)}" fill="#EDF1E6"/>
    ${cuerpo}
    ${escala}
    ${rosa}
    ${rotulo}
  </svg>`;
}

/**
 * Figura humana de 1,70 m junto al edificio. Es la referencia que vuelve
 * legible la escala: sin ella una axonometría de una casa de 90 m² y una de
 * 300 m² se ven igual.
 */
function escalaHumana(ap: AnteproyectoGenerado, cam: Camara): string {
  const distancia = Math.max(ap.ancho_m, ap.profundo_m) / 2 + ap.alero_m + 2.2;
  const horizontal = Math.hypot(cam.c.x, cam.c.y) || 1;
  const base: Punto3 = { x: (cam.c.x / horizontal) * distancia, y: (cam.c.y / horizontal) * distancia, z: 0 };
  const pies = proyectar(base, cam);
  const hombros = proyectar({ ...base, z: 1.42 }, cam);
  const cabeza = proyectar({ ...base, z: 1.62 }, cam);
  return `
    <line x1="${pies.x.toFixed(3)}" y1="${pies.y.toFixed(3)}" x2="${hombros.x.toFixed(3)}" y2="${hombros.y.toFixed(3)}" stroke="#3B3226" stroke-width="0.42" stroke-linecap="round"/>
    <circle cx="${cabeza.x.toFixed(3)}" cy="${cabeza.y.toFixed(3)}" r="0.17" fill="#3B3226"/>
  `;
}

/** Flecha al norte, apoyada en el terreno y proyectada como el resto. */
function rosaDeLosVientos(ap: AnteproyectoGenerado, cam: Camara): string {
  const r = Math.max(ap.ancho_m, ap.profundo_m) / 2 + ap.alero_m + 1.6;
  const origen: Punto3 = { x: -r, y: -r, z: 0.02 };
  const punta: Punto3 = { x: -r, y: -r + 2, z: 0.02 };
  const a = proyectar(origen, cam);
  const b = proyectar(punta, cam);
  return `
    <line x1="${a.x.toFixed(3)}" y1="${a.y.toFixed(3)}" x2="${b.x.toFixed(3)}" y2="${b.y.toFixed(3)}" stroke="#2b2b28" stroke-width="0.06"/>
    <circle cx="${b.x.toFixed(3)}" cy="${b.y.toFixed(3)}" r="0.16" fill="#2b2b28"/>
    <text x="${b.x.toFixed(3)}" y="${(b.y - 0.35).toFixed(3)}" font-size="0.5" text-anchor="middle" fill="#2b2b28">N</text>
  `;
}

/** Nombre legible de la técnica, para rótulos y prompts. */
export function nombreTecnica(t: TecnicaMuro): string {
  return TECNICAS_MURO[t].nombre;
}
