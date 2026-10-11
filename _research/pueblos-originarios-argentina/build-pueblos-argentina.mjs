/**
 * Arma `apps/terreno/lib/pueblosOriginariosAr.ts` a partir del listado de
 * comunidades indígenas del INAI.
 *
 * Fuente: Instituto Nacional de Asuntos Indígenas (INAI) — «Listado de
 * comunidades indígenas», publicado en el portal de datos abiertos del
 * Ministerio de Justicia (datos.jus.gob.ar), dataset
 * `listado-de-comunidades-indigenas`, distribución del 23/02/2024.
 * Licencia Creative Commons Atribución 4.0 Internacional (CC BY 4.0).
 * El CSV queda congelado al lado de este script para que los números se puedan
 * auditar sin volver a bajar nada.
 *
 * Reúne dos registros: el Registro Nacional de Comunidades Indígenas
 * (Re.Na.C.I.) —la personería— y el Programa Relevamiento Territorial de
 * Comunidades Indígenas (Re.Te.C.I.), que es el de la Ley 26.160.
 *
 * ── Por qué se agrega por provincia y departamento, y no por distancia ──────
 *
 * El CSV trae latitud y longitud, y la tentación es contestar «tantas
 * comunidades en 50 km». No se puede: 858 de las 1.878 filas no tienen
 * coordenada (46%). Una respuesta por radio dejaría afuera casi la mitad del
 * registro sin avisar, que es justamente el número plausible y equivocado del
 * que habla `apps/terreno/lib/README.md`. Provincia y departamento, en cambio,
 * están en las 1.878 filas: la agregación administrativa es la única que
 * responde por el registro completo.
 *
 * ── Qué se normaliza del nombre del pueblo, que es poco a propósito ─────────
 *
 * El campo `comunidad_pueblo` usa « - » para las comunidades que el registro
 * anota con más de un pueblo («Wichí - Guaraní»), y espacio para las
 * denominaciones compuestas («Mapuche Tehuelche»), que son otra cosa. Así que
 * se parte sólo por « - » y sólo cuando la fila no es multiétnica.
 *
 * Fuera de eso se corrigen únicamente errores ortográficos de la misma cadena
 * —una tilde que falta, una mayúscula— y nada más. No se unifican variantes de
 * denominación: «Tehuelche Mapuche» no se da vuelta para que coincida con
 * «Mapuche Tehuelche», «Rankel» no se convierte en «Ranquel» y «Chiriguano» no
 * se reemplaza por «Ava Guaraní», aunque sea el exónimo de lo mismo. Decidir
 * eso sería que este script arbitre cómo se llama un pueblo, y no es su
 * trabajo: el registro los escribe así y así se muestran. Las variantes
 * encontradas están listadas en AUDITORIA.md.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const CSV = path.join(AQUI, 'listado-comunidades-indigenas-20240223.csv');
const SALIDA = path.join(AQUI, '..', '..', 'apps', 'terreno', 'lib', 'pueblosOriginariosAr.ts');

/** CSV con comillas dobles y comas adentro. No hay dependencia para esto en el repo. */
function filasCsv(t) {
  const out = [];
  let f = [], c = '', q = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (q) {
      if (ch === '"') {
        if (t[i + 1] === '"') { c += '"'; i++; } else q = false;
      } else c += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { f.push(c); c = ''; }
    else if (ch === '\n') { f.push(c); out.push(f); f = []; c = ''; }
    else if (ch !== '\r') c += ch;
  }
  if (c || f.length) { f.push(c); out.push(f); }
  return out;
}

/** Sólo tildes y mayúsculas: la misma palabra escrita mal en algunas filas. */
const ORTOGRAFIA = {
  'Diaguita Calchaqui': 'Diaguita Calchaquí',
  Pilaga: 'Pilagá',
  kolla: 'Kolla',
};

const ES_MULTIETNICA = /multi[eé]tnica/i;

/** Los pueblos que el registro le anota a una comunidad. */
function pueblosDeLaFila(bruto) {
  const s = (bruto || '').trim();
  if (!s) return [];
  // Una fila multiétnica no se parte: el rótulo entero es lo que el registro
  // dice, y despedazarlo por los guiones deja pedazos que no son pueblos.
  if (ES_MULTIETNICA.test(s)) return [s.replace(/\s+/g, ' ')];
  return s
    .split(/\s+-\s+/)
    .map(p => {
      const t = p.trim().replace(/\s+/g, ' ');
      return ORTOGRAFIA[t] ?? t;
    })
    .filter(Boolean);
}

const raw = fs.readFileSync(CSV, 'utf8').replace(/^﻿/, '');
const F = filasCsv(raw);
const cab = F[0];
const regs = F.slice(1)
  .filter(r => r.length === cab.length)
  .map(r => Object.fromEntries(cab.map((k, i) => [k, r[i]])));

