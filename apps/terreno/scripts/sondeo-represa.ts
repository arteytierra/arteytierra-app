/**
 * Sondeo: a qué altura de muro el cierre deja de ser más chico que la grilla.
 *
 * No entrega nada. Existe porque `buscarSitiosRepresa` rankea por eficiencia
 * agua/muro, y la eficiencia siempre premia al muro más corto: con las alturas
 * que trae por defecto —3, 5 y 8 m— los tres sitios de este predio cierran en
 * dos celdas de 12,3 m, y `vaso.ts` los descarta por su propio criterio
 * (`CELDAS_MINIMAS_MURO = 3`). Esto barre altura por altura y muestra cuánto
 * mide el cierre en cada una, para elegir con el número a la vista.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { N8, analizarRelieve, buscarSitiosRepresa, dimsCelda } from '../lib/cuencaHidro';
import { CELDAS_MINIMAS_MURO, vasoDesdeMuro } from '../lib/vaso';
import { indiceDePunto } from '../lib/emplazamiento';
import { revanchaMinima } from '../lib/represaDiseno';
import { MOJONES, grillaDelPredio } from './predio-portada';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const GENERADO = path.resolve(aqui, '../../../packages/placas/generado');

async function main() {
  const { grilla } = await grillaDelPredio(GENERADO);
  const { rows, cols } = grilla;
  const rel = analizarRelieve(grilla);
  const { dx, dy, dist } = dimsCelda(grilla);
  const paso = (dx + dy) / 2;

  const eje = (lat: number, lng: number, altura: number, hastaCota: number | null) => {
    const d = indiceDePunto(grilla, lat, lng);
    if (d == null) return null;
    const r0 = (d / cols) | 0, c0 = d % cols;
    let mejor = -1, mejorS = 0;
    for (let k = 0; k < 8; k++) {
      const nr = r0 + N8[k]![0], nc = c0 + N8[k]![1];
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      const p = (rel.filled[d]! - rel.filled[nr * cols + nc]!) / dist[k]!;
      if (p > mejorS) { mejorS = p; mejor = k; }
    }
    if (mejor < 0) return null;
    const [dr, dc] = N8[mejor]!;
    const pr = -dc, pc = dr;
    const L = hastaCota ?? (rel.filled[d]! + altura);
    const punta = (signo: number) => {
      let rr = r0, cc = c0, pasos = 0;
      for (let k = 0; k < 80; k++) {
        const nr = rr + pr * signo, nc = cc + pc * signo;
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) break;
        const e = rel.filled[nr * cols + nc]!;
        if (Number.isNaN(e) || e >= L) break;
        rr = nr; cc = nc; pasos++;
      }
      const dLat = (grilla.latMax - grilla.latMin) / (rows - 1);
      const dLng = (grilla.lngMax - grilla.lngMin) / (cols - 1);
      return { punto: { lat: grilla.latMin + rr * dLat, lng: grilla.lngMin + cc * dLng }, pasos };
    };
    const p1 = punta(1), p2 = punta(-1);
    const celdas = p1.pasos + p2.pasos + 1;
    return { a: p1.punto, b: p2.punto, celdas, ancho_m: celdas * paso };
  };

  console.log(`\npaso de la grilla ${paso.toFixed(1)} m · el muro mínimo representable son ` +
    `${CELDAS_MINIMAS_MURO} celdas = ${(CELDAS_MINIMAS_MURO * paso).toFixed(0)} m\n`);
  console.log('alt  sitio                      efic   ancho(lib)  eje(celdas)  derrame   estribo  vaso(celdas)');

  for (const H of [3, 4, 5, 6, 8, 10, 12, 15, 20]) {
    const sitios = buscarSitiosRepresa(grilla, { clip: MOJONES, max: 3, alturas: [H] });
    for (const s of sitios) {
      const base = eje(s.lat, s.lng, s.altura_m, null);
      // La corona: el pelo de agua más la revancha mínima de AH-590 para el
      // largo del vaso. El muro tiene que entrar en los estribos HASTA ahí, o
      // el agua se va por la punta — que es lo que la propia biblioteca avisa.
      const d0 = indiceDePunto(grilla, s.lat, s.lng)!;
      const largoVaso = s.espejo.length >= 2 ? (() => {
        let max = 0;
        for (const p of s.espejo) for (const q of s.espejo) {
          const dd = Math.hypot((p.lng - q.lng) * 111320 * Math.cos(p.lat * Math.PI / 180),
                                (p.lat - q.lat) * 111320);
          if (dd > max) max = dd;
        }
        return max;
      })() : 0;
      const rev = revanchaMinima(largoVaso).minimo_m;
      const corona = rel.filled[d0]! + s.altura_m + rev;
      const e = eje(s.lat, s.lng, s.altura_m, corona);
      const v = e ? vasoDesdeMuro(grilla, { a: e.a, b: e.b }) : null;
      console.log(
        `${String(H).padStart(3)}  ${s.lat.toFixed(5)},${s.lng.toFixed(5)}  ` +
        `${String(s.eficiencia).padStart(6)}  ${String(s.ancho_muro_m).padStart(6)} m  ` +
        `${String(base?.celdas ?? '—').padStart(2)}→${String(e?.celdas ?? '—').padStart(2)} (${(e?.ancho_m ?? 0).toFixed(0)} m, rev ${rev.toFixed(2)})  ` +
        `${v ? v.cotaDerrame_m.toFixed(1) : '—'}  ${v ? (v.derramePorEstribo ? 'SÍ' : 'no') : '—'}       ` +
        `${v ? v.celdas.length : '—'}`);
    }
    console.log('');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
