import type { AnteproyectoGenerado } from './generador';
import type { RectanguloAmbiente } from './layout';
import { mobiliarioDe, type Mueble } from './mobiliario';

/**
 * Render de planta / techos / fachada a SVG con cotas.
 *
 * Deliberadamente NO usa generación de imágenes: cada línea sale de la
 * geometría real calculada por el motor (`lib/motor/layout.ts`), así que las
 * medidas siempre cierran. Es un plano esquemático de anteproyecto — el nivel
 * de detalle (una sola cota general por lado, un aventanamiento
 * representativo) es apropiado para elegir entre 3 opciones, no para obra;
 * el DXF exportado se termina de ajustar en CAD antes de construir.
 */

const PX_M = 32; // píxeles por metro
const MARGEN = 70; // margen para cotas alrededor del dibujo

const TIPOS_CON_VENTANA = new Set([
  'dormitorio',
  'estar-cocina-comedor',
  'estudio',
  'taller',
  'galeria',
  'invernadero',
]);

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ─── Cotas ──────────────────────────────────────────────────────────────────

function cotaHorizontal(xIni: number, xFin: number, y: number, texto: string): string {
  return `
    <line x1="${xIni}" y1="${y - 4}" x2="${xIni}" y2="${y + 4}" stroke="#2b2b28" stroke-width="1"/>
    <line x1="${xFin}" y1="${y - 4}" x2="${xFin}" y2="${y + 4}" stroke="#2b2b28" stroke-width="1"/>
    <line x1="${xIni}" y1="${y}" x2="${xFin}" y2="${y}" stroke="#2b2b28" stroke-width="1"/>
    <text x="${(xIni + xFin) / 2}" y="${y - 6}" font-size="11" text-anchor="middle" fill="#2b2b28" font-family="var(--font-sans, sans-serif)">${esc(texto)}</text>
  `;
}

function cotaVertical(yIni: number, yFin: number, x: number, texto: string): string {
  return `
    <line x1="${x - 4}" y1="${yIni}" x2="${x + 4}" y2="${yIni}" stroke="#2b2b28" stroke-width="1"/>
    <line x1="${x - 4}" y1="${yFin}" x2="${x + 4}" y2="${yFin}" stroke="#2b2b28" stroke-width="1"/>
    <line x1="${x}" y1="${yIni}" x2="${x}" y2="${yFin}" stroke="#2b2b28" stroke-width="1"/>
    <text x="${x - 8}" y="${(yIni + yFin) / 2}" font-size="11" text-anchor="middle" fill="#2b2b28" font-family="var(--font-sans, sans-serif)" transform="rotate(-90 ${x - 8} ${(yIni + yFin) / 2})">${esc(texto)}</text>
  `;
}

// ─── Puertas y ventanas ─────────────────────────────────────────────────────

interface SegmentoCompartido {
  a: RectanguloAmbiente;
  b: RectanguloAmbiente;
  orientacion: 'vertical' | 'horizontal';
  ini: number;
  fin: number;
  coord: number; // x fijo si vertical, y fijo si horizontal
}

function segmentosCompartidos(rects: RectanguloAmbiente[], tol = 0.03): SegmentoCompartido[] {
  const segs: SegmentoCompartido[] = [];
  for (let i = 0; i < rects.length; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i]!;
      const b = rects[j]!;
      // Pared vertical compartida (a la derecha de a == izquierda de b, o viceversa)
      if (Math.abs(a.x_m + a.w_m - b.x_m) < tol || Math.abs(b.x_m + b.w_m - a.x_m) < tol) {
        const ini = Math.max(a.y_m, b.y_m);
        const fin = Math.min(a.y_m + a.h_m, b.y_m + b.h_m);
        if (fin - ini > 0.6) {
          const coord = Math.abs(a.x_m + a.w_m - b.x_m) < tol ? a.x_m + a.w_m : b.x_m + b.w_m;
          segs.push({ a, b, orientacion: 'vertical', ini, fin, coord });
        }
      }
      // Pared horizontal compartida
      if (Math.abs(a.y_m + a.h_m - b.y_m) < tol || Math.abs(b.y_m + b.h_m - a.y_m) < tol) {
        const ini = Math.max(a.x_m, b.x_m);
        const fin = Math.min(a.x_m + a.w_m, b.x_m + b.w_m);
        if (fin - ini > 0.6) {
          const coord = Math.abs(a.y_m + a.h_m - b.y_m) < tol ? a.y_m + a.h_m : b.y_m + b.h_m;
          segs.push({ a, b, orientacion: 'horizontal', ini, fin, coord });
        }
      }
    }
  }
  return segs;
}

