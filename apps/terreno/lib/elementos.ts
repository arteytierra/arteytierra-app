/**
 * Elementos vista-planta A ESCALA: símbolos que se estampan con un clic y se
 * dibujan al tamaño real sobre el mapa. Se materializan como un `DibujoCirculo`
 * (copa/silueta redonda) o un `DibujoPoligono` rectangular (vehículos), en ambos
 * casos con `simbolo` (emoji). Así reutilizan TODO el plumbing de dibujos:
 * snapshot, undo/redo, capas, render 2D (Leaflet) y drapeado en 3D.
 * A diferencia de los bloques (pines puntuales sin escala), un árbol ocupa el
 * radio de su copa, un auto ~2×4,5 m, una persona ~0,35 m.
 */

export interface ElementoPreset {
  id:       string;
  nombre:   string;
  emoji:    string;
  color:    string;   // color del disco / silueta
  grupo:    string;
  forma:    'circulo' | 'rect' | 'poligono';
  radio_m?: number;   // forma círculo: radio (copa / medio ancho)
  largo_m?: number;   // forma rect: eje mayor (N-S al colocar)
  ancho_m?: number;   // forma rect: eje menor (E-O al colocar)
  opacidad: number;   // relleno
}

export const GRUPOS_ELEMENTO = ['Vegetación', 'Canteros y masas', 'Personas y vehículos'] as const;

export const ELEMENTOS: ElementoPreset[] = [
  // ── Vegetación (círculo, radio = copa) ──
  { id: 'arbol_grande', nombre: 'Árbol grande',  emoji: '🌳', color: '#2E7D32', grupo: 'Vegetación', forma: 'circulo', radio_m: 4,   opacidad: 0.35 },
  { id: 'arbol',        nombre: 'Árbol',         emoji: '🌳', color: '#388E3C', grupo: 'Vegetación', forma: 'circulo', radio_m: 2.5, opacidad: 0.35 },
  { id: 'frutal',       nombre: 'Frutal',        emoji: '🍎', color: '#66BB6A', grupo: 'Vegetación', forma: 'circulo', radio_m: 2,   opacidad: 0.35 },
  { id: 'conifera',     nombre: 'Conífera',      emoji: '🌲', color: '#1B5E20', grupo: 'Vegetación', forma: 'circulo', radio_m: 2,   opacidad: 0.4  },
  { id: 'palmera',      nombre: 'Palmera',       emoji: '🌴', color: '#2E7D32', grupo: 'Vegetación', forma: 'circulo', radio_m: 2.5, opacidad: 0.3  },
  { id: 'arbusto',      nombre: 'Arbusto',       emoji: '🌱', color: '#7CB342', grupo: 'Vegetación', forma: 'circulo', radio_m: 0.8, opacidad: 0.4  },
  { id: 'herbacea',     nombre: 'Herbácea',      emoji: '🌿', color: '#9CCC65', grupo: 'Vegetación', forma: 'circulo', radio_m: 0.4, opacidad: 0.45 },
  // ── Canteros y masas (polígono a mano: dibujás el contorno) ──
  { id: 'graminea',     nombre: 'Gramíneas',     emoji: '🌾', color: '#C0CA33', grupo: 'Canteros y masas', forma: 'poligono', opacidad: 0.4  },
  { id: 'pastura',      nombre: 'Pastura',       emoji: '🌱', color: '#7CB342', grupo: 'Canteros y masas', forma: 'poligono', opacidad: 0.35 },
  { id: 'flores',       nombre: 'Flores',        emoji: '🌷', color: '#EC407A', grupo: 'Canteros y masas', forma: 'poligono', opacidad: 0.35 },
  { id: 'masa_arbust',  nombre: 'Masa arbustiva', emoji: '🌿', color: '#558B2F', grupo: 'Canteros y masas', forma: 'poligono', opacidad: 0.4  },
  { id: 'monte',        nombre: 'Monte / bosque', emoji: '🌲', color: '#1B5E20', grupo: 'Canteros y masas', forma: 'poligono', opacidad: 0.4  },
  // ── Personas y vehículos ──
  { id: 'persona',      nombre: 'Persona',       emoji: '🚶', color: '#5C6BC0', grupo: 'Personas y vehículos', forma: 'circulo', radio_m: 0.35, opacidad: 0.25 },
  { id: 'auto',         nombre: 'Auto',          emoji: '🚗', color: '#607D8B', grupo: 'Personas y vehículos', forma: 'rect', largo_m: 4.5, ancho_m: 1.9, opacidad: 0.3 },
  { id: 'camioneta',    nombre: 'Camioneta',     emoji: '🛻', color: '#546E7A', grupo: 'Personas y vehículos', forma: 'rect', largo_m: 5.5, ancho_m: 2,   opacidad: 0.3 },
  { id: 'tractor',      nombre: 'Tractor',       emoji: '🚜', color: '#FB8C00', grupo: 'Personas y vehículos', forma: 'rect', largo_m: 4.2, ancho_m: 2.2, opacidad: 0.3 },
  { id: 'bici',         nombre: 'Bicicleta',     emoji: '🚲', color: '#26A69A', grupo: 'Personas y vehículos', forma: 'rect', largo_m: 1.8, ancho_m: 0.6, opacidad: 0.35 },
];
