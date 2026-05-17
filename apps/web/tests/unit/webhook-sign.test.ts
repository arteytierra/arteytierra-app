/**
 * Tests del firmado HMAC de webhooks outbound.
 * Verifica formato Stripe `t=…,v1=…` + tolerancia temporal.
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/db/admin', () => ({
  createSupabaseAdminClient: () => ({}),
}));

const { signPayload, verifySignature, generateWebhookSecret } = await import('@/lib/webhooks-out');

describe('webhook signing', () => {
  it('signPayload genera formato Stripe', () => {
    const sig = signPayload('whsec_test', '{"foo":"bar"}', 1700000000);
    expect(sig).toMatch(/^t=1700000000,v1=[a-f0-9]{64}$/);
  });

  it('verifySignature acepta firma válida', () => {
    const body = '{"event":"order.paid"}';
    const t = Math.floor(Date.now() / 1000);
    const sig = signPayload('whsec_test', body, t);
    const ok = verifySignature({ secret: 'whsec_test', body, signatureHeader: sig });
    expect(ok).toBe(true);
  });

  it('verifySignature rechaza body modificado', () => {
    const t = Math.floor(Date.now() / 1000);
    const sig = signPayload('whsec_test', 'original', t);
    const ok = verifySignature({ secret: 'whsec_test', body: 'tampered', signatureHeader: sig });
    expect(ok).toBe(false);
  });

  it('verifySignature rechaza firma fuera de tolerancia', () => {
    const oldT = Math.floor(Date.now() / 1000) - 1000; // 16+ min atrás
    const sig = signPayload('whsec_test', 'x', oldT);
    const ok = verifySignature({ secret: 'whsec_test', body: 'x', signatureHeader: sig, toleranceSeconds: 300 });
    expect(ok).toBe(false);
  });

  it('generateWebhookSecret produce whsec_ prefix', () => {
    const s = generateWebhookSecret();
    expect(s).toMatch(/^whsec_/);
    expect(s.length).toBeGreaterThan(20);
  });
});
