/**
 * Entitlements de Terreno — fuente única de verdad de qué habilita cada plan.
 *
 * Módulo PURO (sin imports server-only): lo usan tanto el server (guards de API,
 * marca de agua) como el cliente (candados en la UI). El plan del usuario se lee
 * server-side en `lib/auth/plan.ts` y se pasa al cliente como prop.
 *
 * Matriz de referencia: PROMPT-terreno-planes-0-matriz.md (raíz del repo).
 * Regla de costo (2026-07-26): todo lo que llama a una API externa está
 * bloqueado en Semilla; el free = sólo lo que se computa en el navegador.
 * Agregar un plan futuro = editar estas tablas, nada más.
 */

export type Plan = 'semilla' | 'personal' | 'disenador' | 'estudio';

/** Orden de los planes: un plan habilita todo lo de los planes inferiores.
 *  Personal y Diseñador comparten features (misma capa desbloqueada); se
 *  diferencian sólo en LIMITE_PROYECTOS. */
const ORDEN: Record<Plan, number> = { semilla: 0, personal: 1, disenador: 2, estudio: 3 };

export const PLANES: Plan[] = ['semilla', 'personal', 'disenador', 'estudio'];

export const NOMBRE_PLAN: Record<Plan, string> = {
  semilla:   'Semilla',
  personal:  'Personal',
  disenador: 'Diseñador',
  estudio:   'Estudio',
};

/**
 * Cada feature declara el plan MÍNIMO que la habilita. Las keys son jerárquicas
 * para que la telemetría sea legible. Lo que no está acá se considera libre.
 */
export type Feature =
  | 'catastro.rumbos'
  | 'analisis.topo'
  | 'analisis.clima'
  | 'analisis.contexto'
  | 'analisis.entorno'
  | 'analisis.suelo'
  | 'analisis.cobertura'
  | 'analisis.hidrico'
  | 'analisis.solar'
  | 'analisis.sombras'
  | 'analisis.visibilidad'
  | 'analisis.produccion'
  | 'analisis.aptitud'
  | 'analisis.carbono'
  | 'diseno.agua'
  | 'diseno.zonas'
  | 'diseno.sectores'
  | 'diseno.aguadas'
  | 'diseno.caminos'
  | 'diseno.red'
  | 'diseno.cuenca'
  | 'diseno.pastoreo'
  | 'diseno.riego'
  | 'diseno.keyline'
  | 'diseno.economia'
  | 'sugerencias'
  | 'informe.sin_marca'
  | 'informe.white_label'
  | 'export.gis'
  | 'export.dxf'
  | 'colaboracion';

// El plan MÍNIMO de cada feature es 'personal' (el pago más barato que ya
// desbloquea todo el análisis y diseño). Diseñador hereda lo mismo; sólo suma
// proyectos ilimitados. Las de 'estudio' quedan reservadas al tier superior.
const FEATURES: Record<Feature, Plan> = {
  'catastro.rumbos':     'personal',
  // Análisis — todo usa API externa (o datos que derivan de ella) ⇒ pago.
  'analisis.topo':       'personal',
  'analisis.clima':      'personal',
  'analisis.contexto':   'personal',
  'analisis.entorno':    'personal',
  'analisis.suelo':      'personal',
  'analisis.cobertura':  'personal',
  'analisis.hidrico':    'personal',
  'analisis.solar':      'personal',
  'analisis.sombras':    'personal',
  'analisis.visibilidad':'personal',
  'analisis.produccion': 'personal',
  'analisis.aptitud':    'personal',
  'analisis.carbono':    'personal',
  // Diseño — toda la capa es paga.
  'diseno.agua':         'personal',
  'diseno.zonas':        'personal',
  'diseno.sectores':     'personal',
  'diseno.aguadas':      'personal',
  'diseno.caminos':      'personal',
  'diseno.red':          'personal',
  'diseno.cuenca':       'personal',
  'diseno.pastoreo':     'personal',
  'diseno.riego':        'personal',
  'diseno.keyline':      'personal',
  'diseno.economia':     'personal',
  'sugerencias':         'personal',
  // Entrega.
  'informe.sin_marca':   'personal',
  'informe.white_label': 'estudio',
  'export.gis':          'personal',
  'export.dxf':          'estudio',
  'colaboracion':        'estudio',
};

/** ¿El plan habilita esta feature al 100%? */
export function can(plan: Plan, feature: Feature): boolean {
  return ORDEN[plan] >= ORDEN[FEATURES[feature]];
}

/** Plan mínimo que incluye la feature (para el CTA "Desbloqueá con …"). */
export function planMinimo(feature: Feature): Plan {
  return FEATURES[feature];
}

/** Límite de proyectos activos por plan (Infinity = sin tope). */
export const LIMITE_PROYECTOS: Record<Plan, number> = {
  semilla:   1,
  personal:  2,
  disenador: Infinity,
  estudio:   Infinity,
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
  'colaboracion':         'Trabajá el proyecto en equipo, con varios usuarios.',
};

/** ¿Este tab está bloqueado para el plan dado? */
export function tabBloqueada(plan: Plan, tab: string): boolean {
  const f = featureDeTab(tab);
  return f != null && !can(plan, f);
}
