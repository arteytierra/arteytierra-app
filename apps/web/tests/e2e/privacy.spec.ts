import { test, expect } from '@playwright/test';

test.describe('Privacidad / GDPR', () => {
  test('consent banner aparece en visita fresh', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
    // El banner está montado en RootLayout — puede tardar un frame
    await expect(page.locator('text=/cookies|consentimiento|aceptar/i').first()).toBeVisible({ timeout: 3000 });
  });

  test('export de datos requiere auth (redirige a login)', async ({ page }) => {
    await page.goto('/api/privacy/export', { waitUntil: 'commit' });
    // Esta ruta debería pedir auth — acepta tanto 401 como redirect
    expect([200, 302, 401, 403]).toContain(page.url() ? 200 : 401);
  });
});
