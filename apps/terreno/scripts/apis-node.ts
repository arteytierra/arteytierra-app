/**
 * Las rutas de datos de la app, corriendo en Node.
 *
 * Los motores de `lib/` están escritos para el navegador: `obtenerClima` pide
 * `/api/clima`, `/api/clima/koppen` y `/api/clima/daymet`, y `obtenerSuelo`
 * pide `/api/suelo`. Son rutas relativas y en un script no resuelven a nada. La
 * alternativa de levantar el servidor de Next para generar un JSON es cara y
 * además pisa el `.next` del dev server, así que lo que se hace acá es poner un
 * `fetch` que entienda esas rutas.
 *
 * ── Lo que el atajo NO cambia, y por eso es legítimo ───────────────────────
 *
 * `app/api/clima/route.ts` es un proxy: pide a NASA POWER exactamente estos
 * parámetros, con lat/lng a dos decimales, y devuelve el cuerpo tal cual. Lo
 * único que agrega es caché y el guardia de plan. Así que la respuesta que
 * recibe `obtenerClima` por acá es byte por byte la que recibiría en el
 * navegador, y todo el parseo —las medias de T2M_RANGE, el 3,6 de la
 * radiación, la dirección mensual del viento— lo sigue haciendo la app.
 *
 * ── Köppen sí se atiende, y sale gratis ───────────────────────────────────
 *
 * Porque esa ruta **no sale a ninguna red**: el mapa de Beck de 1 km es un
 * GeoTIFF que viaja con la app y la ruta es `derivaKoppen` más un envoltorio
 * JSON. Llamar a la misma función desde Node devuelve exactamente lo mismo, así
 * que acá se rearma la respuesta con la forma que la ruta le da —y con la misma
 * excepción: sin dato en el punto se contesta `sinDatos` con 200, que no es un
 * error sino «acá no hay mapa»—.
 *
 * ── Daymet se deja fallar, a propósito ────────────────────────────────────
 *
 * Ésa sí son 165 líneas de lógica propia contra las teselas de ORNL, con su
 * propio calendario. Reimplementarla acá sería tener dos versiones del mismo
 * cálculo, que es la falla que este repo persigue en todas partes. Se devuelve
 * 404 y la app sigue: Daymet corrige lluvia, temperatura, radiación y humedad
 * donde contesta, **pero no mide viento** —el viento sale de POWER siempre, lo
 * dice `climaFuentes.ts`—. La pieza A sólo usa el viento, así que su dato no
 * cambia, y el predio de la pieza B está en Córdoba, fuera del bbox de Daymet,
 * así que ahí no habría entrado ni en el navegador.
 *
 * Si alguna vez una pieza necesita la LLUVIA de un predio dentro del bbox de
 * Daymet, esto deja de alcanzar y hay que correr el servidor.
 */

import { FUENTE_KOPPEN_BECK, PERIODOS, derivaKoppen } from '../lib/koppenBeck';
import { perfilSoilGridsCog } from '../lib/soilgridsCog';

const POWER_PARAMS = 'PRECTOTCORR,T2M,T2M_MAX,T2M_MIN,WS10M,WS10M_MAX,WD10M,'
  + 'RH2M,T2MDEW,T2M_RANGE,ALLSKY_SFC_SW_DWN';

/** Qué rutas se contestaron y cómo. Va al documento de la entrega. */
export const BITACORA: string[] = [];

const json = (cuerpo: unknown) =>
  new Response(JSON.stringify(cuerpo), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });

let puesto = false;

export function instalarApisDeNode() {
  if (puesto) return;
  puesto = true;
  const original = globalThis.fetch;

  globalThis.fetch = (async (entrada: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof entrada === 'string' ? entrada : entrada instanceof URL ? entrada.href : entrada.url;
    if (!url.startsWith('/api/')) return original(entrada as RequestInfo, init);

    const q = new URL(url, 'https://local.invalid').searchParams;
    const lat = Number(q.get('lat'));
    const lng = Number(q.get('lng'));

    // El suelo entra por el mismo camino que Köppen y por la misma razón: el
    // primer intento de la ruta es `perfilSoilGridsCog`, que lee los rásters de
    // SoilGrids sin salir a ninguna red. Si eso falla, la ruta cae a la API de
    // consulta de ISRIC, y acá se hace lo mismo con un solo intento: esto es un
    // generador que corre a mano, no una ruta de producción con reintentos.
    if (url.startsWith('/api/suelo/ssurgo')) {
      BITACORA.push('/api/suelo/ssurgo → 404 a propósito (es sólo de EE. UU.)');
      return new Response('no implementado en Node', { status: 404 });
    }
    if (url.startsWith('/api/suelo')) {
      try {
        const perfil = await perfilSoilGridsCog(Number(lat.toFixed(3)), Number(lng.toFixed(3)));
        BITACORA.push('/api/suelo → rásters locales de SoilGrids');
        return json(perfil);
      } catch {
        const u = 'https://rest.isric.org/soilgrids/v2.0/properties/query'
          + `?lon=${lng.toFixed(3)}&lat=${lat.toFixed(3)}`
          + ['phh2o', 'soc', 'clay', 'sand', 'silt', 'bdod', 'nitrogen']
            .map(p => `&property=${p}`).join('')
          + ['0-5cm', '5-15cm', '15-30cm', '30-60cm', '60-100cm', '100-200cm']
            .map(d => `&depth=${d}`).join('')
          + '&value=mean';
        const res = await original(u, { signal: AbortSignal.timeout(60_000) });
        BITACORA.push(`/api/suelo → ISRIC REST ${res.status}`);
        return new Response(await res.text(), {
          status: res.status, headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (url.startsWith('/api/clima/daymet')) {
      BITACORA.push('/api/clima/daymet → 404 a propósito (ver clima-node.ts)');
      return new Response('no implementado en Node', { status: 404 });
    }

    if (url.startsWith('/api/clima/koppen')) {
      const d = await derivaKoppen(lat, lng);
      if (!d.presente) {
        BITACORA.push(`/api/clima/koppen → sin dato en ${lat}, ${lng}`);
        return json({ sinDatos: true });
      }
      BITACORA.push(`/api/clima/koppen → ${d.presente.codigo} (mapa local de 1 km)`);
      return json({
        koppen: d.presente,
        deriva: {
          pasado: d.pasado, futuro: d.futuro,
          yaCambio: d.yaCambio, vaACambiar: d.vaACambiar, queCambia: d.queCambia,
          periodos: PERIODOS,
        },
        fuente: FUENTE_KOPPEN_BECK,
      });
    }

    // El mismo redondeo que hace la ruta: ~10 km, que es la celda de POWER.
    const latR = lat.toFixed(2), lngR = lng.toFixed(2);
    const arriba = 'https://power.larc.nasa.gov/api/temporal/climatology/point'
      + `?parameters=${POWER_PARAMS}&community=AG&longitude=${lngR}&latitude=${latR}&format=JSON`;
    const res = await original(arriba, { signal: AbortSignal.timeout(60_000) });
    const texto = await res.text();
    BITACORA.push(`/api/clima → NASA POWER ${res.status} para ${latR}, ${lngR}`);
    return new Response(texto, { status: res.status, headers: { 'Content-Type': 'application/json' } });
  }) as typeof fetch;
}
