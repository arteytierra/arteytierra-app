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
 * Cobro (lanzamiento): links de pago directos + asignación manual del plan.
 * Desde Argentina se muestra en ARS (a ARS_POR_USD) y se paga por Mercado Pago;
 * desde el resto del mundo, en USD por PayPal.
 *
 * [TODO Jonatan] Precios finales y links de pago dedicados por plan. Los links
 * de MP/PayPal de abajo son los genéricos del sitio.
 */

export const REGISTRO_URL = `${process.env.NEXT_PUBLIC_ACEQUIA_APP_URL ?? 'https://terreno.arteytierra.org'}/registro`;

/** Cotización para mostrar precios en pesos a quien entra desde Argentina. */
export const ARS_POR_USD = 1500;

/** Links de pago genéricos del colectivo (los mismos que usa /asesorias). */
export const MP_LINK = 'https://link.mercadopago.com.ar/arteytierra';
export function paypalLink(usd: number): string {
  return `https://paypal.me/arteytierra/${usd}`;
}

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
      'Informe compartible (con marca de agua de acequia)',
    ],
  },
  {
    id: 'personal',
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
      `Hasta ${ACEQUIA_PLANS.personal.projects} proyectos activos`,
    ],
  },
  {
    id: 'profesional',
    nombre: ACEQUIA_PLANS.profesional.name,
    tagline: 'Para quien diseña predios y los entrega firmados.',
    precioMensualUSD: ACEQUIA_PLANS.profesional.monthlyUsd,
    precioAnualUSD: ACEQUIA_PLANS.profesional.annualUsd,
    lanzamiento: true,
    hereda: 'Todo lo de Personal, y además:',
    incluye: [
      'Informe con tu marca: tu logo y tu matrícula',
      'Exportación a GeoJSON, KML y GPX',
      `Hasta ${ACEQUIA_PLANS.profesional.projects} proyectos activos`,
      'Ideal si trabajás varios terrenos a la vez',
    ],
  },
  {
    id: 'estudio',
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
