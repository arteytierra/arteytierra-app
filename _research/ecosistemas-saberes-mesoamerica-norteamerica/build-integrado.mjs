import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/, '$1'));
const repo = process.argv[2] || 'C:\\Arte y Tierra\\0. Claude';

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const ca = readJson(path.join(root, 'insumos', 'centroamerica-caribe', 'fichas-ecorregionales.json'));
const mxus = readJson(path.join(root, 'insumos', 'mexico-estados-unidos', 'fichas-ecorregionales.json'));
const ecorregionesTs = fs.readFileSync(path.join(repo, 'apps', 'terreno', 'lib', 'ecorregiones.ts'), 'utf8');

const mappingRe = /^\s+(\d+):\s+'([^']+)'\s*,\s*\/\//gm;
const current = new Map();
for (const match of ecorregionesTs.matchAll(mappingRe)) current.set(Number(match[1]), match[2]);

const sources = [
  ...ca.map((ficha) => ({ source: 'centroamerica-caribe', ficha })),
  ...mxus.map((ficha) => ({ source: 'mexico-estados-unidos', ficha })),
];

const candidates = new Map();
for (const item of sources) {
  const ecoIds = item.ficha?._meta?.ecorregiones_resolve;
  if (!Array.isArray(ecoIds)) {
    throw new Error(`Ficha sin ecorregiones_resolve: ${item.source}/${item.ficha?.id ?? 'sin-id'}`);
  }
  for (const ecoId of ecoIds) {
    if (!candidates.has(ecoId)) candidates.set(ecoId, []);
    candidates.get(ecoId).push(item);
  }
}

// Sólo se usa cuando un ECO_ID nuevo tiene más de una ficha candidata.
// Las colisiones con lib/ecorregiones.ts siempre conservan el dueño actual.
const crossPackageOwner = new Map([
  [384, 'tamaulipas_texas_pastizal_mezquital'],
  [437, 'tamaulipas_texas_pastizal_mezquital'],
  [494, 'selva_maya_peten_yucatan'],
  [502, 'montanas_mayas_pino_encino'],
  [519, 'selva_maya_peten_yucatan'],
  [553, 'montanas_mayas_pino_encino'],
  [612, 'manglares_antillanos'],
  [613, 'manglares_centroamericanos'],
  [617, 'manglares_centroamericanos'],
]);

const targetIds = [...candidates.keys()].sort((a, b) => a - b);
const selectedNew = new Map();
const decisions = [];

for (const ecoId of targetIds) {
  const options = candidates.get(ecoId);
  const optionIds = [...new Set(options.map(({ ficha }) => ficha.id))];

  if (current.has(ecoId)) {
    decisions.push({
      eco_id: ecoId,
      accion: 'conservar_actual',
      ficha_destino: current.get(ecoId),
      candidatas_investigacion: optionIds,
      motivo: 'Evita código huérfano y conserva la granularidad ya aprobada. La investigación nueva queda disponible como respaldo editorial.',
    });
    continue;
  }

  let chosen;
  if (optionIds.length === 1) {
    chosen = options[0];
  } else {
    const ownerId = crossPackageOwner.get(ecoId);
    chosen = options.find(({ ficha }) => ficha.id === ownerId);
    if (!chosen) throw new Error(`Falta decisión explícita para ECO_ID ${ecoId}: ${optionIds.join(', ')}`);
    decisions.push({
      eco_id: ecoId,
      accion: 'unificar_candidatas',
      ficha_destino: ownerId,
      candidatas_investigacion: optionIds,
      motivo: 'Un ECO_ID debe tener un único dueño ecológico global; las diferencias por país se trasladan a la fase territorial.',
    });
  }
  selectedNew.set(ecoId, chosen);
}

const idsByFicha = new Map();
for (const [ecoId, item] of selectedNew) {
  if (!idsByFicha.has(item.ficha.id)) idsByFicha.set(item.ficha.id, { item, ids: [] });
  idsByFicha.get(item.ficha.id).ids.push(ecoId);
}

