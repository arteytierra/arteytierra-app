import type { LatLngTuple } from 'leaflet';

// Chaikin curve smoothing (3 iterations); cerrada = true suaviza el cierre del loop
export function chaikin(pts: LatLngTuple[], iteraciones = 3, cerrada = false): LatLngTuple[] {
  if (pts.length < 3) return pts;
  let cur = pts;
  for (let n = 0; n < iteraciones; n++) {
    const next: LatLngTuple[] = [];
    const m = cerrada ? cur.length : cur.length - 1;
    for (let i = 0; i < m; i++) {
      const [a0, a1] = cur[i]!;
      const [b0, b1] = cur[(i + 1) % cur.length]!;
      next.push([0.75 * a0 + 0.25 * b0, 0.75 * a1 + 0.25 * b1]);
      next.push([0.25 * a0 + 0.75 * b0, 0.25 * a1 + 0.75 * b1]);
    }
    if (!cerrada) next.push(cur[cur.length - 1]!);
    cur = next;
  }
  return cur;
}
