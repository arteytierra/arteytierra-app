export const runtime = 'edge';

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
      'Cache-Control': 'public, max-age=86400, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
