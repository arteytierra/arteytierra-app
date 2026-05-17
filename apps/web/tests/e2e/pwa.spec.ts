import { test, expect } from '@playwright/test';

test.describe('PWA', () => {
  test('manifest.webmanifest válido', async ({ request }) => {
    const r = await request.get('/manifest.webmanifest');
    expect(r.ok()).toBe(true);
    const m = await r.json();
    expect(m.name).toMatch(/Arte y Tierra/);
    expect(m.start_url).toBeDefined();
    expect(Array.isArray(m.icons)).toBe(true);
    expect(m.icons.length).toBeGreaterThanOrEqual(2);
    expect(m.display).toBe('standalone');
  });

  test('service worker accesible', async ({ request }) => {
    const r = await request.get('/sw.js');
    expect(r.ok()).toBe(true);
    expect(r.headers()['content-type']).toMatch(/javascript/);
    const body = await r.text();
    expect(body).toContain('addEventListener');
    expect(body).toContain('push');
  });

  test('página offline existe', async ({ page }) => {
    await page.goto('/offline');
    await expect(page.locator('h1')).toContainText(/offline|sin conexión/i);
  });
});
