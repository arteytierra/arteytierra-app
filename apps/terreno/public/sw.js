/* Service worker de Terreno — Arte y Tierra.
 * Estrategia:
 *  - Tiles de mapa (Esri/ArcGIS) y elevación (/api/terrarium): cache-first con
 *    tope de entradas → permite seguir viendo zonas ya visitadas sin señal.
 *  - Navegación (documentos HTML): network-first con fallback a caché.
 *  - Estáticos de Next (/_next/static/): cache-first (llevan hash, son inmutables).
 *  - Resto de estáticos same-origin: stale-while-revalidate.
 *  - APIs de datos y payloads RSC: NUNCA se cachean (se servían rancios).
 *
 * IMPORTANTE — versionado: el caché de la app lleva el id del build, que llega
 * por query string al registrar (`/sw.js?v=<build>`). Antes el nombre era fijo
 * (`terreno-app-v1`), nunca se purgaba y el navegador seguía sirviendo el bundle
 * viejo después de cada deploy (no se veían las features nuevas).
 */
const BUILD = new URLSearchParams(self.location.search).get('v') || 'dev';

// Las teselas no cambian entre deploys: su caché sobrevive a propósito.
const TILE_CACHE = 'terreno-tiles-v1';
// El bundle sí cambia: caché nuevo por build, y el viejo se borra en `activate`.
const APP_CACHE  = `terreno-app-${BUILD}`;
const TILE_MAX   = 800;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(k => ![TILE_CACHE, APP_CACHE].includes(k) && k.startsWith('terreno-'))
      .map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

function esTile(url) {
  return /server\.arcgisonline\.com|arcgis|tile\.openstreetmap|basemaps|elevation-tiles/i.test(url.hostname)
    || url.pathname.startsWith('/api/terrarium');
}

async function podarCache(nombre, max) {
  const cache = await caches.open(nombre);
  const keys = await cache.keys();
  if (keys.length > max) {
    for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
  }
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch { return; }

  // Nunca interceptar datos de Supabase / auth
  if (/supabase|auth/i.test(url.hostname) || url.pathname.startsWith('/auth')) return;

  // Tiles → cache-first
  if (esTile(url)) {
    event.respondWith((async () => {
      const cache = await caches.open(TILE_CACHE);
      const hit = await cache.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res && res.ok) { cache.put(req, res.clone()); podarCache(TILE_CACHE, TILE_MAX); }
        return res;
      } catch {
        return hit || Response.error();
      }
    })());
    return;
  }

  // Navegación → network-first con fallback a caché
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        const cache = await caches.open(APP_CACHE);
        cache.put(req, res.clone());
        return res;
      } catch {
        const cache = await caches.open(APP_CACHE);
        return (await cache.match(req)) || (await cache.match('/mapa')) || Response.error();
      }
    })());
    return;
  }

  if (url.origin !== self.location.origin) return;

  // APIs de datos y payloads RSC del App Router: siempre de red.
  // Cachearlos hacía que la app siguiera mostrando contenido viejo tras un deploy.
  const esRSC = url.searchParams.has('_rsc') || req.headers.get('RSC') === '1';
  if (url.pathname.startsWith('/api/') || esRSC) return;

  // Estáticos de Next: llevan hash en el nombre → cache-first sin revalidar.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith((async () => {
      const cache = await caches.open(APP_CACHE);
      const hit = await cache.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    })());
    return;
  }

  // Resto de estáticos same-origin → stale-while-revalidate
  event.respondWith((async () => {
    const cache = await caches.open(APP_CACHE);
    const hit = await cache.match(req);
    const fetchPromise = fetch(req).then(res => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    }).catch(() => hit || Response.error());
    return hit || fetchPromise;
  })());
});