function elegirPuertas(rects: RectanguloAmbiente[]): SegmentoCompartido[] {
  const segs = segmentosCompartidos(rects);
  const conPuerta = new Set<string>();
  const puertas: SegmentoCompartido[] = [];
  const clave = (r1: RectanguloAmbiente, r2: RectanguloAmbiente) => [r1.id, r2.id].sort().join('|');

  // 1) adyacencias deseadas que además son físicamente contiguas
  for (const s of segs) {
    const deseada =
      s.a.adyacenciasDeseadas.includes(s.b.origenId) || s.b.adyacenciasDeseadas.includes(s.a.origenId);
    if (deseada) {
      puertas.push(s);
      conPuerta.add(s.a.id);
      conPuerta.add(s.b.id);
    }
  }
  // 2) cualquier ambiente sin puerta todavía: se conecta por su pared compartida más larga
  for (const r of rects) {
    if (conPuerta.has(r.id)) continue;
    const candidatas = segs
      .filter(s => s.a.id === r.id || s.b.id === r.id)
      .sort((x, y) => y.fin - y.ini - (x.fin - x.ini));
    if (candidatas[0]) {
      puertas.push(candidatas[0]);
      conPuerta.add(r.id);
      conPuerta.add(candidatas[0].a.id === r.id ? candidatas[0].b.id : candidatas[0].a.id);
    }
  }
  return puertas;
}

function svgPuerta(s: SegmentoCompartido): string {
  const ANCHO_PUERTA = 0.9;
  const centro = (s.ini + s.fin) / 2;
  const p1 = Math.max(s.ini, centro - ANCHO_PUERTA / 2) * PX_M;
  const p2 = Math.min(s.fin, centro + ANCHO_PUERTA / 2) * PX_M;
  if (s.orientacion === 'vertical') {
    const x = s.coord * PX_M;
    return `
      <line x1="${x}" y1="${p1}" x2="${x}" y2="${p2}" stroke="#FBF8F3" stroke-width="3"/>
      <path d="M ${x} ${p1} A ${p2 - p1} ${p2 - p1} 0 0 1 ${x + (p2 - p1)} ${p1 + (p2 - p1)}" fill="none" stroke="#8a8a80" stroke-width="0.75" stroke-dasharray="2,2"/>
    `;
  }
  const y = s.coord * PX_M;
  return `
    <line x1="${p1}" y1="${y}" x2="${p2}" y2="${y}" stroke="#FBF8F3" stroke-width="3"/>
    <path d="M ${p1} ${y} A ${p2 - p1} ${p2 - p1} 0 0 1 ${p1 + (p2 - p1)} ${y + (p2 - p1)}" fill="none" stroke="#8a8a80" stroke-width="0.75" stroke-dasharray="2,2"/>
  `;
}

