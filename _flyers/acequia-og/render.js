const path = require('path');

function loadPlaywright() {
  try { return require('playwright'); } catch (e) {}
  const p = path.join(process.cwd(), 'node_modules/.pnpm/playwright@1.60.0/node_modules/playwright');
  return require(p);
}

// OG card de acequia: 1200×630 exacto (lo que piden OpenGraph y Twitter cards).
// Se renderiza sólo a deviceScaleFactor 1: las previews sociales recortan a ese
// tamaño y un master 2× sólo engordaría el bundle público.
(async () => {
  const dir  = process.cwd();
  const base = '_flyers/acequia-og';
  const { chromium } = loadPlaywright();
  const fileUrl = 'file:///' + encodeURI(path.join(dir, base, 'og.html').replace(/\\/g, '/'));
  console.log('url', fileUrl);

  // El Chromium propio de Playwright no siempre está: la caché de
  // ms-playwright se borra con cualquier limpieza de disco. Antes de mandar a
  // bajar 150 MB, probamos el Chrome que ya está instalado en la máquina.
  const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }));
  const ctx  = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(fileUrl, { waitUntil: 'networkidle', timeout: 60000 });
  try { await page.evaluate(() => document.fonts.ready); } catch (e) {}
  await page.waitForTimeout(600);
  const out = path.join(dir, base, 'og.png');
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  console.log('wrote', out);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
