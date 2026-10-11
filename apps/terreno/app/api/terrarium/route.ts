import { ipDe, limitar } from '@/lib/rateLimit';

/**
 * Proxy de las teselas de elevación Terrarium (AWS Open Data).
 *
 * Lo leen el shader de relieve, la Vista 3D y `grillaElevacion.ts` cuando
 * `/api/dem` no responde.
 *
 * POR QUÉ ACÁ NO HAY CANDADO DE PLAN (01/10/2026)
 *
 * Esta ruta figuraba como un agujero: un Semilla podría reconstruir relieve por
 * acá, esquivando el tope de 0,5 ha que `requiereTopoDe` aplica en `/api/dem` y
 * en `/api/elevacion`. Mirado de cerca, el candado no corresponde, por dos
 * razones que conviene dejar escritas para no volver a abrir la discusión:
 *
 *  1. **No se puede aplicar el tope de superficie.** La tesela más chica que
 *     existe cubre cientos de hectáreas, así que exigir 0,5 ha por tesela
 *     dejaría sin relieve también a la muestra gratis que el plan Semilla SÍ
 *     tiene. Acotar de verdad pediría contabilizar superficie acumulada por
 *     usuario, y eso necesita un store compartido que hoy no existe (ver la nota
 *     de `lib/rateLimit.ts`).
 *  2. **El dato no es nuestro y es público.** `elevation-tiles-prod` es un
 *     bucket de AWS Open Data: se lee sin clave y sin nosotros. Cerrar el proxy
 *     no le negaría el dato a nadie; sólo lo mandaría a buscarlo directo.
 *
 * Lo único que el proxy agrega —y por lo tanto lo único que hay que proteger— es
 * NUESTRO ancho de banda y tiempo de función. Eso se defiende con dos cosas: el
 * límite por IP de abajo y la caché del CDN, que es lo que hace que la tesela se
 * sirva sin volver a S3. El límite es generoso a propósito: un shader pide
 * decenas de teselas de un tirón, y la idea es frenar el loop de un script, no el
 * trabajo de alguien.
 */
export async function GET(req: Request) {
  if (!limitar(`terrarium:${ipDe(req)}`, 240, 60_000))
    return new Response('Demasiadas solicitudes.', { status: 429 });

  const p = new URL(req.url).searchParams;
  const z = p.get('z'), x = p.get('x'), y = p.get('y');
  // Sólo enteros no negativos: se interpolan en la URL de S3, así que validarlos
  // evita cualquier traversal de path (`x=../../otro`) hacia objetos del bucket.
  const esTesela = (v: string | null): v is string => v !== null && /^\d+$/.test(v);
  if (!esTesela(z) || !esTesela(x) || !esTesela(y)) return new Response('Bad request', { status: 400 });

  const res = await fetch(
    `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`,
    { headers: { Accept: 'image/png' }, signal: AbortSignal.timeout(15_000) },
  );
  if (!res.ok) return new Response(null, { status: res.status });

  return new Response(res.body, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      // `max-age` sólo cachea en el navegador: sin `s-maxage` el CDN de Vercel no
      // guarda nada y cada tesela vuelve a pedirle a S3 desde la función (~3,7 s).
      // El relieve es inmutable, así que se puede cachear por un año.
      'Cache-Control': 'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
