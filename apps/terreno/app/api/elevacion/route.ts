export const runtime = 'edge';

const BASE = 'https://api.opentopodata.org/v1/srtm30m';
const HDRS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

export async function GET(req: Request) {
  const locations = new URL(req.url).searchParams.get('locations') ?? '';
  if (!locations) return new Response('Missing locations', { status: 400 });
  const res = await fetch(`${BASE}?locations=${encodeURIComponent(locations)}`, {
    signal: AbortSignal.timeout(25_000),
  });
  return new Response(await res.text(), { status: res.status, headers: HDRS });
}

export async function POST(req: Request) {
  const body = await req.text();
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    signal: AbortSignal.timeout(30_000),
  });
  return new Response(await res.text(), { status: res.status, headers: HDRS });
}
