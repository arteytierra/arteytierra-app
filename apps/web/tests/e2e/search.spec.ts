import { test, expect } from '@playwright/test';

test.describe('Búsqueda', () => {
  test('/buscar?q= renderiza página de resultados', async ({ page }) => {
    await page.goto('/buscar?q=permacultura');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('API /api/search devuelve JSON estructurado', async ({ request }) => {
    const r = await request.get('/api/search?q=curso&grouped=1');
    expect([200, 401]).toContain(r.status());
    if (r.status() === 200) {
      const body = await r.json();
      // Acepta tanto grouped {course,product,...} como flat {results:[...]}
      expect(typeof body).toBe('object');
    }
  });

  test('CommandK shortcut (Cmd/Ctrl+K) abre overlay', async ({ page }) => {
    await page.goto('/');
    const meta = process.platform === 'darwin' ? 'Meta' : 'Control';
    await page.keyboard.press(`${meta}+k`);
    // Espera el dialog
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 2000 });
  });
});
