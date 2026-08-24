/**
 * Exportación a DXF (AutoCAD R12 ASCII) de la planta generada.
 *
 * Por qué R12 y sólo entidades básicas (LINE / CIRCLE / TEXT): es el dialecto
 * que abre sin fricción cualquier CAD —AutoCAD, LibreCAD, QCAD, DraftSight,
 * BricsCAD— y el objetivo acá no es un archivo rico sino un punto de partida
 * editable. El anteproyecto se termina y se valida en CAD; esto ahorra el
 * dibujo base, no reemplaza el trabajo profesional.
 *
 * Unidades: metros. Eje Y hacia arriba (en el motor y en el SVG apunta hacia
 * abajo, así que se invierte al exportar).
 */
import type { AnteproyectoGenerado } from './generador';
import { mobiliarioDe } from './mobiliario';

type Capa = 'MUROS' | 'ABERTURAS' | 'MOBILIARIO' | 'COTAS' | 'TEXTOS' | 'EJES';

const CAPAS: { nombre: Capa; color: number }[] = [
  { nombre: 'MUROS', color: 7 },      // blanco/negro
  { nombre: 'ABERTURAS', color: 5 },  // azul
  { nombre: 'MOBILIARIO', color: 8 }, // gris
  { nombre: 'COTAS', color: 1 },      // rojo
  { nombre: 'TEXTOS', color: 3 },     // verde
  { nombre: 'EJES', color: 4 },       // cyan
];

class ConstructorDXF {
  private lineas: string[] = [];

  private par(codigo: number, valor: string | number) {
    this.lineas.push(String(codigo), String(valor));
  }

  linea(capa: Capa, x1: number, y1: number, x2: number, y2: number) {
    this.par(0, 'LINE');
    this.par(8, capa);
    this.par(10, x1.toFixed(4));
    this.par(20, y1.toFixed(4));
    this.par(11, x2.toFixed(4));
    this.par(21, y2.toFixed(4));
  }

  rectangulo(capa: Capa, x: number, y: number, w: number, h: number) {
    this.linea(capa, x, y, x + w, y);
    this.linea(capa, x + w, y, x + w, y + h);
    this.linea(capa, x + w, y + h, x, y + h);
    this.linea(capa, x, y + h, x, y);
  }

  circulo(capa: Capa, cx: number, cy: number, r: number) {
    this.par(0, 'CIRCLE');
    this.par(8, capa);
    this.par(10, cx.toFixed(4));
    this.par(20, cy.toFixed(4));
    this.par(40, r.toFixed(4));
  }

  texto(capa: Capa, x: number, y: number, altura: number, texto: string) {
    this.par(0, 'TEXT');
    this.par(8, capa);
    this.par(10, x.toFixed(4));
    this.par(20, y.toFixed(4));
    this.par(40, altura.toFixed(4));
    // DXF R12 ASCII no define codificación: se limita a caracteres seguros
    // para que los acentos no lleguen corruptos a CAD.
    this.par(1, sinAcentos(texto));
  }

  construir(): string {
    const cabecera: string[] = [];
    const push = (c: number, v: string | number) => cabecera.push(String(c), String(v));

    // Sección HEADER — unidades en metros.
    push(0, 'SECTION');
    push(2, 'HEADER');
    push(9, '$INSUNITS');
    push(70, 6); // 6 = metros
    push(0, 'ENDSEC');

    // Sección TABLES — definición de capas.
    push(0, 'SECTION');
    push(2, 'TABLES');
    push(0, 'TABLE');
    push(2, 'LAYER');
    push(70, CAPAS.length);
    for (const capa of CAPAS) {
      push(0, 'LAYER');
      push(2, capa.nombre);
      push(70, 0);
      push(62, capa.color);
      push(6, 'CONTINUOUS');
    }
    push(0, 'ENDTAB');
    push(0, 'ENDSEC');

    // Sección ENTITIES.
    push(0, 'SECTION');
    push(2, 'ENTITIES');

    return [...cabecera, ...this.lineas, '0', 'ENDSEC', '0', 'EOF', ''].join('\n');
  }
}

