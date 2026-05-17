// Mass-fix: add .schema('X') to every .from('table') call that doesn't already have one.
// Uses _table_map.txt (schema\ttable) generated from packages/types/src/database.ts.
//
// Strategy:
//   For each .ts/.tsx under apps/web/, find every `<chain>.from('<name>')`
//   where the preceding chain (up to the last semicolon/newline-of-statement)
//   does NOT contain `.schema('` already.
//   Insert `.schema('<schemaForTable>')` right before `.from(`.
//
// Ambiguous tables (multiple schemas) are skipped and reported.
// Tables not in the map are skipped and reported (likely typos or removed).

import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Arte y Tierra/0. Claude/apps/web';
const MAP_FILE = 'C:/Arte y Tierra/0. Claude/_table_map.txt';

const map = new Map(); // table -> [schema...]
const raw = await fs.readFile(MAP_FILE, 'utf8');
for (const line of raw.split(/\r?\n/)) {
  if (!line.trim()) continue;
  const [schema, table] = line.split('\t');
  if (!map.has(table)) map.set(table, []);
  map.get(table).push(schema);
}

// Manual disambiguation
const PREFERRED = {
  // categories appears in both fin and help. In code: most uses are help context.
  // We'll handle explicitly per file later; for now skip auto-fix on `categories`.
  // Actually let's not auto-fix ambiguous - report them.
};

async function* walk(dir) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.next') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(ts|tsx)$/.test(e.name)) yield p;
  }
}

const stats = {
  filesScanned: 0,
  filesModified: 0,
  replacements: 0,
  skippedAlreadyHasSchema: 0,
  skippedAmbiguous: [],
  skippedUnknownTable: [],
};

// Find statement boundary backwards: last `;` `{` `}` `=>` `(` newline-after-`{` etc.
function statementHasSchema(src, fromIdx) {
  // Look back until we find a statement boundary or top of file.
  // Boundary tokens: ;  {  =>  =  (  ,  return  await
  let i = fromIdx - 1;
  let parenDepth = 0;
  let braceDepth = 0;
  while (i > 0) {
    const c = src[i];
    if (c === ')') parenDepth++;
    else if (c === '(') {
      if (parenDepth === 0) break;
      parenDepth--;
    } else if (c === '}') braceDepth++;
    else if (c === '{') {
      if (braceDepth === 0) break;
      braceDepth--;
    } else if (c === ';' && parenDepth === 0 && braceDepth === 0) break;
    i--;
  }
  const segment = src.slice(i, fromIdx);
  return /\.schema\(/.test(segment);
}

// Process: find every `.from('TABLE')` (single or double quotes).
// We must insert just before `.from(`.
const FROM_RE = /\.from\((['"`])([a-zA-Z_][a-zA-Z0-9_]*)\1\)/g;

for await (const file of walk(ROOT)) {
  stats.filesScanned++;
  let src = await fs.readFile(file, 'utf8');
  let changed = false;
  const out = [];
  let lastIdx = 0;
  // Collect matches first so we don't mess with indices on edit (we use replace from end to start).
  const matches = [];
  for (const m of src.matchAll(FROM_RE)) {
    matches.push(m);
  }
  // Process from end to start (so insertion doesn't break later indices)
  for (let k = matches.length - 1; k >= 0; k--) {
    const m = matches[k];
    const table = m[2];
    const fromIdx = m.index;
    if (statementHasSchema(src, fromIdx)) {
      stats.skippedAlreadyHasSchema++;
      continue;
    }
    const schemas = map.get(table);
    if (!schemas) {
      stats.skippedUnknownTable.push(`${file}:${table}`);
      continue;
    }
    if (schemas.length > 1) {
      stats.skippedAmbiguous.push(`${file}:${table} [${schemas.join(',')}]`);
      continue;
    }
    const schema = schemas[0];
    if (schema === 'public') {
      // Native public tables (messages, push_subscriptions) - no .schema() needed
      continue;
    }
    // Insert .schema('<schema>') right before `.from(`
    const before = src.slice(0, fromIdx);
    const after = src.slice(fromIdx);
    src = before + `.schema('${schema}')` + after;
    changed = true;
    stats.replacements++;
  }
  if (changed) {
    await fs.writeFile(file, src);
    stats.filesModified++;
  }
}

console.log(JSON.stringify(stats, null, 2));
