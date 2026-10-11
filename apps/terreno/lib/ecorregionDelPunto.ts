import type { Ecorregion } from './ecorregiones';

/**
 * La consulta de ecorregión, con su caché, fuera de React.
 *
 * Vive separada de `useEcorregion` por dos motivos. Uno es que se pueda probar:
 * acá no hay hooks, entra una clave y sale una promesa. El otro es que la caché
 * tiene que ser del módulo y no del componente — `useEcorregion` se llama desde
 * el panel de contexto, el informe y `useFichaBioma`, que a su vez usan el mapa,
 * aptitud y calendario, así que el mismo punto se consultaba hasta cinco veces y
 * cada pantalla veía llegar el dato por su cuenta, con su propio parpadeo.
 */

/** Redondeo a ~1 km: mover un mojón no dispara una consulta nueva. */
export function claveEcorregion(lat: number | null, lng: number | null): string | null {
  if (lat === null || lng === null) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return `${lat.toFixed(2)},${lng.toFixed(2)}`;
}

const RESUELTAS = new Map<string, Ecorregion | null>();
const EN_VUELO = new Map<string, Promise<Ecorregion | null>>();

export function hayEcorregionCacheada(clave: string): boolean {
  return RESUELTAS.has(clave);
}

export function ecorregionCacheada(clave: string): Ecorregion | null {
  return RESUELTAS.get(clave) ?? null;
}

/**
 * Con qué respuestas no tiene sentido volver a preguntar por este punto.
 *
 * 404 es "no hay ecorregión terrestre acá" —un punto en el mar, una isla sin
 * polígono— y el mapa de RESOLVE es de 2017: no va a aparecer una mañana. 400
 * es un punto inválido. 401 y 403 son el plan, que no cambia mientras dure la
 * sesión.
 *
 * Un 502 o un 503 son de RESOLVE ahora, no del punto, y un fallo de red es de
 * la conexión. Cachear eso dejaría al predio sin ecorregión por el resto de la
 * sesión por un corte de tres segundos.
 */
function respuestaDefinitiva(status: number): boolean {
  return status === 400 || status === 401 || status === 403 || status === 404;
}

export function pedirEcorregion(clave: string): Promise<Ecorregion | null> {
  // Ya resuelta: se devuelve sin tocar la red. El hook además consulta la caché
  // antes de llamar acá, para poder asentar el estado en el primer render; esto
  // es para que la función sola también se comporte bien.
  if (RESUELTAS.has(clave)) return Promise.resolve(RESUELTAS.get(clave) ?? null);

  const yaPedida = EN_VUELO.get(clave);
  if (yaPedida) return yaPedida;

  const [lat, lng] = clave.split(',').map(Number);
  const pedido = fetch('/api/bioma', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lng }),
  })
    .then(async (r) => {
      if (!r.ok) return { eco: null, recordar: respuestaDefinitiva(r.status) };
      const j = (await r.json()) as Ecorregion | null;
      const eco = j && typeof j.eco_id === 'number' ? j : null;
      return { eco, recordar: true };
    })
    .catch(() => ({ eco: null, recordar: false }))
    .then(({ eco, recordar }) => {
      if (recordar) RESUELTAS.set(clave, eco);
      EN_VUELO.delete(clave);
      return eco;
    });

  EN_VUELO.set(clave, pedido);
  return pedido;
}

/** Sólo para los tests: deja la caché como recién arrancada. */
export function limpiarCacheEcorregion(): void {
  RESUELTAS.clear();
  EN_VUELO.clear();
}
