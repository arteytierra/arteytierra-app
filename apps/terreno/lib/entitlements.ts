/**
 * Entitlements de Terreno — fuente única de verdad de qué habilita cada plan.
 *
 * Módulo PURO (sin imports server-only): lo usan tanto el server (guards de API,
 * marca de agua) como el cliente (candados en la UI). El plan del usuario se lee
 * server-side en `lib/auth/plan.ts` y se pasa al cliente como prop.
 *
 * La tabla de qué habilita cada plan ya no está acá: vive en
 * `@arteytierra/config/acequia`, junto a los precios y los topes, para que la
 * vidriera del sitio público lea lo mismo que este módulo aplica. Acá quedan el
 * mapa tab → feature, los textos del candado y los límites derivados.
 */

import {
  ACEQUIA_PLANS, ACEQUIA_FEATURES, ACEQUIA_PLAN_ORDER,
  type AcequiaPlanId, type AcequiaFeature,
} from '@arteytierra/config/acequia';

export type Plan = AcequiaPlanId;

/** Orden de los planes: un plan habilita todo lo de los planes inferiores.
 *  Personal y Profesional comparten la capa de análisis y diseño; se
 *  diferencian en LIMITE_PROYECTOS y en el informe con marca propia. */
const ORDEN = ACEQUIA_PLAN_ORDER;

export const PLANES: Plan[] = ['semilla', 'personal', 'profesional', 'estudio'];

export const NOMBRE_PLAN: Record<Plan, string> = {
  semilla: ACEQUIA_PLANS.semilla.name,
  personal: ACEQUIA_PLANS.personal.name,
  profesional: ACEQUIA_PLANS.profesional.name,
  estudio: ACEQUIA_PLANS.estudio.name,
};

/**
 * Cada feature declara el plan MÍNIMO que la habilita. Las keys son jerárquicas
 * para que la telemetría sea legible. Lo que no está acá se considera libre.
 */
export type Feature = AcequiaFeature;

// La matriz y el porqué de cada asignación viven en
// `packages/config/src/acequia.ts` desde el 23/09/2026, para que la vidriera
// de arteytierra.org pueda leer la misma tabla que este candado aplica.
const FEATURES = ACEQUIA_FEATURES;

/** ¿El plan habilita esta feature al 100%? */
export function can(plan: Plan, feature: Feature): boolean {
  return ORDEN[plan] >= ORDEN[FEATURES[feature]];
}

/** Plan mínimo que incluye la feature (para el CTA "Desbloqueá con …"). */
export function planMinimo(feature: Feature): Plan {
  return FEATURES[feature];
}

/** Proyectos activos por cuenta. Se lee del catálogo para que no haya dos
 *  fuentes de verdad; el trigger de la base (migración 0057) tiene que decir lo
 *  mismo y hay un test que lo verifica contra el SQL. */
export const LIMITE_PROYECTOS: Record<Plan, number> = {
  semilla:     ACEQUIA_PLANS.semilla.projects,
  personal:    ACEQUIA_PLANS.personal.projects,
  profesional: ACEQUIA_PLANS.profesional.projects,
  estudio:     ACEQUIA_PLANS.estudio.projects,
};

/** Cuentas de usuario que incluye el plan. Estudio son cinco cuentas
 *  independientes —cada una con sus 10 proyectos— y no cinco personas
 *  editando el mismo proyecto a la vez. */
export const LIMITE_CUENTAS: Record<Plan, number> = {
  semilla:     ACEQUIA_PLANS.semilla.seats,
  personal:    ACEQUIA_PLANS.personal.seats,
  profesional: ACEQUIA_PLANS.profesional.seats,
  estudio:     ACEQUIA_PLANS.estudio.seats,
};

/**
 * Mapa tab → feature. Los tabs ausentes (mojones, proyectos) son libres.
 * Se usa para poner el candado en el riel y en el panel contextual.
 */
