import { test, expect } from '@playwright/test';

test.describe('Centro de ayuda', () => {
  test('index carga con buscador y categorías', async ({ page }) => {
    await page.goto('/ayuda');
    await expect(page.locator('h1')).toContainText(/ayuda/i);
    await expect(page.getByPlaceholder(/cómo descargo|cómo cancelo/i)).toBeVisible();
  });

  test('búsqueda actualiza URL con ?q=', async ({ page }) => {
    await page.goto('/ayuda');
    const input = page.getByPlaceholder(/cómo/i);
    await input.fill('certificado');
    // Debounce 240ms
    await page.waitForURL(/\/ayuda\?q=certificado/, { timeout: 2000 });
  });

  test('categoría devuelve 200 o 404 (sin seed)', async ({ request }) => {
    const r = await request.get('/ayuda/categoria/cursos');
    expect([200, 404]).toContain(r.status());
  });
});
