/**
 * Planes de Terreno — fuente de datos del landing (separada del componente).
 * Refleja la matriz canónica `PROMPT-terreno-planes-0-matriz.md`. Si cambia la
 * matriz, se edita acá.
 *
 * Cobro (lanzamiento): links de pago directos + asignación manual del plan.
 * Desde Argentina se muestra en ARS (a ARS_POR_USD) y se paga por Mercado Pago;
 * desde el resto del mundo, en USD por PayPal.
 *
 * [TODO Jonatan] Precios finales, links de pago dedicados por plan y mecánica
 * de Fundadores. Los links de MP/PayPal de abajo son los genéricos del sitio.
 */

export const REGISTRO_URL = 'https://terreno.arteytierra.org/registro';

/** Cotización para mostrar precios en pesos a quien entra desde Argentina. */
export const ARS_POR_USD = 1500;

/** Cupo de miembros Fundadores (50% de por vida). */
export const FUNDADORES_CUPO = 50;

/** Links de pago genéricos del colectivo (los mismos que usa /asesorias). */
export const MP_LINK = 'https://link.mercadopago.com.ar/arteytierra';
export function paypalLink(usd: number): string {
  return `https://paypal.me/arteytierra/${usd}`;
}

export interface Plan {
  id: 'semilla' | 'personal' | 'disenador' | 'estudio';
  nombre: string;
  tagline: string;
  /** null = gratis */
  precioMensualUSD: number | null;
  precioAnualUSD: number | null;
  destacado?: boolean;
  /** "Precio de lanzamiento" en los planes pagos */
  lanzamiento?: boolean;
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
    incluye: [
      'Todas las herramientas de dibujo sobre el mapa',
      'Medición: superficie y perímetro',
      'Mapa satelital y navegación completa',
      'Muestra gratis del análisis: clima, topografía, cuenca y sectores',
      'Calendario del lugar (heladas, lluvias y ventanas de siembra)',
      '1 proyecto activo',
      'Informe compartible (con marca de agua de Terreno)',
    ],
  },
  {
    id: 'personal',
    nombre: 'Personal',
    tagline: 'Todo el análisis y el diseño, para tu proyecto.',
    precioMensualUSD: 7,
    precioAnualUSD: 70,
    destacado: true,
    lanzamiento: true,
    hereda: 'Todo lo de Semilla, y además:',
    incluye: [
      'El análisis completo: agua, suelo, biodiversidad, solar, aptitud y más',
      'Curvas de nivel, relieve y vista 3D',
      'Diseño Keyline, agroforestal, riego y pastoreo',
      'Sugerencias automáticas de diseño',
      'Rumbos y replanteo de mojones',
      'Informe sin marca de agua',
      'Hasta 2 proyectos activos',
    ],
  },
  {
    id: 'disenador',
    nombre: 'Diseñador',
    tagline: 'Lo mismo, sin límite de proyectos.',
    precioMensualUSD: 12,
    precioAnualUSD: 120,
    lanzamiento: true,
    hereda: 'Todo lo de Personal, y además:',
    incluye: [
      'Proyectos ilimitados',
      'Ideal si trabajás varios terrenos a la vez',
    ],
  },
  {
    id: 'estudio',
    nombre: 'Estudio',
    tagline: 'Para consultores y equipos que entregan.',
    precioMensualUSD: 35,
    precioAnualUSD: 350,
    lanzamiento: true,
    hereda: 'Todo lo de Diseñador, y además:',
    incluye: [
      'Informe con tu marca (logo y matrícula propia)',
      'Exportación DXF / CAD',
      'Multiusuario y colaboración',
      'Soporte prioritario',
    ],
  },
];
