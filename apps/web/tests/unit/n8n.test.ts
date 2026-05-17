import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { verifyN8nInbound } from '@/lib/integrations/n8n';

function makeReq(authHeader?: string): Request {
  return new Request('http://x.test', {
    headers: authHeader ? { Authorization: authHeader } : {},
  });
}

describe('integrations/n8n · verifyN8nInbound', () => {
  const prev = process.env.N8N_INTERNAL_TOKEN;
  beforeEach(() => {
    process.env.N8N_INTERNAL_TOKEN = 'supersecret-token-123';
  });
  afterEach(() => {
    process.env.N8N_INTERNAL_TOKEN = prev;
  });

  it('acepta token correcto', () => {
    expect(verifyN8nInbound(makeReq('Bearer supersecret-token-123'))).toBe(true);
  });

  it('rechaza token con length distinto', () => {
    expect(verifyN8nInbound(makeReq('Bearer corto'))).toBe(false);
  });

  it('rechaza token con misma length pero distinto contenido', () => {
    expect(verifyN8nInbound(makeReq('Bearer differentvaluez1234'))).toBe(false);
  });

  it('rechaza sin header', () => {
    expect(verifyN8nInbound(makeReq())).toBe(false);
  });

  it('rechaza si no hay env var seteada', () => {
    delete process.env.N8N_INTERNAL_TOKEN;
    expect(verifyN8nInbound(makeReq('Bearer supersecret-token-123'))).toBe(false);
  });
});
