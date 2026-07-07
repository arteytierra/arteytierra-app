/**
 * Capas de usuario para los elementos de dibujo libre.
 * Los dibujos llevan capaId (opcional); los que no lo tienen caen en la capa default.
 * La visibilidad por capa NO se persiste ni entra al historial de undo
 * (mismo criterio que ocultosIds).
 */

export interface CapaUsuario {
  id:     string;
  nombre: string;
  orden:  number;
  color?: string;   // color de la capa (recolorea sus dibujos)
}

export const CAPA_DEFAULT_ID = 'default';

export const CAPAS_USUARIO_INICIAL: CapaUsuario[] = [
  { id: CAPA_DEFAULT_ID, nombre: 'Dibujos', orden: 0 },
];

export function crearCapaUsuario(nombre: string, existentes: CapaUsuario[]): CapaUsuario {
  return {
    id:     crypto.randomUUID(),
    nombre: nombre || `Capa ${existentes.length + 1}`,
    orden:  Math.max(...existentes.map(c => c.orden), -1) + 1,
  };
}

/** Capa efectiva de un elemento (sin capaId → default). */
export function capaDeElemento(capaId: string | undefined, capas: CapaUsuario[]): string {
  if (capaId && capas.some(c => c.id === capaId)) return capaId;
  return CAPA_DEFAULT_ID;
}

/**
 * Plantilla "Escala de permanencia" de P.A. Yeomans (Keyline), en orden de
 * permanencia (de lo más permanente a lo más cambiable). Sirve como andamiaje
 * para organizar el diseño del predio capa por capa.
 */
export const PLANTILLA_KEYLINE: string[] = [
  'Clima', 'Geografía', 'Agua', 'Accesos',
  'Sistemas', 'Estructuras', 'Subdivisiones', 'Suelo',
];

/** Crea las 8 capas de la escala de permanencia, evitando duplicar por nombre. */
export function crearCapasKeyline(existentes: CapaUsuario[]): CapaUsuario[] {
  let orden = Math.max(...existentes.map(c => c.orden), -1);
  const nombresExistentes = new Set(existentes.map(c => c.nombre.toLowerCase()));
  const nuevas: CapaUsuario[] = [];
  PLANTILLA_KEYLINE.forEach((factor, i) => {
    const nombre = `${i + 1} · ${factor}`;
    if (nombresExistentes.has(nombre.toLowerCase())) return;
    nuevas.push({ id: crypto.randomUUID(), nombre, orden: ++orden });
  });
  return nuevas;
}
