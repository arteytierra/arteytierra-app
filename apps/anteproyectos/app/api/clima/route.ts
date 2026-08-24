/**
 * Proxy a NASA POWER (climatología 1981–2023), igual que `apps/terreno`.
 * Sin clave de API, cobertura global — por eso el análisis climático funciona
 * en cualquier clima, no solo en el trópico húmedo.
 *
 * Nota: `apps/terreno` además cachea en Supabase (`cacheGet`/`cacheSet`) y
 * exige plan pago (`requierePlan`). Esta app todavía no tiene esa
 * infraestructura montada — si se agrega, portar ambas cosas acá.
 */
const HDRS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const lat = p.get('lat');
  const lng = p.get('lng');
  if (!lat || !lng) return new Response('Missing lat/lng', { status: 400 });

  const latR = parseFloat(lat).toFixed(2);
  const lngR = parseFloat(lng).toFixed(2);

  const params =
    'PRECTOTCORR,T2M,T2M_MAX,T2M_MIN,WS10M,WS10M_MAX,WD10M,RH2M,T2MDEW,T2M_RANGE,ALLSKY_SFC_SW_DWN';
  const url =
    'https://power.larc.nasa.gov/api/temporal/climatology/point' +
    `?parameters=${params}&community=AG&longitude=${lngR}&latitude=${latR}&format=JSON`;

  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  } catch {
    return new Response(
      JSON.stringify({ error: 'NASA POWER no disponible, reintentá en unos segundos.' }),
      { status: 503, headers: HDRS },
    );
  }

  if (!res.ok) {
    return new Response(JSON.stringify({ error: `NASA POWER respondió con error ${res.status}.` }), {
      status: res.status,
      headers: HDRS,
    });
  }

  const text = await res.text();
  return new Response(text, { status: 200, headers: HDRS });
}