function svgVentanasDe(r: RectanguloAmbiente): string {
  if (!TIPOS_CON_VENTANA.has(r.tipo)) return '';
  const lados: Array<{ activo: boolean; horizontal: boolean; largo: number; base: () => string }> = [
    {
      activo: r.exteriorNorte,
      horizontal: true,
      largo: r.w_m,
      base: () => {
        const w = Math.min(Math.max(r.w_m * 0.4, 0.8), 2.4);
        const cx = r.x_m + r.w_m / 2;
        const y = r.y_m * PX_M;
        return `<line x1="${(cx - w / 2) * PX_M}" y1="${y}" x2="${(cx + w / 2) * PX_M}" y2="${y}" stroke="#7fa3c9" stroke-width="3.5"/>`;
      },
    },
    {
      activo: r.exteriorSur,
      horizontal: true,
      largo: r.w_m,
      base: () => {
        const w = Math.min(Math.max(r.w_m * 0.4, 0.8), 2.4);
        const cx = r.x_m + r.w_m / 2;
        const y = (r.y_m + r.h_m) * PX_M;
        return `<line x1="${(cx - w / 2) * PX_M}" y1="${y}" x2="${(cx + w / 2) * PX_M}" y2="${y}" stroke="#7fa3c9" stroke-width="3.5"/>`;
      },
    },
    {
      activo: r.exteriorOeste,
      horizontal: false,
      largo: r.h_m,
      base: () => {
        const h = Math.min(Math.max(r.h_m * 0.4, 0.8), 2.4);
        const cy = r.y_m + r.h_m / 2;
        const x = r.x_m * PX_M;
        return `<line x1="${x}" y1="${(cy - h / 2) * PX_M}" x2="${x}" y2="${(cy + h / 2) * PX_M}" stroke="#7fa3c9" stroke-width="3.5"/>`;
      },
    },
    {
      activo: r.exteriorEste,
      horizontal: false,
      largo: r.h_m,
      base: () => {
        const h = Math.min(Math.max(r.h_m * 0.4, 0.8), 2.4);
        const cy = r.y_m + r.h_m / 2;
        const x = (r.x_m + r.w_m) * PX_M;
        return `<line x1="${x}" y1="${(cy - h / 2) * PX_M}" x2="${x}" y2="${(cy + h / 2) * PX_M}" stroke="#7fa3c9" stroke-width="3.5"/>`;
      },
    },
  ];
  // Una sola ventana representativa: el lado exterior más largo.
  const elegido = lados.filter(l => l.activo).sort((a, b) => b.largo - a.largo)[0];
  return elegido ? elegido.base() : '';
}

// ─── Mobiliario ─────────────────────────────────────────────────────────────

function svgMueble(m: Mueble): string {
  const x = m.x_m * PX_M;
  const y = m.y_m * PX_M;
  const w = m.w_m * PX_M;
  const h = m.h_m * PX_M;
  const cuerpo =
    m.forma === 'elipse'
      ? `<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}" fill="#E4DCCB" stroke="#9a9184" stroke-width="1"/>`
      : `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#E4DCCB" stroke="#9a9184" stroke-width="1"/>`;
  // La etiqueta solo entra si el mueble es suficientemente grande en pantalla.
  const etiqueta =
    m.etiqueta && w > 34 && h > 14
      ? `<text x="${x + w / 2}" y="${y + h / 2 + 3}" font-size="8" text-anchor="middle" fill="#6b6357" font-family="var(--font-sans, sans-serif)">${esc(m.etiqueta)}</text>`
      : '';
  return cuerpo + etiqueta;
}

/**
 * Envolvente curva del perfil orgánico.
 *
 * Los ambientes se siguen resolviendo como rectángulos —hay que poder acotar
 * y construir la planta— pero el perímetro exterior se traza con curvas que
 * envuelven la huella y desbordan hacia el paisaje. Es la lectura honesta de
 * lo que este perfil propone en anteproyecto: el gesto orgánico está en la
 * envolvente y en las galerías, no en muros interiores imposibles de cotar.
 */
function envolventeOrganica(ancho_m: number, profundo_m: number, desborde_m: number): string {
  const w = ancho_m * PX_M;
  const h = profundo_m * PX_M;
  const d = desborde_m * PX_M;
  // Puntos de control desplazados hacia afuera en el medio de cada lado.
  return [
    `M ${-d} ${h / 2}`,
    `C ${-d} ${-d * 0.6}, ${w * 0.18} ${-d}, ${w / 2} ${-d}`,
    `C ${w * 0.82} ${-d}, ${w + d} ${-d * 0.6}, ${w + d} ${h / 2}`,
    `C ${w + d} ${h + d * 0.6}, ${w * 0.82} ${h + d}, ${w / 2} ${h + d}`,
    `C ${w * 0.18} ${h + d}, ${-d} ${h + d * 0.6}, ${-d} ${h / 2}`,
    'Z',
  ].join(' ');
}

// ─── Planta ─────────────────────────────────────────────────────────────────

