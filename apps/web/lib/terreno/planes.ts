/**
 * Planes de acequia — fuente de datos del landing (separada del componente).
 *
 * Los precios NO se escriben acá: se leen de `@arteytierra/config/acequia`, que
 * es lo mismo que cobra el checkout. Hasta el 11/09/2026 esta vidriera anunciaba
 * Profesional a USD 12 mientras el cobro salía 15, y prometía "proyectos
 * ilimitados" cuando el trigger de la base ya topaba en 10 desde la 0054.
 * Mostrar un número y cobrar otro es la peor falla posible de esta parte del
 * producto, así que ahora hay una sola fuente.
 *
 * La cotización del peso tampoco se escribe acá. Estaba como
 * `ARS_POR_USD = 1500` y la vidriera la imprimía en la letra chica mientras
 * Mercado Pago cobraba con `ACEQUIA_ARS_PER_USD`: dos precios para lo mismo.
 * Ahora sale de `lib/terreno/cotizacion.ts` y la página se la pasa al
 * componente; si no está configurada, no se muestra ningún precio en pesos.
 *
 * Desde Argentina se cobra en ARS por Mercado Pago; desde el resto del mundo,
 * en USD por PayPal.
 */

export const REGISTRO_URL = `${process.env.NEXT_PUBLIC_ACEQUIA_APP_URL ?? 'https://terreno.arteytierra.org'}/registro`;

import { ACEQUIA_PLANS } from '@arteytierra/config/acequia';

export interface Plan {
  id: 'semilla' | 'personal' | 'profesional' | 'estudio';
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
  /**
   * El plan se contrata solo. Sale de `ACEQUIA_PLANS[].selfCheckout`, que es la
   * misma fuente que decide qué acepta el checkout, para que la vidriera no
   * pueda volver a ofrecer un botón de pago que termina en un error.
   */
  compraEnLinea: boolean;
}

export const PLANES: Plan[] = [
  {
    id: 'semilla',
    compraEnLinea: ACEQUIA_PLANS.semilla.selfCheckout,
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
      'Informe compartible (con marca de agua de acequia)',
    ],
  },
  {
    id: 'personal',
    compraEnLinea: ACEQUIA_PLANS.personal.selfCheckout,
    nombre: ACEQUIA_PLANS.personal.name,
    tagline: 'Todo el análisis y el diseño, para tu proyecto.',
    precioMensualUSD: ACEQUIA_PLANS.personal.monthlyUsd,
    precioAnualUSD: ACEQUIA_PLANS.personal.annualUsd,
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
      'Exportación a GeoJSON, KML y GPX',
      `Hasta ${ACEQUIA_PLANS.personal.projects} proyectos activos`,
    ],
  },
  {
    id: 'profesional',
    compraEnLinea: ACEQUIA_PLANS.profesional.selfCheckout,
    nombre: ACEQUIA_PLANS.profesional.name,
    tagline: 'Para quien diseña predios y los entrega firmados.',
    precioMensualUSD: ACEQUIA_PLANS.profesional.monthlyUsd,
    precioAnualUSD: ACEQUIA_PLANS.profesional.annualUsd,
    lanzamiento: true,
    hereda: 'Todo lo de Personal, y además:',
    incluye: [
      'Informe con tu marca: tu logo y tu matrícula',
      `Hasta ${ACEQUIA_PLANS.profesional.projects} proyectos activos`,
      'Ideal si trabajás varios terrenos a la vez',
    ],
  },
  {
    id: 'estudio',
    compraEnLinea: ACEQUIA_PLANS.estudio.selfCheckout,
    nombre: ACEQUIA_PLANS.estudio.name,
    tagline: 'Para el equipo que entrega varios proyectos a la vez.',
    precioMensualUSD: ACEQUIA_PLANS.estudio.monthlyUsd,
    precioAnualUSD: ACEQUIA_PLANS.estudio.annualUsd,
    lanzamiento: true,
    hereda: 'Todo lo de Profesional, y además:',
    incluye: [
      `${ACEQUIA_PLANS.estudio.seats} cuentas de usuario, cada una con sus ${ACEQUIA_PLANS.estudio.projects} proyectos activos`,
      'Exportación DXF / CAD por capas',
      'Soporte prioritario',
    ],
  },
];
