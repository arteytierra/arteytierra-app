import { NextResponse } from 'next/server';
import { unsubscribe } from '@/lib/newsletter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token') ?? '';
  const ok = await unsubscribe(token);
  // Siempre redirigimos a página de confirmación para no filtrar tokens
  return NextResponse.redirect(new URL(`/newsletter/baja?ok=${ok ? '1' : '0'}`, url));
}
