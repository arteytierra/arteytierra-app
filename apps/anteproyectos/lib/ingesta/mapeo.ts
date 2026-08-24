/**
 * Traduce lo que la familia escribió en el cuaderno al programa de
 * necesidades tipado que consume el motor.
 *
 * La gente escribe "cuarto", "marquesina", "balcón" — no los identificadores
 * del sistema. El mapeo es por palabra clave e incluye variantes de español
 * rioplatense y caribeño (el primer proyecto es en Puerto Rico), pero es
 * deliberadamente conservador: lo que no reconoce queda como 'otro' con el
 * nombre original intacto, para que Jonatan lo corrija a mano en vez de que
 * el sistema invente una clasificación equivocada.
 */
import type { AmbienteDeseado, Tamano, TipoAmbiente } from '../tipos';
import type { FilaProgramaCuaderno } from './cuaderno';

const PALABRAS_POR_TIPO: Array<{ tipo: TipoAmbiente; claves: string[] }> = [
  { tipo: 'bano', claves: ['baño', 'bano', 'aseo', 'sanitario', 'toilette', 'medio baño'] },
  { tipo: 'dormitorio', claves: ['dormitorio', 'cuarto', 'habitacion', 'habitación', 'recamara', 'recámara', 'alcoba', 'pieza'] },
  { tipo: 'estar-cocina-comedor', claves: ['cocina', 'comedor', 'sala', 'estar', 'living', 'salon', 'salón'] },
  { tipo: 'garage', claves: ['garage', 'garaje', 'cochera', 'marquesina', 'estacionamiento'] },
  { tipo: 'hall', claves: ['hall', 'recibidor', 'vestibulo', 'vestíbulo', 'entrada', 'zaguan', 'zaguán'] },
  { tipo: 'estudio', claves: ['estudio', 'oficina', 'despacho', 'escritorio', 'trabajo'] },
  { tipo: 'lavadero', claves: ['lavadero', 'lavanderia', 'lavandería', 'laundry'] },
  { tipo: 'despensa', claves: ['despensa', 'alacena', 'pantry'] },
  { tipo: 'invernadero', claves: ['invernadero', 'vivero', 'umbraculo', 'umbráculo'] },
  { tipo: 'biofiltro', claves: ['biofiltro', 'humedal', 'aguas grises', 'aguas negras', 'biodigestor'] },
  { tipo: 'galeria', claves: ['galeria', 'galería', 'balcon', 'balcón', 'terraza', 'porche', 'pergola', 'pérgola', 'alero'] },
  { tipo: 'taller', claves: ['taller', 'depósito', 'deposito', 'galpon', 'galpón'] },
];

const NORMALIZAR = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

export function inferirTipo(nombre: string): TipoAmbiente {
  const n = NORMALIZAR(nombre);
  for (const { tipo, claves } of PALABRAS_POR_TIPO) {
    if (claves.some(c => n.includes(NORMALIZAR(c)))) return tipo;
  }
  return 'otro';
}

export function inferirTamano(texto: string): Tamano {
  const t = NORMALIZAR(texto);
  if (/peque|chic|min/.test(t)) return 'chico';
  if (/grande|amplio|doble|max/.test(t)) return 'grande';
  return 'mediano';
}

/** Detecta "2 cuartos", "tres habitaciones" → cantidad. */
const NUMEROS_PALABRA: Record<string, number> = {
  un: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6,
};

export function inferirCantidad(texto: string): number {
  const t = NORMALIZAR(texto);
  const digito = t.match(/(\d+)\s/);
  if (digito) {
    const n = Number(digito[1]);
    if (n >= 1 && n <= 10) return n;
  }
  for (const [palabra, n] of Object.entries(NUMEROS_PALABRA)) {
    if (new RegExp(`\\b${palabra}\\b`).test(t)) return n;
  }
  return 1;
}

function idDesde(nombre: string, usados: Set<string>): string {
  const base =
    NORMALIZAR(nombre)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 18) || 'amb';
  let id = base;
  let i = 2;
  while (usados.has(id)) id = `${base}-${i++}`;
  usados.add(id);
  return id;
}

/**
 * Convierte las filas del cuaderno en ambientes del programa. Las adyacencias
 * ("¿cerca de qué?") se resuelven en una segunda pasada, cuando ya existen
 * todos los ids: la familia nombra ambientes que pueden aparecer más abajo en
 * la tabla.
 */
export function filasAPrograma(filas: FilaProgramaCuaderno[]): AmbienteDeseado[] {
  const usados = new Set<string>();
  const ambientes: AmbienteDeseado[] = filas.map(f => ({
    id: idDesde(f.ambiente, usados),
    tipo: inferirTipo(f.ambiente),
    nombre: f.ambiente.trim(),
    cantidad: inferirCantidad(f.ambiente),
    tamano: inferirTamano(f.tamano),
    adyacenciasDeseadas: [],
  }));

  // Segunda pasada: "cerca de" → ids, buscando por nombre o por tipo.
  for (let i = 0; i < ambientes.length; i++) {
    const cerca = filas[i]?.cerca_de ?? '';
    if (!cerca.trim()) continue;
    const referencias = cerca.split(/[,/y]+/).map(s => s.trim()).filter(Boolean);
    const ids = new Set<string>();
    for (const ref of referencias) {
      const refN = NORMALIZAR(ref);
      if (!refN) continue;
      const porNombre = ambientes.find(
        (a, j) => j !== i && (NORMALIZAR(a.nombre ?? '').includes(refN) || refN.includes(NORMALIZAR(a.nombre ?? ''))),
      );
      if (porNombre) {
        ids.add(porNombre.id);
        continue;
      }
      const tipoRef = inferirTipo(ref);
      if (tipoRef !== 'otro') {
        const porTipo = ambientes.find((a, j) => j !== i && a.tipo === tipoRef);
        if (porTipo) ids.add(porTipo.id);
      }
    }
    ambientes[i]!.adyacenciasDeseadas = [...ids];
  }

  return ambientes;
}
