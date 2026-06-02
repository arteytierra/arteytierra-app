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
  const body = await req.json() as { locations: unknown };
  let locs: string;
  if (Array.isArray(body.locations)) {
    locs = (body.locations as Array<{ latitude: number; longitude: number }>)
      .map(l => `${l.latitude},${l.longitude}`)
      .join('|');
  } else {
    locs = String(body.locations);
  }
  const res = await fetch(`${BASE}?locations=${encodeURIComponent(locs)}`, {
    signal: AbortSignal.timeout(30_000),
  });
  return new Response(await res.text(), { status: res.status, headers: HDRS });
}
