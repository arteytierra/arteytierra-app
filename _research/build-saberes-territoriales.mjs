import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Se corre desde la raíz del monorepo:  node _research/build-saberes-territoriales.mjs
// Escribe apps/terreno/lib/saberesTerritoriales.ts y nada más.
const raiz = path.dirname(fileURLToPath(import.meta.url));
const repo = path.join(raiz, '..');
const leer = (p) => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));

const meso = leer(`${raiz}/ecosistemas-saberes-mesoamerica-norteamerica/fase-2-saberes-territoriales/inventario-saberes-documentados.json`);
const euro = leer(`${raiz}/ecosistemas-saberes-europa-occidental/fase-2-saberes-territoriales/inventario-saberes-documentados.json`).saberes;
const suda = leer(`${raiz}/ecosistemas-saberes-sudamerica/fase-2-saberes-territoriales/inventario-saberes-documentados.json`);

// Los inventarios de Mesoamerica no traen el pais en un campo propio: esta en
// la regla textual del territorio. Se lee de ahi una sola vez, aca, y no se
// vuelve a parsear texto libre en tiempo de ejecucion.
const PAIS_MESO = {
  cac_milpa_maya_ich_kool: ['MX'],
  cac_bosques_comunales_y_milpa_k_iche_mam: ['GT'],
  cac_quesungual: ['HN'],
  cac_kuxur_rum: ['GT'],
  cac_conocimiento_mayangna_de_bosawas: ['NI'],
  cac_cacao_bribri_y_cabecar: ['CR'],
  cac_agricultura_nainu_guna: ['PA'],
  cac_vinales_y_conuco_cubano: ['CU'],
  cac_cockpit_country_maroon: ['JM'],
  cac_agroforesteria_kalinago_de_dominica: ['DM'],
};

const PAIS_EURO = {
  dehesa: ['ES'],
  montado: ['PT'],
  careo_de_sierra_nevada: ['ES'],
  boqueras_y_riego_de_turbias: ['ES'],
  huerta_de_valencia_y_tribunal_de_las_aguas: ['ES'],
  bancales_de_la_ribeira_sacra_y_del_duero_vinatero: ['ES', 'PT'],
  souto_y_minifundio_gallego: ['ES', 'PT'],
  branas_y_pastos_de_montana_cantabricos: ['ES'],
  trashumancia_por_canadas_reales: ['ES'],
  bocage_breton_y_normando: ['FR'],
  bocage_de_las_ardenas: ['BE', 'FR', 'LU'],
  hortillonnages_de_amiens: ['FR'],
  marais_y_wateringues: ['FR', 'BE', 'NL'],
  polder_y_waterschap: ['NL'],
  houtwallen_y_elzensingels: ['NL'],
  essen_y_plaggenboden: ['NL', 'BE'],
  landes_y_pastoreo_del_brezal: ['FR', 'BE'],
  downland_grazing_sobre_creta: ['GB'],
  hedgerow_y_enclosure: ['GB'],
  ffridd_y_hafod_hendre_gales: ['GB'],
  machair: ['GB', 'IE'],
  crofting: ['GB'],
  corte_de_turba_domestica: ['IE', 'GB'],
  muinteanas_y_campos_de_piedra_del_oeste_irlandes: ['IE'],
  winterage_del_burren: ['IE'],
  bisses_del_valais: ['CH'],
};

// El relevamiento europeo anoto cuales tienen cartografia oficial publicada y
// esperan solo la verificacion de licencia. Son los tres candidatos reales a
// pasar a geometria sin trabajo de campo.
const CON_CARTOGRAFIA_OFICIAL = new Set([
  'trashumancia_por_canadas_reales',
  'polder_y_waterschap',
  'crofting',
]);

const REGION = {
  'centroamerica-caribe': 'mesoamerica-caribe',
  'mexico-estados-unidos': 'mexico-estados-unidos',
};

const saberes = [];

for (const s of meso) {
  // cac_milpa_maya_ich_kool y mx_ich_kool_milpa_maya son el mismo saber
  // documentado dos veces, una por cada inventario. Se fusionan abajo.
  if (s.id === 'cac_milpa_maya_ich_kool') continue;
  const esIchKool = s.id === 'mx_ich_kool_milpa_maya';
  const gemelo = esIchKool ? meso.find((o) => o.id === 'cac_milpa_maya_ich_kool') : null;
  saberes.push({
    id: esIchKool ? 'milpa_maya_ich_kool' : s.id,
    nombre: s.nombre,
    region: REGION[s.region],
    portadores: s.portadores,
    paises: esIchKool ? ['MX'] : (PAIS_MESO[s.id] ?? (s.id.startsWith('mx_') ? ['MX'] : ['US'])),
    ecoIdsCompatibles: s.eco_ids_compatibles ?? [],
    territorioMinimo: s.territorio.regla_textual,
    sintesisPublica: s.sintesis_publica,
    cautelas: gemelo ? [...s.cautelas, ...gemelo.cautelas] : (s.cautelas ?? []),
    fuentes: (gemelo ? [...s.fuentes, ...gemelo.fuentes] : (s.fuentes ?? []))
      .filter((f, i, a) => a.findIndex((o) => o.url === f.url) === i)
      .map((f) => ({ label: f.label, url: f.url, revisada: f.revisada })),
    estado: 'documentado_sin_geometria',
    fuenteInventario: `_research/ecosistemas-saberes-mesoamerica-norteamerica/${s.fuente_inventario}`,
  });
}

