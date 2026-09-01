import { SITE_ORIGIN } from '@/lib/http';
import { requierePlan } from '@/lib/auth/apiGuard';
import { derivaKoppen, PERIODOS, FUENTE_KOPPEN_BECK } from '@/lib/koppenBeck';

/**
 * Köppen-Geiger de 1 km del predio (Beck et al. 2023, CC BY 4.0).
 *
 * No sale de ningún servicio externo: el mapa es un GeoTIFF que viaja con la
 * app (ver `lib/koppenBeck.ts`). Por eso acá no hay caché en base —la lectura
 * es un `readRasters` de una tesela sobre disco local, del orden del
 * milisegundo, y guardarla costaría más que rehacerla— pero sí caché de
 * navegador: el valor de un punto no cambia nunca.
 *
 * Sin dato (océano, o el archivo no está en el bundle) devuelve `sinDatos` con
 * 200: no es un error, es "acá no hay mapa", y el cliente se queda con el
 * Köppen calculado a partir de POWER.
 */

export const runtime = 'nodejs';

const HDRS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': SITE_ORIGIN,
  // Inmutable de verdad: el mapa es un archivo fijo del build.
  'Cache-Control': 'public, max-age=31536000, immutable',
};

export async function GET(req: Request) {
  const bloqueo = await requierePlan('analisis.clima');
  if (bloqueo) return bloqueo;

  const p = new URL(req.url).searchParams;
  const lat = parseFloat(p.get('lat') ?? '');
  const lng = parseFloat(p.get('lng') ?? '');
  if (!isFinite(lat) || !isFinite(lng)) {
    return new Response(JSON.stringify({ error: 'Falta lat/lng.' }), { status: 400, headers: HDRS });
  }

  const d = await derivaKoppen(lat, lng);
  if (!d.presente) {
    return new Response(JSON.stringify({ sinDatos: true }), { status: 200, headers: HDRS });
  }

  return new Response(
    JSON.stringify({
      koppen: d.presente,
      // La deriva viaja aparte del `koppen`: quien sólo quiere la clase de hoy
      // no tiene que saber que existe, y si algún período faltara del bundle el
      // presente sigue respondiendo igual.
      deriva: {
        pasado:     d.pasado,
        futuro:     d.futuro,
        yaCambio:   d.yaCambio,
        vaACambiar: d.vaACambiar,
        queCambia:  d.queCambia,
        periodos:   PERIODOS,
      },
      fuente: FUENTE_KOPPEN_BECK,
    }),
    { status: 200, headers: HDRS },
  );
}
