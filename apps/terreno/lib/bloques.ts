/**
 * Biblioteca de bloques: símbolos reutilizables para estampar en el mapa.
 * Cada bloque define un preset (ícono + nombre + color) que se materializa como
 * un Pin al hacer clic en el mapa. Reutiliza toda la infraestructura de pines.
 */

export interface BloqueDef {
  id:     string;
  nombre: string;
  icono:  string;
  color:  string;
  grupo:  string;
}

// Nota: la vegetación (árbol / bosque / cortina) se movió a la pestaña
// «Elementos», donde se dibuja A ESCALA (copa en metros) — ver lib/elementos.ts.
// Acá quedan solo los símbolos puntuales sin escala (pines).
export const GRUPOS_BLOQUE = [
  'Construcción', 'Agua', 'Producción', 'Animales', 'Energía', 'Acceso',
] as const;

export const BLOQUES: BloqueDef[] = [
  // ── Construcción ──
  { id: 'casa',        nombre: 'Casa',            icono: '🏠', color: '#8D6E63', grupo: 'Construcción' },
  { id: 'galpon',      nombre: 'Galpón',          icono: '🏚️', color: '#A1887F', grupo: 'Construcción' },
  { id: 'invernadero', nombre: 'Invernadero',     icono: '🪴', color: '#66BB6A', grupo: 'Construcción' },
  { id: 'deposito',    nombre: 'Depósito',        icono: '📦', color: '#A1887F', grupo: 'Construcción' },
  // ── Agua ──
  { id: 'tanque',      nombre: 'Tanque',          icono: '🛢️', color: '#1E88E5', grupo: 'Agua' },
  { id: 'represa',     nombre: 'Represa',         icono: '🏊', color: '#1565C0', grupo: 'Agua' },
  { id: 'pozo',        nombre: 'Pozo',            icono: '💧', color: '#29B6F6', grupo: 'Agua' },
  { id: 'molino',      nombre: 'Molino / bomba',  icono: '🌀', color: '#0D47A1', grupo: 'Agua' },
  // ── Producción ──
  { id: 'huerta',      nombre: 'Huerta',          icono: '🥬', color: '#7CB342', grupo: 'Producción' },
  { id: 'frutal',      nombre: 'Frutal',          icono: '🍎', color: '#EF5350', grupo: 'Producción' },
  { id: 'compost',     nombre: 'Compostera',      icono: '♻️', color: '#6D4C41', grupo: 'Producción' },
  { id: 'colmena',     nombre: 'Colmena',         icono: '🐝', color: '#FBC02D', grupo: 'Producción' },
  // ── Animales ──
  { id: 'gallinero',   nombre: 'Gallinero',       icono: '🐓', color: '#FF7043', grupo: 'Animales' },
  { id: 'vacas',       nombre: 'Vacas',           icono: '🐄', color: '#8D6E63', grupo: 'Animales' },
  { id: 'corral',      nombre: 'Corral',          icono: '🐖', color: '#BCAAA4', grupo: 'Animales' },
  { id: 'estanque',    nombre: 'Estanque peces',  icono: '🐟', color: '#26A69A', grupo: 'Animales' },
  // ── Energía ──
  { id: 'solar',       nombre: 'Panel solar',     icono: '☀️', color: '#FDD835', grupo: 'Energía' },
  { id: 'eolico',      nombre: 'Eólico',          icono: '🌬️', color: '#90CAF9', grupo: 'Energía' },
  { id: 'biodigestor', nombre: 'Biodigestor',     icono: '🔋', color: '#43A047', grupo: 'Energía' },
  // ── Vegetación → movida a la pestaña «Elementos» (a escala). Ver lib/elementos.ts ──
  // ── Acceso ──
  { id: 'porton',      nombre: 'Portón / acceso', icono: '🚪', color: '#6D4C41', grupo: 'Acceso' },
  { id: 'estacion',    nombre: 'Estacionamiento', icono: '🅿️', color: '#78909C', grupo: 'Acceso' },
  { id: 'mirador',     nombre: 'Mirador',         icono: '📸', color: '#5C6BC0', grupo: 'Acceso' },
];