for (const s of euro) {
  saberes.push({
    id: s.id,
    nombre: s.nombre,
    region: 'europa-occidental',
    portadores: s.region_cultural,
    paises: PAIS_EURO[s.id] ?? [],
    ecoIdsCompatibles: [],
    territorioMinimo: `${s.territorio_declarado} — unidad mínima: ${s.territorio_minimo}.`,
    sintesisPublica: s.descripcion,
    cautelas: s.cautela ? [s.cautela] : [],
    // El relevamiento europeo cito las fuentes por region, no por saber; estan
    // en FUENTES.md y todavia no se pueden atribuir una a una.
    fuentes: [],
    estado: CON_CARTOGRAFIA_OFICIAL.has(s.id) ? 'cartografia_oficial_sin_licencia' : 'documentado_sin_geometria',
    fuenteInventario: '_research/ecosistemas-saberes-europa-occidental/CAPAS_CULTURALES_LOCALES.md',
  });
}

for (const s of suda) {
  saberes.push({
    id: s.id,
    nombre: s.nombre,
    region: 'sudamerica',
    portadores: s.pueblo_portadores,
    paises: [s.pais],
    ecoIdsCompatibles: s.ecorregiones_resolve ?? [],
    territorioMinimo: s.territorio_minimo,
    sintesisPublica: s.descripcion,
    cautelas: s.cautelas ? [s.cautelas] : [],
    fuentes: s.fuente ? [{ label: s.fuente.label, url: s.fuente.url, revisada: s.fuente.fecha_consulta }] : [],
    estado: 'documentado_sin_geometria',
    fuenteInventario: '_research/ecosistemas-saberes-sudamerica/fase-2-saberes-territoriales/inventario-saberes-documentados.json',
  });
}

const ids = saberes.map((s) => s.id);
const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dup.length) throw new Error(`ids duplicados: ${dup.join(', ')}`);

const q = (v) => JSON.stringify(v);
const lista = (v) => (v.length ? `[${v.map(q).join(', ')}]` : '[]');

const bloques = saberes.map((s) => `  {
    id: ${q(s.id)},
    nombre: ${q(s.nombre)},
    region: ${q(s.region)},
    portadores: ${q(s.portadores)},
    paises: ${lista(s.paises)},
    ecoIdsCompatibles: ${s.ecoIdsCompatibles.length ? `[${s.ecoIdsCompatibles.join(', ')}]` : '[]'},
    territorioMinimo: ${q(s.territorioMinimo)},
    sintesisPublica: ${q(s.sintesisPublica)},
    cautelas: ${s.cautelas.length ? `[\n${s.cautelas.map((c) => `      ${q(c)},`).join('\n')}\n    ]` : '[]'},
    fuentes: ${s.fuentes.length ? `[\n${s.fuentes.map((f) => `      { label: ${q(f.label)}, url: ${q(f.url)}, revisada: ${q(f.revisada)} },`).join('\n')}\n    ]` : '[]'},
    estado: ${q(s.estado)},
    fuenteInventario: ${q(s.fuenteInventario)},
  },`).join('\n');

const porRegion = saberes.reduce((acc, s) => ({ ...acc, [s.region]: (acc[s.region] ?? 0) + 1 }), {});

const cabecera = `/**
 * Saberes territoriales — capa 2 del sistema de ecorregiones.
 *
 * ARCHIVO GENERADO. No se edita a mano: sale de los tres inventarios de
 * \`_research/ecosistemas-saberes-<region>/fase-2-saberes-territoriales/\`.
 *
 * Qué es esta capa y por qué está separada de \`BiomaFicha.saberes\`:
 *
 * La ficha ecológica describe un bioma y se resuelve por ECO_ID, que es un dato
 * del terreno. Un saber territorial no funciona así. "Careo de Sierra Nevada" no
 * es una propiedad del matorral mediterráneo: es una práctica de unas
 * comunidades concretas de la Alpujarra, con nombre, autoridad y cartografía
 * propia. Activarlo porque el predio cayó en el mismo ECO_ID, o porque está en
 * España, sería atribuirle a un usuario un saber que no es de su territorio.
 *
 * Por eso ninguno de estos ${saberes.length} se activa por país, por Köppen ni por
 * ecorregión: hace falta un polígono con procedencia y licencia verificadas, y
 * el punto tiene que caer adentro. Hoy hay ${saberes.length} documentados y cero
 * activables, porque el registro de geometrías está vacío a propósito. La regla
 * y el registro viven en \`lib/saberes.ts\`.
 *
 * Reparto: ${Object.entries(porRegion).map(([r, n]) => `${r} ${n}`).join(', ')}.
 */

import type { SaberTerritorial } from './saberesTipos';

export const SABERES_TERRITORIALES: readonly SaberTerritorial[] = [
${bloques}
];
`;

fs.writeFileSync(path.join(repo, 'apps', 'terreno', 'lib', 'saberesTerritoriales.ts'), cabecera, 'utf8');
console.log('escritos', saberes.length, JSON.stringify(porRegion));
console.log('con fuentes', saberes.filter((s) => s.fuentes.length).length);
console.log('con ecoIds', saberes.filter((s) => s.ecoIdsCompatibles.length).length);
console.log('sin paises', saberes.filter((s) => !s.paises.length).map((s) => s.id));
