/**
 * Valida una entrega de GPT antes de montarla.
 *
 *   node _research/validar-entrega-gpt.mjs "C:/Arte y Tierra/encargos-gpt/entregas/forraje"
 *
 * El contrato que chequea está escrito en `_encargos/GPT_LOCAL_REGLAS.md`: un
 * archivo JSON por lote, con `encargo`, `lote`, `fecha` y `entradas`, y cada
 * entrada con `id`, `fuentes` y `verificacion`.
 *
 * ── Qué puede y qué no puede chequear un script ─────────────────────────────
 *
 * Puede: que el JSON parsee, que no falte un campo obligatorio, que ninguna
 * entrada venga sin fuente, que las URLs tengan forma de URL, que no haya ids
 * repetidos entre lotes, y —cuando el encargo apunta a fichas— que el id exista
 * en el catálogo. Eso último es lo que más errores encuentra: un id inventado o
 * mal tipeado pasa cualquier revisión de lectura y no entra en ningún lado.
 *
 * NO puede chequear lo único que de verdad importa: **si la fuente dice lo que
 * la entrada dice.** Eso no lo prueba ningún test. Para eso está el muestreo:
 * abrir al azar una de cada diez y leerla. Si una no aguanta, vuelve el lote
 * entero, porque el error no es de esa entrada sino del método con que se
 * escribió.
 *
 * Por eso el script termina diciendo cuántas hay que muestrear y cuáles,
 * elegidas con una semilla fija para que dos corridas pidan las mismas y se
 * pueda discutir sobre la misma muestra.
 *
 * Sale 1 si hay algún error, 0 si sólo hay avisos. No escribe nada.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) {
  console.error('Falta la carpeta de la entrega.\n' +
    '  node _research/validar-entrega-gpt.mjs "C:/Arte y Tierra/encargos-gpt/entregas/forraje"');
  process.exit(2);
}
if (!existsSync(dir)) { console.error(`No existe la carpeta: ${dir}`); process.exit(2); }

/** Todos los ids de ficha del catálogo, para contrastar los que apunten a fichas. */
function idsDeFichas() {
  const LIB = 'apps/terreno/lib/';
  if (!existsSync(LIB)) return null;   // se corrió desde otra carpeta
  const ids = new Set();
  const archivos = readdirSync(LIB).filter(f => /^(biomasRegionales.*|contexto)\.ts$/.test(f));
  for (const f of archivos)
    for (const m of readFileSync(LIB + f, 'utf8').matchAll(/^  ([a-z0-9_]+):\s*\{/gm)) ids.add(m[1]);
  return ids;
}

const OBLIGATORIOS = ['id', 'fuentes', 'verificacion'];

/* Los cuatro valores que admite `tipo_de_cifra` en el encargo de forraje, de
 * mas util a menos. Ver `_encargos/ENCARGO_FORRAJE_LOTE_02.md`. */
const TIPOS_DE_CIFRA = ['oferta_aprovechable', 'receptividad', 'ms_herbacea_total', 'npp_herbacea'];
const errores = [];
const avisos = [];
/*
 * id → archivo donde apareció primero. Lo que cuenta como repetido depende del
 * encargo, y la primera versión de esto se equivocó:
 *
 * En `licencias`, `forraje` y `fuentes-propias` el id identifica la entrada, así
 * que repetirlo es un error. En `practicas` **no**: el id es la ficha y la
 * entrada es una práctica, porque `PRACTICAS_POR_FICHA` es un
 * `Record<fichaId, PracticaHistorica[]>` y el encargo pide justamente varias por
 * ficha. El lote 01 de Indomalaya entregó 10 prácticas sobre 4 fichas —la forma
 * correcta— y el validador lo rechazó con seis errores. Casi devolvió un lote
 * bien hecho, que es el peor error que puede cometer un validador: no deja pasar
 * algo malo, tira algo bueno.
 *
 * Entonces la clave de unicidad es el id, salvo en prácticas, donde es el par
 * (id, práctica): dos veces la misma práctica en la misma ficha sí es un error,
 * y es el mismo chequeo que hace el test de `practicasHistoricas`.
 */
const vistos = new Map();
let encargoDeclarado = null;
const entradas = [];
let vacias = 0;

const archivos = readdirSync(dir).filter(f => f.toLowerCase().endsWith('.json')).sort();
if (archivos.length === 0) { console.error(`No hay ningún .json en ${dir}`); process.exit(2); }

for (const arch of archivos) {
  let lote;
  try {
    lote = JSON.parse(readFileSync(join(dir, arch), 'utf8'));
  } catch (e) {
    errores.push(`${arch}: no parsea como JSON — ${e.message}`);
    continue;
  }
  if (typeof lote.encargo === 'string' && !encargoDeclarado) encargoDeclarado = lote.encargo;
  for (const campo of ['encargo', 'lote', 'fecha']) {
    if (lote[campo] === undefined) avisos.push(`${arch}: sin \`${campo}\` en la cabecera del lote`);
  }
  if (!Array.isArray(lote.entradas) && !Array.isArray(lote.vacias)) {
    errores.push(`${arch}: no trae \`entradas\` ni \`vacias\``);
    continue;
  }
  for (const v of lote.vacias ?? []) {
    vacias++;
    if (!v.id) errores.push(`${arch}: una entrada de \`vacias\` sin \`id\``);
    if (!v.motivo) errores.push(`${arch}: \`${v.id}\` está en \`vacias\` sin \`motivo\` — un hueco sin explicación no sirve`);
  }
  for (const e of lote.entradas ?? []) {
    const id = e.id ?? '(sin id)';
    for (const campo of OBLIGATORIOS) {
      if (e[campo] === undefined || e[campo] === '' ||
          (Array.isArray(e[campo]) && e[campo].length === 0)) {
        errores.push(`${arch} · ${id}: falta \`${campo}\``);
      }
    }
    for (const f of e.fuentes ?? []) {
      if (!f.url || !/^https?:\/\/\S+$/.test(f.url)) errores.push(`${arch} · ${id}: url con forma inválida — ${JSON.stringify(f.url)}`);
      if (!f.label) errores.push(`${arch} · ${id}: una fuente sin \`label\``);
      else if (f.label.length < 12) avisos.push(`${arch} · ${id}: \`label\` muy corto ("${f.label}") — se copia el título de la página, no se abrevia`);
    }
    if (typeof e.verificacion === 'string' && e.verificacion.length < 40)
      avisos.push(`${arch} · ${id}: \`verificacion\` de ${e.verificacion.length} caracteres — tiene que decir qué afirma la fuente`);
    /*
     * En forraje la cifra no significa nada sin saber QUE cuenta. El lote 01
     * volvio con NPP de sotobosque donde haciamos falta oferta aprovechable
     * —entre las dos hay un factor de varias veces, no un porcentaje— y no se
     * pudo montar nada. Desde el lote 02 el tipo viene declarado y acotado, asi
     * que si falta o no es uno de los cuatro, el lote no pasa.
     */
    if (/forraje/i.test(encargoDeclarado ?? '') && e.tipo_de_cifra !== undefined) {
      if (!TIPOS_DE_CIFRA.includes(e.tipo_de_cifra))
        errores.push(`${arch} · ${id}: \`tipo_de_cifra\` ${JSON.stringify(e.tipo_de_cifra)} no es uno de ${TIPOS_DE_CIFRA.join(', ')}`);
      else if (e.tipo_de_cifra === 'receptividad' && e.receptividad_valor == null)
        errores.push(`${arch} · ${id}: dice \`receptividad\` pero no trae \`receptividad_valor\``);
      else if (e.tipo_de_cifra !== 'receptividad' && e.kg_ms_ha_anio_min == null && e.kg_ms_ha_anio_max == null)
        errores.push(`${arch} · ${id}: ${e.tipo_de_cifra} sin ningún kg MS/ha·año`);
    }

    if (e.id) {
      const porFicha = /practica/i.test(encargoDeclarado ?? '');
      const clave = porFicha ? `${e.id}\u0000${(e.practica ?? '').trim().toLowerCase()}` : e.id;
      if (vistos.has(clave)) {
        errores.push(porFicha
          ? `${arch} · ${e.id}: la práctica "${e.practica}" ya venía en ${vistos.get(clave)}`
          : `${arch} · ${e.id}: id repetido, ya venía en ${vistos.get(clave)}`);
      } else {
        vistos.set(clave, arch);
      }
      if (porFicha && !e.practica)
        errores.push(`${arch} · ${e.id}: sin \`practica\`, y es lo que distingue una entrada de otra en la misma ficha`);
    }
    entradas.push({ ...e, _arch: arch });
  }
}

// Contraste contra el catálogo, sólo si los ids parecen de ficha.
const fichas = idsDeFichas();
if (fichas) {
  // Sobre los ids reales, no sobre las claves de unicidad, que en prácticas
  // llevan la práctica pegada atrás.
  const idsReales = [...new Set(entradas.map(e => e.id).filter(Boolean))];
  const desconocidos = idsReales.filter(id => !fichas.has(id));
  if (desconocidos.length && desconocidos.length < idsReales.length) {
    for (const id of desconocidos) avisos.push(`\`${id}\` no es un id de ficha del catálogo — puede estar bien si el encargo no apunta a fichas`);
  }
}

console.log(`Entrega: ${dir}`);
console.log(`Lotes: ${archivos.length} · entradas: ${entradas.length} · vacías declaradas: ${vacias}\n`);
for (const e of errores) console.log(`  ERROR  ${e}`);
for (const a of avisos) console.log(`  aviso  ${a}`);
if (!errores.length && !avisos.length) console.log('  Sin errores ni avisos de forma.\n');

// El muestreo: una de cada diez, con semilla fija para que sea la misma muestra.
if (entradas.length) {
  const n = Math.max(1, Math.ceil(entradas.length / 10));
  let s = entradas.length * 2654435761 % 4294967291;
  const elegidas = new Set();
  while (elegidas.size < n) { s = (s * 48271) % 2147483647; elegidas.add(s % entradas.length); }
  console.log(`\nMuestreo obligatorio — ${n} de ${entradas.length}. Abrir la fuente y leerla:`);
  for (const i of [...elegidas].sort((a, b) => a - b)) {
    const e = entradas[i];
    console.log(`  ${e._arch} · ${e.id}`);
    for (const f of e.fuentes ?? []) console.log(`      ${f.url}`);
  }
  console.log('\nSi una no aguanta, vuelve el lote entero: el problema es el método, no la entrada.');
}

process.exit(errores.length ? 1 : 0);