export function renderPlanta(ap: AnteproyectoGenerado): string {
  const anchoPx = ap.ancho_m * PX_M;
  const profundoPx = ap.profundo_m * PX_M;
  const w = anchoPx + MARGEN * 2;
  const h = profundoPx + MARGEN * 2;

  const puertas = elegirPuertas(ap.ambientes);
  // El muro se dibuja como un trazo del espesor real de la técnica elegida,
  // centrado sobre la línea de eje entre ambientes (convención de esquema).
  const espesorPx = Math.max(ap.espesorMuro_m * PX_M, 2);

  const salas = ap.ambientes
    .map(r => {
      const x = r.x_m * PX_M;
      const y = r.y_m * PX_M;
      const rw = r.w_m * PX_M;
      const rh = r.h_m * PX_M;
      return `
        <rect x="${x}" y="${y}" width="${rw}" height="${rh}" fill="#F2EDE3" stroke="#2b2b28" stroke-width="${espesorPx}"/>
      `;
    })
    .join('');

  const muebles = ap.ambientes.flatMap(mobiliarioDe).map(svgMueble).join('');

  const rotulos = ap.ambientes
    .map(r => {
      const cx = (r.x_m + r.w_m / 2) * PX_M;
      const cy = (r.y_m + r.h_m / 2) * PX_M;
      return `
        <text x="${cx}" y="${cy - 5}" font-size="11" text-anchor="middle" fill="#2b2b28" font-family="var(--font-sans, sans-serif)" paint-order="stroke" stroke="#F2EDE3" stroke-width="3">${esc(r.nombre)}</text>
        <text x="${cx}" y="${cy + 9}" font-size="9.5" text-anchor="middle" fill="#5a5a52" font-family="var(--font-sans, sans-serif)" paint-order="stroke" stroke="#F2EDE3" stroke-width="3">${r.w_m.toFixed(1)}×${r.h_m.toFixed(1)} m · ${r.area_m2} m²</text>
      `;
    })
    .join('');

  const ventanas = ap.ambientes.map(svgVentanasDe).join('');
  const puertasS = puertas.map(svgPuerta).join('');

  const cotaTop = cotaHorizontal(0, anchoPx, -28, `${ap.ancho_m.toFixed(2)} m`);
  const cotaLeft = cotaVertical(0, profundoPx, -28, `${ap.profundo_m.toFixed(2)} m`);

  const norte = `<g transform="translate(${anchoPx - 4}, -50)"><circle r="12" fill="none" stroke="#2b2b28" stroke-width="1"/><text x="0" y="4" font-size="11" text-anchor="middle" fill="#2b2b28">N</text><path d="M0,-10 L0,10" stroke="#2b2b28" stroke-width="1"/><path d="M0,-10 L-3,-5 M0,-10 L3,-5" stroke="#2b2b28" stroke-width="1"/></g>`;

  const envolvente =
    ap.envolvente === 'organica'
      ? `<path d="${envolventeOrganica(ap.ancho_m, ap.profundo_m, ap.alero_m * 1.6)}" fill="#EFE7D6" fill-opacity="0.55" stroke="#8a8a80" stroke-width="1.5" stroke-dasharray="7,4"/>`
      : '';

  return `<svg viewBox="${-MARGEN} ${-MARGEN} ${w} ${h}" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif">
    <rect x="${-MARGEN}" y="${-MARGEN}" width="${w}" height="${h}" fill="#FBF8F3"/>
    ${envolvente}
    ${salas}
    ${muebles}
    ${ventanas}
    ${puertasS}
    ${rotulos}
    ${cotaTop}
    ${cotaLeft}
    ${norte}
  </svg>`;
}

// ─── Techos ─────────────────────────────────────────────────────────────────

/**
 * Extensión de cada banda de ambientes: y de inicio, y de fin y ancho.
 * Las filas no siempre tienen el mismo ancho, así que la huella real puede
 * ser escalonada (una casa en L) y no un rectángulo.
 */