export const TAB_FEATURE: Record<string, Feature> = {
  clima:       'analisis.clima',
  contexto:    'analisis.contexto',
  entorno:     'analisis.entorno',
  topo:        'analisis.topo',
  suelo:       'analisis.suelo',
  cobertura:   'analisis.cobertura',
  solar:       'analisis.solar',
  sombras:     'analisis.sombras',
  visibilidad: 'analisis.visibilidad',
  prod:        'analisis.produccion',
  aptitud:     'analisis.aptitud',
  analisis:    'analisis.aptitud',
  carbono:     'analisis.carbono',
  cal:         'analisis.clima',
  agua:        'diseno.agua',
  zonas:       'diseno.zonas',
  masterplan:  'diseno.zonas',
  sectores:    'diseno.sectores',
  aguadas:     'diseno.aguadas',
  caminos:     'diseno.caminos',
  red:         'diseno.red',
  cuenca:      'diseno.cuenca',
  pastoreo:    'diseno.pastoreo',
  riego:       'diseno.riego',
  swales:       'diseno.agua',
  cortinas:     'diseno.caminos',
  cortafuegos:  'diseno.caminos',
  silvopastura: 'analisis.produccion',
  keyline:      'diseno.keyline',
  economia:    'diseno.economia',
};

/** Feature que exige el tab, o null si el tab es libre. */
export function featureDeTab(tab: string): Feature | null {
  return TAB_FEATURE[tab] ?? null;
}

/** Una línea de qué desbloquea cada feature (texto del candado). */
export const BENEFICIO_FEATURE: Record<Feature, string> = {
  'catastro.rumbos':      'Rumbos y replanteo de mojones, con precisión de campo profesional.',
  'analisis.topo':        'Pendientes, orientaciones, curvas de nivel y relieve de tu predio.',
  'analisis.clima':       'Lluvia, temperatura, heladas y extremos climáticos del lugar.',
  'analisis.contexto':    'El bioma, los saberes locales y análogos climáticos de tu territorio.',
  'analisis.entorno':     'Biodiversidad observada alrededor y el contexto vivo del predio.',
  'analisis.suelo':       'Perfil del suelo, agua útil y grupo hidrológico.',
  'analisis.cobertura':   'La cobertura del suelo (bosque, pastura, construido) desde satélite.',
  'analisis.hidrico':     'Cómo escurre el agua, dónde se capta, se infiltra y se retiene.',
  'analisis.solar':       'Trayectoria solar, sombras y radiación sobre el terreno.',
  'analisis.sombras':     'El mapa de sombras del relieve a cualquier hora y fecha.',
  'analisis.visibilidad': 'Qué se ve y qué no desde cualquier punto del predio.',
  'analisis.produccion':  'Receptividad ganadera y potencial productivo del predio.',
  'analisis.aptitud':     'Qué parte del terreno sirve para qué, según su análisis.',
  'analisis.carbono':     'El potencial de captura de carbono de tu diseño.',
  'diseno.agua':          'Diseñá la captación de agua de lluvia de techos y superficies.',
  'diseno.zonas':         'Zonificá el predio por usos e intensidad de manejo.',
  'diseno.sectores':      'Marcá sectores según sol, viento y agua.',
  'diseno.aguadas':       'Ubicá aguadas y bebederos con su radio de cobertura.',
  'diseno.caminos':       'Trazá caminos con su perfil de elevación.',
  'diseno.red':           'Dimensioná la red de agua por tubería (presión y caudal).',
  'diseno.cuenca':        'Delimitá cuencas de aporte y dimensioná represas.',
  'diseno.pastoreo':      'Diseñá el pastoreo rotativo (PRV) con potreros y rotación.',
  'diseno.riego':         'Calculá el riego por sector (necesidad, caudal y turno).',
  'diseno.keyline':       'El diseño Keyline de líneas maestras según Yeomans.',
  'diseno.economia':      'La economía del proyecto: costos, ingresos y retorno.',
  'sugerencias':          'Recomendaciones de diseño generadas del análisis del terreno.',
  'informe.sin_marca':    'Descargá el informe sin la marca de agua de Terreno.',
  'informe.white_label':  'El informe con tu propia marca, logo y matrícula.',
  'export.gis':           'Exportá tu predio a GeoJSON, KML y GPX.',
  'export.dxf':           'Exportá a DXF/CAD por capas para tu estudio.',
  'colaboracion':         'Hasta 5 cuentas para tu equipo, cada una con sus proyectos.',
};

/** ¿Este tab está bloqueado para el plan dado? */
export function tabBloqueada(plan: Plan, tab: string): boolean {
  const f = featureDeTab(tab);
  return f != null && !can(plan, f);
}