const ESTADOS = {
  Culminado: 'culminado',
  Iniciado: 'iniciado',
  'En trámite': 'en_tramite',
  'Sin relevar': 'sin_relevar',
};

const provincias = new Map();
for (const r of regs) {
  const prov = (r.comunidad_provincia || '').trim();
  const depto = (r.comunidad_departamento || '').trim();
  if (!prov || !depto) throw new Error('fila sin provincia o departamento: ' + r.comunidad_id);

  if (!provincias.has(prov)) {
    provincias.set(prov, {
      provincia: prov,
      comunidades: 0,
      conPersoneria: 0,
      pueblos: new Map(),
      relevamiento: { culminado: 0, iniciado: 0, en_tramite: 0, sin_relevar: 0, sin_dato: 0 },
      departamentos: new Map(),
    });
  }
  const P = provincias.get(prov);
  P.comunidades++;
  if ((r.personeria_juridica_estado || '').trim() === 'Inscripta') P.conPersoneria++;
  const clave = ESTADOS[(r.relevamiento_estado || '').trim()] ?? 'sin_dato';
  P.relevamiento[clave]++;

  if (!P.departamentos.has(depto)) {
    P.departamentos.set(depto, { departamento: depto, comunidades: 0, pueblos: new Map() });
  }
  const D = P.departamentos.get(depto);
  D.comunidades++;

  for (const pu of pueblosDeLaFila(r.comunidad_pueblo)) {
    P.pueblos.set(pu, (P.pueblos.get(pu) || 0) + 1);
    D.pueblos.set(pu, (D.pueblos.get(pu) || 0) + 1);
  }
}

/** Más comunidades primero; a igual número, alfabético, para que el orden sea estable. */
function listaPueblos(m) {
  return [...m.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'es'))
    .map(([pueblo, comunidades]) => ({ pueblo, comunidades }));
}

const j = v => JSON.stringify(v);
const pu = p => `{ pueblo: ${j(p.pueblo)}, comunidades: ${p.comunidades} }`;

const orden = [...provincias.values()].sort((a, b) => a.provincia.localeCompare(b.provincia, 'es'));

const cuerpo = orden
  .map(P => {
    const rel = P.relevamiento;
    const deptos = [...P.departamentos.values()]
      .sort((a, b) => a.departamento.localeCompare(b.departamento, 'es'))
      .map(
        D => `      {
        departamento: ${j(D.departamento)},
        comunidades: ${D.comunidades},
        pueblos: [${listaPueblos(D.pueblos).map(pu).join(', ')}],
      },`,
      )
      .join('\n');
    return `  {
    provincia: ${j(P.provincia)},
    comunidades: ${P.comunidades},
    conPersoneria: ${P.conPersoneria},
    relevamiento: { culminado: ${rel.culminado}, iniciado: ${rel.iniciado}, en_tramite: ${rel.en_tramite}, sin_relevar: ${rel.sin_relevar}, sin_dato: ${rel.sin_dato} },
    pueblos: [
${listaPueblos(P.pueblos).map(p => `      ${pu(p)},`).join('\n')}
    ],
    departamentos: [
${deptos}
    ],
  },`;
  })
  .join('\n');

const totalDeptos = orden.reduce((n, P) => n + P.departamentos.size, 0);
const rotulos = new Set();
for (const P of provincias.values()) for (const k of P.pueblos.keys()) rotulos.add(k);

const ts = `import type { RegistroProvincia } from './pueblosOriginarios';

/**
 * GENERADO. No editar a mano.
 *
 * Lo arma \`_research/pueblos-originarios-argentina/build-pueblos-argentina.mjs\`
 * desde el listado de comunidades indígenas del INAI (distribución del
 * 23/02/2024, CC BY 4.0). Las decisiones de normalización —qué se parte, qué se
 * corrige y qué se deja como está— viven en ese script y están explicadas ahí.
 *
 * ${regs.length} comunidades registradas, ${provincias.size} provincias, ${totalDeptos} departamentos,
 * ${rotulos.size} rótulos de pueblo.
 *
 * Lo que este archivo NO dice, y hay que decirlo cada vez que se muestra: una
 * provincia o un departamento que no figura acá no es un territorio sin pueblos
 * originarios. Es un territorio sin comunidades **registradas** en el Re.Na.C.I.
 * ni relevadas por el Re.Te.C.I. El registro depende de que la comunidad haya
 * iniciado y sostenido un trámite, así que su ausencia habla del trámite y no
 * de la gente.
 */
export const REGISTRO_AR: RegistroProvincia[] = [
${cuerpo}
];
`;

fs.writeFileSync(SALIDA, ts);
console.log('escrito', SALIDA);
console.log(
  'comunidades', regs.length,
  '· provincias', provincias.size,
  '· departamentos', totalDeptos,
  '· rotulos', rotulos.size,
);
console.log('rotulos:', [...rotulos].sort((a, b) => a.localeCompare(b, 'es')).join(' | '));