function bandasDe(ap: AnteproyectoGenerado): { y0: number; y1: number; ancho: number }[] {
  const porFila = new Map<number, { y0: number; y1: number; ancho: number }>();
  for (const r of ap.ambientes) {
    const actual = porFila.get(r.fila);
    if (actual) {
      actual.y0 = Math.min(actual.y0, r.y_m);
      actual.y1 = Math.max(actual.y1, r.y_m + r.h_m);
      actual.ancho = Math.max(actual.ancho, r.x_m + r.w_m);
    } else {
      porFila.set(r.fila, { y0: r.y_m, y1: r.y_m + r.h_m, ancho: r.x_m + r.w_m });
    }
  }
  return [...porFila.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v);
}

/**
 * Polígono escalonado que envuelve la huella, opcionalmente expandido por el
 * alero. Dibujar un rectángulo envolvente en su lugar mostraría techo sobre
 * un vacío que en la planta no existe.
 */
function contornoHuella(ap: AnteproyectoGenerado, expansion_m: number): string {
  const bandas = bandasDe(ap);
  if (!bandas.length) return '';
  const e = expansion_m;
  const p: string[] = [];
  const px = (v: number) => (v * PX_M).toFixed(2);

  // Lado izquierdo (todas las filas arrancan en x = 0) y lado derecho en escalera.
  p.push(`M ${px(-e)} ${px(bandas[0]!.y0 - e)}`);
  bandas.forEach((b, i) => {
    const yTop = i === 0 ? b.y0 - e : b.y0;
    p.push(`L ${px(b.ancho + e)} ${px(yTop)}`);
    const yBot = i === bandas.length - 1 ? b.y1 + e : b.y1;
    p.push(`L ${px(b.ancho + e)} ${px(yBot)}`);
  });
  p.push(`L ${px(-e)} ${px(bandas[bandas.length - 1]!.y1 + e)}`);
  p.push('Z');
  return p.join(' ');
}

export function renderTechos(ap: AnteproyectoGenerado): string {
  const alero = ap.alero_m;
  const anchoTotal = ap.ancho_m + alero * 2;
  const profundoTotal = ap.profundo_m + alero * 2;
  const w = anchoTotal * PX_M + MARGEN * 2;
  const h = profundoTotal * PX_M + MARGEN * 2;

  const proyeccion =
    ap.envolvente === 'organica'
      ? `<path d="${envolventeOrganica(ap.ancho_m, ap.profundo_m, alero)}" fill="#EFE7D6" stroke="#2b2b28" stroke-width="2"/>`
      : `<path d="${contornoHuella(ap, alero)}" fill="#EFE7D6" stroke="#2b2b28" stroke-width="2"/>`;
  const huella = `<path d="${contornoHuella(ap, 0)}" fill="none" stroke="#c8bfa8" stroke-width="1" stroke-dasharray="3,3"/>`;

  // Cumbrera esquemática por banda, a lo largo del eje mayor de cada una.
  const cumbreras = bandasDe(ap)
    .map(b => {
      const yMedio = ((b.y0 + b.y1) / 2) * PX_M;
      return `<line x1="${-alero * PX_M}" y1="${yMedio}" x2="${(b.ancho + alero) * PX_M}" y2="${yMedio}" stroke="#2b2b28" stroke-width="1.5" stroke-dasharray="6,3"/>`;
    })
    .join('');

  const cotaTop = cotaHorizontal(-alero * PX_M, (ap.ancho_m + alero) * PX_M, -28, `${anchoTotal.toFixed(2)} m (proy. máx.)`);
  const cotaLeft = cotaVertical(-alero * PX_M, (ap.profundo_m + alero) * PX_M, -28, `${profundoTotal.toFixed(2)} m (proy. máx.)`);
  const cotaAlero = cotaHorizontal(-alero * PX_M, 0, -8, `alero ${alero.toFixed(2)} m`);

  const vbX = -MARGEN - alero * PX_M;
  const vbY = -MARGEN - alero * PX_M;

  return `<svg viewBox="${vbX} ${vbY} ${w} ${h}" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif">
    <rect x="${vbX}" y="${vbY}" width="${w}" height="${h}" fill="#FBF8F3"/>
    ${proyeccion}
    ${huella}
    ${cumbreras}
    ${cotaTop}
    ${cotaLeft}
    ${cotaAlero}
  </svg>`;
}

