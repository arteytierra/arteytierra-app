/* Service worker de Terreno — Arte y Tierra.
 * Estrategia:
 *  - Tiles de mapa (Esri/ArcGIS) y elevación (/api/terrarium): cache-first con
 *    tope de entradas → permite seguir viendo zonas ya visitadas sin señal.
 *  - Navegación (documentos HTML): network-first con fallback a caché.
 *  - Resto (estáticos same-origin): stale-while-revalidate.
 * No cachea las llamadas a Supabase ni otras APIs de datos.
 */
const VERSION    = 'terreno-sw-v1';
const TILE_CACHE = 'terreno-tiles-v1';
const APP_CACHE  = 'terreno-app-v1';
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

  // Estáticos same-origin → stale-while-revalidate
  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(APP_CACHE);
      const hit = await cache.match(req);
      const fetchPromise = fetch(req).then(res => {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(() => hit || Response.error());
      return hit || fetchPromise;
    })());
  }
});
