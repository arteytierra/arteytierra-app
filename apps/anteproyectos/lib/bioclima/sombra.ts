/**
 * Intersección rayo-sólido contra ObjetoVolumen del contrato compartido
 * (@arteytierra/anteproyectos-contracts). Todo en el sistema local del
 * sitio (metros), no lat/lng — el contrato ya resuelve esa conversión en
 * el adaptador de sitio, así que acá no hace falta.
 *
 * Extiende apps/terreno/lib/objetosSombra.ts (que sólo resuelve prismas
 * verticales) a la unión `ObjetoPrisma | ObjetoSuperficie`: la precisión
 * (c) cerrada en la respuesta de Claude al Checkpoint 0 — una cubierta a
 * dos aguas es un plano inclinado, no una extrusión vertical, y necesita
 * su propia intersección rayo-plano.
 */
import type { ObjetoVolumen, ObjetoPrisma, ObjetoSuperficie, PuntoLocal } from '@arteytierra/anteproyectos-contracts';

export interface RayoSolar {
  x0_m: number; y0_m: number; z0_m: number;
  /** Dirección horizontal unitaria (ux,uy) + tasa de ascenso vertical por metro horizontal. */
  ux: number; uy: number; tanElev: number;
}

/** Vector desde el sol hacia el punto: dirección horizontal opuesta al sol, unitaria. */
export function direccionDesdeAzimutElevacion(azimut_deg: number, elevacion_deg: number): { ux: number; uy: number; tanElev: number } {
  const DEG = Math.PI / 180;
  // El sol está en dirección (azimut, elevación); el rayo hacia el sol desde
  // un punto del suelo viaja en esa misma dirección horizontal.
  const ux = Math.sin(azimut_deg * DEG);
  const uy = Math.cos(azimut_deg * DEG);
  const tanElev = Math.tan(Math.max(elevacion_deg, 0.01) * DEG);
  return { ux, uy, tanElev };
}

function intersectaPrisma(o: ObjetoPrisma, r: RayoSolar): number | null {
  let min = Infinity, max = -Infinity;
  const pts = o.vertices;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[j]!, b = pts[i]!;
    const ex = b.x_m - a.x_m, ey = b.y_m - a.y_m;
    const den = r.ux * ey - r.uy * ex;
    if (Math.abs(den) < 1e-9) continue; // rayo paralelo a la arista
    const qx = a.x_m - r.x0_m, qy = a.y_m - r.y0_m;
    const s = (qx * ey - qy * ex) / den;   // avance sobre el rayo (horizontal, metros)
    const t = (qx * r.uy - qy * r.ux) / den; // posición sobre la arista, 0..1
    if (t < 0 || t > 1) continue;
    if (s < min) min = s;
    if (s > max) max = s;
  }
  if (!Number.isFinite(min)) return null;

  if (max <= 0.01) return null;             // el prisma queda detrás del sol
  const s1 = Math.max(min, 0.01);
  if (s1 > max) return null;

  const zEntra = r.z0_m + s1 * r.tanElev;
  const zSale = r.z0_m + max * r.tanElev;
  const base = o.z0_m, techo = o.z0_m + o.altura_m;
  return zEntra <= techo && zSale >= base ? s1 : null;
}

function puntoEnPoligono2D(p: { u: number; v: number }, poly: Array<{ u: number; v: number }>): boolean {
  let dentro = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]!, b = poly[j]!;
    const cruzaY = (a.v > p.v) !== (b.v > p.v);
    if (!cruzaY) continue;
    const uInterseccion = a.u + ((p.v - a.v) / (b.v - a.v)) * (b.u - a.u);
    if (p.u < uInterseccion) dentro = !dentro;
  }
  return dentro;
}

function intersectaSuperficie(o: ObjetoSuperficie, r: RayoSolar): number | null {
  const pts = o.vertices;
  if (pts.length < 3) return null;
  const p0 = pts[0]!, p1 = pts[1]!, p2 = pts[2]!;
  // Normal del plano (no necesita estar normalizada para el test de intersección).
  const e1 = { x: p1.x_m - p0.x_m, y: p1.y_m - p0.y_m, z: (p1.z_m ?? 0) - (p0.z_m ?? 0) };
  const e2 = { x: p2.x_m - p0.x_m, y: p2.y_m - p0.y_m, z: (p2.z_m ?? 0) - (p0.z_m ?? 0) };
  const n = {
    x: e1.y * e2.z - e1.z * e2.y,
    y: e1.z * e2.x - e1.x * e2.z,
    z: e1.x * e2.y - e1.y * e2.x,
  };
  const d = { x: r.ux, y: r.uy, z: r.tanElev };
  const nDotD = n.x * d.x + n.y * d.y + n.z * d.z;
  if (Math.abs(nDotD) < 1e-9) return null; // rayo paralelo al plano

  const oMinusP0 = { x: r.x0_m - p0.x_m, y: r.y0_m - p0.y_m, z: r.z0_m - (p0.z_m ?? 0) };
  const nDotOMinusP0 = n.x * oMinusP0.x + n.y * oMinusP0.y + n.z * oMinusP0.z;
  const s = -nDotOMinusP0 / nDotD;
  if (s <= 0.01) return null; // detrás del sol

  // Punto de intersección 3D, proyectado a 2D sobre el plano (base e1/e2) para
  // el test de punto-en-polígono.
  const px = r.x0_m + s * d.x, py = r.y0_m + s * d.y, pz = r.z0_m + s * d.z;
  const rel = { x: px - p0.x_m, y: py - p0.y_m, z: pz - (p0.z_m ?? 0) };
  const proyectar = (q: { x: number; y: number; z: number }) => ({
    u: q.x * e1.x + q.y * e1.y + q.z * e1.z,
    v: q.x * e2.x + q.y * e2.y + q.z * e2.z,
  });
  const poly2D = pts.map(v => proyectar({ x: v.x_m - p0.x_m, y: v.y_m - p0.y_m, z: (v.z_m ?? 0) - (p0.z_m ?? 0) }));
  const pt2D = proyectar(rel);

  return puntoEnPoligono2D(pt2D, poly2D) ? s : null;
}

/**
 * Factor de sombreado (0 = sin obstrucción, 1 = totalmente opaco) del punto
 * de origen del rayo, considerando todos los objetos salvo `excluirId`
 * (para que un objeto no se sombree a sí mismo). Si varios objetos
 * intersectan, se queda con la opacidad mayor.
 */
export function factorSombreado(objetos: ObjetoVolumen[], rayo: RayoSolar, excluirId?: string): number {
  let max = 0;
  for (const o of objetos) {
    if (o.id === excluirId) continue;
    const s = o.geometria === 'prisma' ? intersectaPrisma(o, rayo) : intersectaSuperficie(o, rayo);
    if (s == null) continue;
    const opacidad = o.opacidadSolar ?? 1;
    if (opacidad > max) max = opacidad;
  }
  return Math.min(1, max);
}

export function centroideDe(vertices: PuntoLocal[]): { x_m: number; y_m: number; z_m: number } {
  const n = vertices.length || 1;
  const x_m = vertices.reduce((s, v) => s + v.x_m, 0) / n;
  const y_m = vertices.reduce((s, v) => s + v.y_m, 0) / n;
  const z_m = vertices.reduce((s, v) => s + (v.z_m ?? 0), 0) / n;
  return { x_m, y_m, z_m };
}
