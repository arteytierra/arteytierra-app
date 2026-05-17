import { NextResponse } from 'next/server';
import { getCartSummary } from '@/lib/commerce/cart';

export const runtime = 'nodejs';

export async function GET() {
  const cart = await getCartSummary();
  return NextResponse.json(cart);
}
