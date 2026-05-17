import { test, expect } from '@playwright/test';

test.describe('Smoke · navegación pública', () => {
  test('home carga con título y CTA principal', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Arte y Tierra/i);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('catálogo de cursos lista productos', async ({ page }) => {
    await page.goto('/cursos');
    await expect(page.locator('h1')).toContainText(/curso/i);
  });

  test('blog lista posts publicados', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('h1')).toContainText(/diario|blog/i);
  });

  test('JSON-LD Organization presente en home', async ({ page }) => {
    await page.goto('/');
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const hasOrg = scripts.some((s) => s.includes('"@type"') && s.includes('Organization'));
    expect(hasOrg).toBe(true);
  });

  test('robots.txt disponible y bloquea /admin', async ({ request }) => {
    const r = await request.get('/robots.txt');
    expect(r.ok()).toBe(true);
    const text = await r.text();
    expect(text).toMatch(/Disallow:\s*\/admin/i);
  });

  test('sitemap.xml retorna XML válido', async ({ request }) => {
    const r = await request.get('/sitemap.xml');
    expect(r.ok()).toBe(true);
    const text = await r.text();
    expect(text).toContain('<urlset');
  });

  test('health endpoint OK o 503 con shape esperado', async ({ request }) => {
    const r = await request.get('/api/health');
    expect([200, 503]).toContain(r.status());
    const body = await r.json();
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('checks');
  });

  test('OG image se genera con título', async ({ request }) => {
    const r = await request.get('/og?title=Test&kind=course');
    expect(r.ok()).toBe(true);
    expect(r.headers()['content-type']).toContain('image');
  });
});

test.describe('Rutas privadas redirigen a /auth/login', () => {
  for (const path of ['/mi-cuenta', '/mis-cursos', '/mis-reservas', '/admin']) {
    test(`${path} → /auth/login`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'commit' });
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  }
});
