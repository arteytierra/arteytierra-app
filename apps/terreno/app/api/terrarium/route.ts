export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const z = p.get('z'), x = p.get('x'), y = p.get('y');
  if (!z || !x || !y) return new Response('Bad request', { status: 400 });

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