const fichasEcologicas = [...idsByFicha.values()]
  .map(({ item, ids }) => ({
    ...item.ficha,
    // Fase 1 jamás activa conocimiento localizado por un polígono ecológico.
    saberes: [],
    _meta: {
      ...item.ficha._meta,
      ecorregiones_resolve: ids.sort((a, b) => a - b),
      fuente_paquete: item.source,
      paises: item.ficha._meta.paises,
      paises_solo_documentales: true,
      saberes_en_fase: 2,
    },
  }))
  .sort((a, b) => a.id.localeCompare(b.id));

const mapeoNuevo = Object.fromEntries(
  [...selectedNew.entries()]
    .sort(([a], [b]) => a - b)
    .map(([ecoId, { ficha }]) => [ecoId, ficha.id]),
);

const mapeoFinalAuditoria = Object.fromEntries(
  targetIds.map((ecoId) => [ecoId, {
    ficha: current.get(ecoId) || selectedNew.get(ecoId)?.ficha.id,
    accion: current.has(ecoId) ? 'conservar_actual' : 'agregar',
  }]),
);

const finalTargetOwners = new Map();
for (const ecoId of targetIds) {
  finalTargetOwners.set(ecoId, current.get(ecoId) || selectedNew.get(ecoId)?.ficha.id);
}

const missing = targetIds.filter((ecoId) => !finalTargetOwners.get(ecoId));
const duplicateNewIds = fichasEcologicas
  .map((ficha) => ficha.id)
  .filter((id, index, all) => all.indexOf(id) !== index);
const existingTargetIds = targetIds.filter((ecoId) => current.has(ecoId));
const currentFichasTouched = [...new Set(existingTargetIds.map((ecoId) => current.get(ecoId)))];
const orphanedCurrentFichas = currentFichasTouched.filter((fichaId) => {
  const owned = [...current.entries()].filter(([, id]) => id === fichaId).map(([ecoId]) => ecoId);
  return owned.every((ecoId) => finalTargetOwners.get(ecoId) !== fichaId);
});

const report = {
  generado: new Date().toISOString(),
  alcance: 'Centroamérica, Caribe, México y Estados Unidos (incluye Alaska y Hawái)',
  eco_ids_investigados_unicos: targetIds.length,
  eco_ids_ya_presentes_y_conservados: existingTargetIds.length,
  eco_ids_nuevos_para_agregar: selectedNew.size,
  fichas_ecologicas_nuevas: fichasEcologicas.length,
  colisiones_con_lib: decisions.filter((d) => d.accion === 'conservar_actual').length,
  colisiones_entre_paquetes: decisions.filter((d) => d.accion === 'unificar_candidatas').length,
  faltantes: missing,
  ids_de_ficha_nueva_duplicados: duplicateNewIds,
  fichas_actuales_huerfanas: orphanedCurrentFichas,
  valido: missing.length === 0 && duplicateNewIds.length === 0 && orphanedCurrentFichas.length === 0,
};

if (!report.valido) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}

const phase1 = path.join(root, 'fase-1-ecologia');
fs.writeFileSync(path.join(phase1, 'fichas-ecologicas-nuevas.json'), `${JSON.stringify(fichasEcologicas, null, 2)}\n`);
fs.writeFileSync(path.join(phase1, 'mapeo-eco-id-nuevo.json'), `${JSON.stringify(mapeoNuevo, null, 2)}\n`);
fs.writeFileSync(path.join(phase1, 'mapeo-eco-id-final-auditoria.json'), `${JSON.stringify(mapeoFinalAuditoria, null, 2)}\n`);
fs.writeFileSync(path.join(phase1, 'decisiones-colisiones.json'), `${JSON.stringify(decisions, null, 2)}\n`);
fs.writeFileSync(path.join(phase1, 'reporte-validacion.json'), `${JSON.stringify(report, null, 2)}\n`);

const slug = (value) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '_')
  .replace(/^_|_$/g, '');

