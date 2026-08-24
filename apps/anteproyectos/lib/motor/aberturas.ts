/**
 * Aberturas sobre el perímetro exterior, resueltas una sola vez.
 *
 * La planta, las fachadas y las vistas 3D dibujan las mismas ventanas: si cada
 * salida las dedujera por su cuenta, la planta podía mostrar una ventana al
 * norte y la fachada norte no tenerla. Acá se decide una vez y las tres leen
 * de la misma lista.
 *
 * Es aventanamiento de anteproyecto: una abertura representativa por ambiente,
 * en su lado exterior más largo. El aventanamiento definitivo —cantidad, tipo
 * de carpintería, verificación de superficie mínima de iluminación y
 * ventilación— es materia del proyecto ejecutivo.
 */
import type { AnteproyectoGenerado } from './generador';
import type { RectanguloAmbiente } from './layout';

export type Lado = 'N' | 'S' | 'E' | 'O';

export interface Abertura {
  ambienteId: string;
  clase: 'ventana' | 'puerta';
  lado: Lado;
  /** Plano del muro: coordenada y si el lado es N/S, coordenada x si es E/O. */
  plano_m: number;
  /** Centro de la abertura sobre el eje del muro: x si N/S, y si E/O. */
  centro_m: number;
  ancho_m: number;
  antepecho_m: number;
  alto_m: number;
}

export const TIPOS_CON_VENTANA = new Set([
  'dormitorio',
  'estar-cocina-comedor',
  'estudio',
  'taller',
  'galeria',
  'invernadero',
]);

const ANTEPECHO_M = 0.9;
const ALTO_VENTANA_M = 1.4;
const ANCHO_PUERTA_M = 0.9;
const ALTO_PUERTA_M = 2.1;

interface LadoExterior {
  lado: Lado;
  plano_m: number;
  /** Largo del muro exterior de ese ambiente sobre ese lado. */
  largo_m: number;
  centro_m: number;
}

function ladosExterioresDe(r: RectanguloAmbiente): LadoExterior[] {
  const lados: LadoExterior[] = [];
  if (r.exteriorNorte) lados.push({ lado: 'N', plano_m: r.y_m, largo_m: r.w_m, centro_m: r.x_m + r.w_m / 2 });
  if (r.exteriorSur) lados.push({ lado: 'S', plano_m: r.y_m + r.h_m, largo_m: r.w_m, centro_m: r.x_m + r.w_m / 2 });
  if (r.exteriorOeste) lados.push({ lado: 'O', plano_m: r.x_m, largo_m: r.h_m, centro_m: r.y_m + r.h_m / 2 });
  if (r.exteriorEste) lados.push({ lado: 'E', plano_m: r.x_m + r.w_m, largo_m: r.h_m, centro_m: r.y_m + r.h_m / 2 });
  return lados;
}

/** Ancho de ventana proporcional al muro, acotado a carpinterías razonables. */
function anchoVentana(largoMuro_m: number): number {
  return Math.min(Math.max(largoMuro_m * 0.4, 0.8), 2.4);
}

/** Preferencia de ambiente para el acceso: el hall está para eso; el estar es el suplente. */
const PRIORIDAD_ACCESO: Record<string, number> = { hall: 0, 'estar-cocina-comedor': 1, galeria: 2 };

/**
 * Candidatos a puerta de acceso, del más deseable al menos, como pares
 * ambiente + muro exterior.
 *
 * Devuelve todos los pares y no sólo el mejor porque el preferido puede no
 * servir: si el hall da al exterior únicamente por su lado corto de 1,1 m, ahí
 * no entra una hoja de 0,90 más las jambas. Antes eso dejaba la casa sin
 * ninguna puerta de entrada; ahora se sigue probando con el muro siguiente.
 */
function candidatosDeAcceso(
  rects: RectanguloAmbiente[],
  fachadaPrincipal: string,
): { ambiente: RectanguloAmbiente; lado: LadoExterior }[] {
  return rects
    .flatMap(r => ladosExterioresDe(r).map(lado => ({ ambiente: r, lado })))
    .sort((a, b) => {
      const prioridad = (PRIORIDAD_ACCESO[a.ambiente.tipo] ?? 9) - (PRIORIDAD_ACCESO[b.ambiente.tipo] ?? 9);
      if (prioridad !== 0) return prioridad;
      // A igual ambiente, se entra por la fachada principal y, si no, por el
      // muro exterior más largo.
      const principal = Number(b.lado.lado === fachadaPrincipal) - Number(a.lado.lado === fachadaPrincipal);
      return principal !== 0 ? principal : b.lado.largo_m - a.lado.largo_m;
    });
}

export function aberturasExteriores(ap: AnteproyectoGenerado): Abertura[] {
  // La ventana no puede pasar el muro: si la altura libre es baja, se recorta
  // antes que dibujar una carpintería que atraviesa el encadenado.
  const altoUtil = Math.max(ap.altura_muro_m - ANTEPECHO_M - 0.2, 0.6);
  const altoVentana = Math.min(ALTO_VENTANA_M, altoUtil);
  const altoPuerta = Math.min(ALTO_PUERTA_M, Math.max(ap.altura_muro_m - 0.15, 1.9));

  const aberturas: Abertura[] = [];

  for (const r of ap.ambientes) {
    if (!TIPOS_CON_VENTANA.has(r.tipo)) continue;
    // Una sola ventana representativa, sobre el lado exterior más largo.
    const elegido = ladosExterioresDe(r).sort((a, b) => b.largo_m - a.largo_m)[0];
    if (!elegido) continue;
    aberturas.push({
      ambienteId: r.id,
      clase: 'ventana',
      lado: elegido.lado,
      plano_m: elegido.plano_m,
      centro_m: elegido.centro_m,
      ancho_m: anchoVentana(elegido.largo_m),
      antepecho_m: ANTEPECHO_M,
      alto_m: altoVentana,
    });
  }

  // Puerta de acceso: se toma el primer muro donde realmente entre.
  for (const { ambiente, lado } of candidatosDeAcceso(ap.ambientes, ap.fachadaPrincipal)) {
    if (lado.largo_m < ANCHO_PUERTA_M + 0.3) continue;
    const ventanaMismoMuro = aberturas.find(a => a.ambienteId === ambiente.id && a.lado === lado.lado);
    // Si ese muro ya tiene ventana, la puerta se corre a un costado en lugar
    // de superponerse a ella.
    const desplazamiento = ventanaMismoMuro ? ventanaMismoMuro.ancho_m / 2 + ANCHO_PUERTA_M / 2 + 0.2 : 0;
    const margen = ANCHO_PUERTA_M / 2 + 0.15;
    const min = lado.centro_m - lado.largo_m / 2 + margen;
    const max = lado.centro_m + lado.largo_m / 2 - margen;
    aberturas.push({
      ambienteId: ambiente.id,
      clase: 'puerta',
      lado: lado.lado,
      plano_m: lado.plano_m,
      centro_m: Math.min(Math.max(lado.centro_m - desplazamiento, min), max),
      ancho_m: ANCHO_PUERTA_M,
      antepecho_m: 0,
      alto_m: altoPuerta,
    });
    break;
  }

  return aberturas;
}