// ─── Fachada ────────────────────────────────────────────────────────────────

export function renderFachada(ap: AnteproyectoGenerado, lado: 'N' | 'S' | 'E' | 'O'): string {
  const esNS = lado === 'N' || lado === 'S';
  const anchoFachada_m = esNS ? ap.ancho_m : ap.profundo_m;
  const alturaCumbrera = Math.min(Math.max((anchoFachada_m / 2) * (ap.pendiente_techo_pct / 100), 0.8), 4);
  const alturaTotal_m = ap.altura_muro_m + alturaCumbrera;

  const anchoPx = anchoFachada_m * PX_M;
  const alturaMuroPx = ap.altura_muro_m * PX_M;
  const alturaCumbreraPx = alturaCumbrera * PX_M;
  const aleroPx = ap.alero_m * PX_M;
  const w = anchoPx + aleroPx * 2 + MARGEN * 2;
  const h = alturaMuroPx + alturaCumbreraPx + MARGEN * 2;

  const yPiso = alturaMuroPx + alturaCumbreraPx;

  const muro = `<rect x="0" y="${alturaCumbreraPx}" width="${anchoPx}" height="${alturaMuroPx}" fill="#F2EDE3" stroke="#2b2b28" stroke-width="2"/>`;
  const techo = `<path d="M ${-aleroPx} ${alturaCumbreraPx} L ${anchoPx / 2} 0 L ${anchoPx + aleroPx} ${alturaCumbreraPx} Z" fill="#DDD2B8" stroke="#2b2b28" stroke-width="2"/>`;
  const piso = `<line x1="${-aleroPx - 10}" y1="${yPiso}" x2="${anchoPx + aleroPx + 10}" y2="${yPiso}" stroke="#2b2b28" stroke-width="2"/>`;

  // Ventanas: ambientes con lado exterior == `lado`, proyectados sobre el eje correspondiente.
  const flagLado = { N: 'exteriorNorte', S: 'exteriorSur', E: 'exteriorEste', O: 'exteriorOeste' } as const;
  const ventanas = ap.ambientes
    .filter(r => r[flagLado[lado]] && TIPOS_CON_VENTANA.has(r.tipo))
    .map(r => {
      const centro = esNS ? r.x_m + r.w_m / 2 : r.y_m + r.h_m / 2;
      const largo = esNS ? r.w_m : r.h_m;
      const anchoVentana = Math.min(Math.max(largo * 0.4, 0.8), 2.4);
      const x = (centro - anchoVentana / 2) * PX_M;
      const wpx = anchoVentana * PX_M;
      const yV = alturaCumbreraPx + alturaMuroPx * 0.28;
      const hV = alturaMuroPx * 0.5;
      return `<rect x="${x}" y="${yV}" width="${wpx}" height="${hV}" fill="#DCE9F0" stroke="#2b2b28" stroke-width="1.5"/>`;
    })
    .join('');

  const cotaAncho = cotaHorizontal(0, anchoPx, yPiso + 30, `${anchoFachada_m.toFixed(2)} m`);
  const cotaAlturaMuro = cotaVertical(alturaCumbreraPx, yPiso, -28, `h. muro ${ap.altura_muro_m.toFixed(2)} m`);
  const cotaAlturaTotal = cotaVertical(0, yPiso, -52, `h. total ${alturaTotal_m.toFixed(2)} m`);
  const nivelPiso = `<text x="${anchoPx + aleroPx + 14}" y="${yPiso + 4}" font-size="10" fill="#2b2b28">± 0.00 NPT</text>`;

  return `<svg viewBox="${-MARGEN - aleroPx} -${MARGEN - alturaCumbreraPx > 0 ? MARGEN : MARGEN} ${w} ${h + 20}" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif">
    <rect x="${-MARGEN - aleroPx}" y="${-MARGEN}" width="${w}" height="${h + 20}" fill="#FBF8F3"/>
    ${techo}
    ${muro}
    ${ventanas}
    ${piso}
    ${nivelPiso}
    ${cotaAncho}
    ${cotaAlturaMuro}
    ${cotaAlturaTotal}
  </svg>`;
}