/** DXF R12 ASCII no garantiza UTF-8; se transliteran los acentos del español. */
function sinAcentos(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\x20-\x7E]/g, '');
}

/**
 * Genera el DXF de la planta: muros, aberturas, mobiliario, rótulos y cotas
 * generales, cada cosa en su capa para que se pueda apagar lo que no sirva.
 */
export function exportarPlantaDXF(ap: AnteproyectoGenerado): string {
  const d = new ConstructorDXF();
  // El motor trabaja con Y creciendo hacia abajo; DXF con Y hacia arriba.
  const flipY = (y: number) => ap.profundo_m - y;

  for (const r of ap.ambientes) {
    const y = flipY(r.y_m + r.h_m); // esquina inferior izquierda en coordenadas DXF
    d.rectangulo('MUROS', r.x_m, y, r.w_m, r.h_m);

    // Rótulo del ambiente y su superficie.
    d.texto('TEXTOS', r.x_m + 0.15, y + r.h_m / 2, 0.18, r.nombre);
    d.texto('TEXTOS', r.x_m + 0.15, y + r.h_m / 2 - 0.28, 0.14, `${r.w_m.toFixed(2)} x ${r.h_m.toFixed(2)} m - ${r.area_m2} m2`);

    for (const m of mobiliarioDe(r)) {
      const my = flipY(m.y_m + m.h_m);
      if (m.forma === 'elipse') {
        d.circulo('MOBILIARIO', m.x_m + m.w_m / 2, my + m.h_m / 2, Math.min(m.w_m, m.h_m) / 2);
      } else {
        d.rectangulo('MOBILIARIO', m.x_m, my, m.w_m, m.h_m);
      }
    }
  }

  // Proyección del alero (planta de techos) en su propia capa.
  d.rectangulo('EJES', -ap.alero_m, -ap.alero_m, ap.ancho_m + ap.alero_m * 2, ap.profundo_m + ap.alero_m * 2);

  // Cotas generales del edificio.
  const yCota = -ap.alero_m - 1;
  d.linea('COTAS', 0, yCota, ap.ancho_m, yCota);
  d.texto('COTAS', ap.ancho_m / 2 - 0.5, yCota + 0.15, 0.22, `${ap.ancho_m.toFixed(2)} m`);

  const xCota = -ap.alero_m - 1;
  d.linea('COTAS', xCota, 0, xCota, ap.profundo_m);
  d.texto('COTAS', xCota - 1.6, ap.profundo_m / 2, 0.22, `${ap.profundo_m.toFixed(2)} m`);

  // Ficha técnica al pie del dibujo.
  const t = ap.titulo;
  d.texto('TEXTOS', 0, -ap.alero_m - 2.2, 0.3, `ANTEPROYECTO - ${t}`);
  d.texto(
    'TEXTOS',
    0,
    -ap.alero_m - 2.8,
    0.2,
    `${ap.area_total_m2} m2 - muro ${ap.tecnicaMuro} ${(ap.espesorMuro_m * 100).toFixed(0)} cm - alero ${ap.alero_m.toFixed(2)} m - h muro ${ap.altura_muro_m.toFixed(2)} m`,
  );
  d.texto('TEXTOS', 0, -ap.alero_m - 3.4, 0.16, 'Arte y Tierra - esquema de anteproyecto, verificar en proyecto ejecutivo');

  return d.construir();
}

/** Nombre de archivo sugerido para la descarga. */
export function nombreArchivoDXF(ap: AnteproyectoGenerado, proyecto?: string): string {
  const base = (proyecto || 'anteproyecto').trim().replace(/\s+/g, '-').toLowerCase();
  return sinAcentos(`${base}-${ap.perfil}.dxf`);
}
