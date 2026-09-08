import 'server-only';
import { createHash } from 'crypto';
import { createSupabaseAdminClient } from '@/lib/db/admin';

type Provider = 'mercadopago' | 'paypal' | 'stripe';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function table(): any {
  return (createSupabaseAdminClient() as any).schema('terreno').from('suscripcion_eventos_proveedor');
}

export function payloadHash(rawBody: string): string {
  return createHash('sha256').update(rawBody).digest('hex');
}

/** Reserva atómicamente un evento. false significa que ya fue recibido. */
export async function claimProviderEvent(input: {
  provider: Provider;
  eventId: string;
  providerRef?: string | null;
  eventType: string;
  eventAt?: string | null;
  rawBody: string;
}): Promise<boolean> {
  const eventAt = input.eventAt && !Number.isNaN(Date.parse(input.eventAt))
    ? new Date(input.eventAt).toISOString()
    : new Date().toISOString();
  const { error } = await table().insert({
    provider: input.provider,
    event_id: input.eventId,
    provider_ref: input.providerRef ?? null,
    event_type: input.eventType,
    event_at: eventAt,
    payload_hash: payloadHash(input.rawBody),
  });
  if (!error) return true;
  if (error.code === '23505') return false;
  throw error;
}

export async function markProviderEventApplied(provider: Provider, eventId: string): Promise<void> {
  const { error } = await table()
    .update({ applied_at: new Date().toISOString() })
    .eq('provider', provider)
    .eq('event_id', eventId);
  if (error) throw error;
}

/** Un fallo libera la reserva para que el reintento del proveedor pueda procesarla. */
export async function releaseProviderEvent(provider: Provider, eventId: string): Promise<void> {
  const { error } = await table()
    .delete()
    .eq('provider', provider)
    .eq('event_id', eventId)
    .is('applied_at', null);
  if (error) console.error('[provider event release]', { provider, eventId, error: error.message });
}
