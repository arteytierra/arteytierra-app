/**
 * Planes de Terreno — fuente de datos del landing (separada del componente).
 * Refleja la matriz canónica `PROMPT-terreno-planes-0-matriz.md`. Si cambia la
 * matriz, se edita acá. Precios en USD; se abona en moneda local al cambio del día.
 *
 * [TODO Jonatan] Precios finales exactos y mecánica de Fundadores.
 */

export const REGISTRO_URL = 'https://terreno.arteytierra.org/registro';

export interface Plan {
  id: 'semilla' | 'disenador' | 'estudio';
  nombre: string;
  tagline: string;
  /** null = gratis */
  precioMensualUSD: number | null;
  precioAnualUSD: number | null;
  destacado?: boolean;
  /** "Precio de lanzamiento" en los planes pagos */
  lanzamiento?: boolean;
  cta: string;
  /** Encabezado de la lista, ej. "Todo lo de Semilla, y además:" */
  hereda?: string;
  incluye: string[];
}

export const PLANES: Plan[] = [
  {
    id: 'semilla',
    nombre: 'Semilla',
    tagline: 'Conocé tu terreno. Gratis, para siempre.',
    precioMensualUSD: null,
    precioAnualUSD: null,
    cta: 'Empezá gratis',
    incluye: [
      'Todas las herramientas de dibujo sobre el mapa',
      'Medición: superficie y perímetro',
      'Mapa satelital y navegación completa',
      '1 proyecto activo',
      'Informe compartible (con marca de agua de Terreno)',
    ],
  },
  {
    id: 'disenador',
    nombre: 'Diseñador',
    tagline: 'El territorio, analizado y diseñado.',
    precioMensualUSD: 12,
    precioAnualUSD: 120,
    destacado: true,
    lanzamiento: true,
    cta: 'Elegir Diseñador',
    hereda: 'Todo lo de Semilla, y además:',
    incluye: [
      'Análisis completo: topografía, agua, suelo, clima y biodiversidad',
      'Curvas de nivel, relieve y vista 3D',
      'Diseño Keyline, agroforestal, riego y pastoreo',
      'Sugerencias automáticas de diseño',
      'Rumbos y replanteo de mojones',
      'Proyectos ilimitados',
      'Informe sin marca de agua',
    ],
  },
  {
    id: 'estudio',
    nombre: 'Estudio',
    tagline: 'Para consultores y equipos que entregan.',
    precioMensualUSD: 35,
    precioAnualUSD: 350,
    lanzamiento: true,
    cta: 'Elegir Estudio',
    hereda: 'Todo lo de Diseñador, y además:',
    incluye: [
      'Informe con tu marca (logo y matrícula propia)',
      'Exportación DXF / CAD',
      'Multiusuario y colaboración',
      'Soporte prioritario',
    ],
  },
];