function parseCulturalInventory(relativePath, region, prefix) {
  const absolute = path.join(root, relativePath);
  const markdown = fs.readFileSync(absolute, 'utf8');
  const headings = [...markdown.matchAll(/^(#{2,3})\s+\d+\.\s+(.+)$/gm)];

  return headings.map((heading, index) => {
    const bodyStart = heading.index + heading[0].length;
    const bodyEnd = headings[index + 1]?.index ?? markdown.length;
    const body = markdown.slice(bodyStart, bodyEnd);
    const fields = {};
    for (const field of body.matchAll(/^-\s+\*\*([^*]+):\*\*\s*(.+)$/gm)) {
      fields[field[1].trim()] = field[2].trim();
    }

    const explicitId = fields.ID?.match(/`([^`]+)`/)?.[1];
    const territorio = fields['Territorio mínimo']
      || fields['Regla mínima']
      || fields['Regla mínima Viñales']
      || '';
    const portadores = fields.Portadores
      || fields['Pueblos/autoría']
      || fields['Autoría territorial']
      || '';
    const sintesis = [
      fields['Síntesis pública'],
      fields.Mostrar,
      fields['Mostrar Viñales'],
      fields['Mostrar conuco'],
    ].filter(Boolean).join(' ');
    const cautelas = [fields.Cautela, fields.Advertencia, fields['No mostrar']].filter(Boolean);
    const fuentes = [...body.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)]
      .map((match) => ({ label: match[1], url: match[2], revisada: '2026-09-03' }));
    const ecoIdsCompatibles = [...new Set([...territorio.matchAll(/`(\d{1,3})`/g)].map((match) => Number(match[1])))]
      .sort((a, b) => a - b);

    return {
      id: explicitId || `${prefix}_${slug(heading[2])}`,
      nombre: heading[2].trim(),
      region,
      ficha_base_documental: fields['Ficha base'] || null,
      portadores,
      paises: [],
      eco_ids_compatibles: ecoIdsCompatibles,
      sintesis_publica: sintesis,
      cautelas,
      fuentes,
      territorio: {
        estado: 'documentado_sin_geometria',
        regla_textual: territorio,
        geometria_id: null,
        fuente_geometria: null,
        licencia_geometria: null,
      },
      fuente_inventario: relativePath.replaceAll('\\', '/'),
    };
  });
}

const saberes = [
  ...parseCulturalInventory(
    path.join('insumos', 'centroamerica-caribe', 'CAPAS_CULTURALES_LOCALES.md'),
    'centroamerica-caribe',
    'cac',
  ),
  ...parseCulturalInventory(
    path.join('insumos', 'mexico-estados-unidos', 'CAPAS_CULTURALES_LOCALES.md'),
    'mexico-estados-unidos',
    'mxus',
  ),
];
const saberIds = saberes.map(({ id }) => id);
const duplicateSaberIds = saberIds.filter((id, index) => saberIds.indexOf(id) !== index);
const phase2Report = {
  generado: new Date().toISOString(),
  entradas_documentadas: saberes.length,
  entradas_sin_geometria: saberes.filter((s) => s.territorio.estado === 'documentado_sin_geometria').length,
  entradas_activables_en_produccion: 0,
  ids_duplicados: [...new Set(duplicateSaberIds)],
  valido: duplicateSaberIds.length === 0 && saberes.every((s) => s.fuentes.length > 0),
};
if (!phase2Report.valido) {
  console.error(JSON.stringify(phase2Report, null, 2));
  process.exit(1);
}
const phase2 = path.join(root, 'fase-2-saberes-territoriales');
fs.writeFileSync(path.join(phase2, 'inventario-saberes-documentados.json'), `${JSON.stringify(saberes, null, 2)}\n`);
fs.writeFileSync(path.join(phase2, 'reporte-validacion.json'), `${JSON.stringify(phase2Report, null, 2)}\n`);

console.log(JSON.stringify({ fase_1: report, fase_2: phase2Report }, null, 2));
