/**
 * Elementos vista-planta A ESCALA: símbolos que se estampan con un clic y se
 * dibujan al tamaño real (radio en metros) sobre el mapa. Se materializan como
 * un `DibujoCirculo` con `simbolo` (emoji), así reutilizan TODO el plumbing de
 * dibujos: snapshot, undo/redo, capas, render 2D (Leaflet) y drapeado en 3D.
 * A diferencia de los bloques (que son pines puntuales sin escala), un árbol
 * ocupa el radio de su copa, un auto ~2 m, una persona ~0,35 m.
 */

export interface ElementoPreset {
  id:       string;
  nombre:   string;
  emoji:    string;
  color:    string;   // color del disco (copa / silueta)
  grupo:    string;
  radio_m:  number;   // radio por defecto en metros (copa / medio ancho)
  opacidad: number;   // relleno del disco
}

export const GRUPOS_ELEMENTO = ['Vegetación', 'Personas y vehículos'] as const;

export const ELEMENTOS: ElementoPreset[] = [
  // ── Vegetación (radio = copa) ──
  { id: 'arbol_grande', nombre: 'Árbol grande',  emoji: '🌳', color: '#2E7D32', grupo: 'Vegetación', radio_m: 4,   opacidad: 0.35 },
  { id: 'arbol',        nombre: 'Árbol',         emoji: '🌳', color: '#388E3C', grupo: 'Vegetación', radio_m: 2.5, opacidad: 0.35 },
  { id: 'frutal',       nombre: 'Frutal',        emoji: '🍎', color: '#66BB6A', grupo: 'Vegetación', radio_m: 2,   opacidad: 0.35 },
  { id: 'conifera',     nombre: 'Conífera',      emoji: '🌲', color: '#1B5E20', grupo: 'Vegetación', radio_m: 2,   opacidad: 0.4  },
  { id: 'palmera',      nombre: 'Palmera',       emoji: '🌴', color: '#2E7D32', grupo: 'Vegetación', radio_m: 2.5, opacidad: 0.3  },
  { id: 'arbusto',      nombre: 'Arbusto',       emoji: '🌱', color: '#7CB342', grupo: 'Vegetación', radio_m: 0.8, opacidad: 0.4  },
  { id: 'herbacea',     nombre: 'Herbácea',      emoji: '🌿', color: '#9CCC65', grupo: 'Vegetación', radio_m: 0.4, opacidad: 0.45 },
  // ── Personas y vehículos (radio = medio ancho, para escala) ──
  { id: 'persona',      nombre: 'Persona',       emoji: '🚶', color: '#5C6BC0', grupo: 'Personas y vehículos', radio_m: 0.35, opacidad: 0.25 },
  { id: 'auto',         nombre: 'Auto',          emoji: '🚗', color: '#607D8B', grupo: 'Personas y vehículos', radio_m: 2.2,  opacidad: 0.25 },
  { id: 'camioneta',    nombre: 'Camioneta',     emoji: '🛻', color: '#546E7A', grupo: 'Personas y vehículos', radio_m: 2.6,  opacidad: 0.25 },
  { id: 'tractor',      nombre: 'Tractor',       emoji: '🚜', color: '#FB8C00', grupo: 'Personas y vehículos', radio_m: 1.8,  opacidad: 0.25 },
  { id: 'bici',         nombre: 'Bicicleta',     emoji: '🚲', color: '#26A69A', grupo: 'Personas y vehículos', radio_m: 0.9,  opacidad: 0.25 },
];
