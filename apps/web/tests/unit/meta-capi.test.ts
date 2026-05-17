import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import crypto from 'node:crypto';

describe('integrations/meta-capi · sendMetaEvent', () => {
  const fetchMock = vi.fn();
  const prev = { ...process.env };

  beforeEach(() => {
    process.env.META_PIXEL_ID = '123456';
    process.env.META_CAPI_TOKEN = 'token-abc';
    delete process.env.META_CAPI_TEST_CODE;
    global.fetch = fetchMock as unknown as typeof fetch;
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({ ok: true, text: async () => '' });
  });

  afterEach(() => {
    Object.assign(process.env, prev);
  });

  it('no llama a fetch si no hay pixel id', async () => {
    delete process.env.META_PIXEL_ID;
    const { sendMetaEvent } = await import('@/lib/integrations/meta-capi');
    await sendMetaEvent({ eventName: 'PageView', userData: {} });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('hashea email en SHA-256 antes de enviar', async () => {
    const { sendMetaEvent } = await import('@/lib/integrations/meta-capi');
    await sendMetaEvent({
      eventName: 'Purchase',
      userData: { email: 'TEST@EXAMPLE.COM' },
      customData: { value: 100, currency: 'USD' },
    });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0]!;
    const body = JSON.parse((init as { body: string }).body);
    const expected = crypto.createHash('sha256').update('test@example.com').digest('hex');
    expect(body.data[0].user_data.em).toEqual([expected]);
  });

  it('usa event_id provisto para deduplicación con pixel', async () => {
    const { sendMetaEvent } = await import('@/lib/integrations/meta-capi');
    await sendMetaEvent({
      eventName: 'Purchase',
      eventId: 'order-uuid-1',
      userData: {},
    });
    const [, init] = fetchMock.mock.calls[0]!;
    const body = JSON.parse((init as { body: string }).body);
    expect(body.data[0].event_id).toBe('order-uuid-1');
  });
});
