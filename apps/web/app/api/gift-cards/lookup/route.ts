import { NextResponse } from 'next/server';
import { lookupGiftCard } from '@/lib/gift-cards';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code') ?? '';
  const result = await lookupGiftCard(code);
  return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
}
