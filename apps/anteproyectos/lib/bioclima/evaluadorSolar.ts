/**
 * Implementación real de `EvaluadorSolar` (Fase A2, ver PLAN-DOS-PISTAS.md).
 * Punto de desacople del Checkpoint 0: la Pista B (ChatGPT) arranca B1/B2
 * con un evaluador provisional que implemente la misma interfaz y cambia a
 * éste sin tocar el generador.
 *
 * Para cada objeto, evalúa un punto representativo (centro de la huella a
 * media altura para un prisma; centroide del plano para una superficie) y
 * comprueba, hora a hora, si algún OTRO objeto de la escena lo tapa del sol
 * — usando lib/bioclima/sombra.ts, que resuelve tanto prismas verticales
 * como planos inclinados (cubiertas).
 */
import type {
  EvaluadorSolar,
  MapaInsolacion,
  ModeloSitio,
  ObjetoVolumen,
  ResultadoInsolacionObjeto,
} from '@arteytierra/anteproyectos-contracts';
import { diaDelAnio, posicionSolar } from './posicionSolar';
import { direccionDesdeAzimutElevacion, factorSombreado } from './sombra';

function puntoRepresentativo(o: ObjetoVolumen): { x_m: number; y_m: number; z_m: number } {
  if (o.geometria === 'prisma') {
    const n = o.vertices.length || 1;
    const x_m = o.vertices.reduce((s, v) => s + v.x_m, 0) / n;
    const y_m = o.vertices.reduce((s, v) => s + v.y_m, 0) / n;
    return { x_m, y_m, z_m: o.z0_m + o.altura_m / 2 };
  }
  const n = o.vertices.length || 1;
  const x_m = o.vertices.reduce((s, v) => s + v.x_m, 0) / n;
  const y_m = o.vertices.reduce((s, v) => s + v.y_m, 0) / n;
  const z_m = o.vertices.reduce((s, v) => s + v.z_m, 0) / n;
  return { x_m, y_m, z_m };
}

export const evaluadorSolarReal: EvaluadorSolar = {
  async evaluar(
    volumenes: ObjetoVolumen[],
    sitio: ModeloSitio,
    fecha: Date,
    horas: number[],
  ): Promise<MapaInsolacion> {
    const lat = sitio.sistema.origen.lat;
    const doy = diaDelAnio(fecha);

    const resultados: ResultadoInsolacionObjeto[] = volumenes.map(o => {
      const p = puntoRepresentativo(o);
      const muestras = horas.map(hora => {
        const pos = posicionSolar(lat, doy, hora);
        if (pos.elevacion_deg <= 0) {
          return { hora, iluminado: false, porcentajeSombreado: 100 };
        }
        const rayo = { x0_m: p.x_m, y0_m: p.y_m, z0_m: p.z_m, ...direccionDesdeAzimutElevacion(pos.azimut_deg, pos.elevacion_deg) };
        const sombreado = factorSombreado(volumenes, rayo, o.id);
        return { hora, iluminado: sombreado < 0.5, porcentajeSombreado: Math.round(sombreado * 100) };
      });

      const horasSol = muestras.filter(m => m.iluminado).length * (horas.length > 1 ? (horas[horas.length - 1]! - horas[0]!) / (horas.length - 1) : 1);
      const porcentajeSombreado = muestras.length
        ? Math.round(muestras.reduce((s, m) => s + m.porcentajeSombreado, 0) / muestras.length)
        : 0;

      return { objetoId: o.id, horasSol: Math.round(horasSol * 10) / 10, porcentajeSombreado, muestras };
    });

    return { fecha: fecha.toISOString().slice(0, 10), resultados };
  },
};
