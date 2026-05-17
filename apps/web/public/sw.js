/**
 * Service Worker · Arte y Tierra PWA
 *
 * Estrategias:
 *  - HTML (navegación):   network-first con fallback offline
 *  - Estáticos Next.js:   stale-while-revalidate (cache largo)
 *  - Imágenes:            cache-first con expiración
 *  - APIs/webhooks:       network-only (nunca cachear)
 *  - Pago/auth/admin:     network-only (nunca cachear)
 *
 * Web Push: muestra notificaciones con `data` payload.
 */

const VERSION = 'ay-v1';
const STATIC_CACHE = `${VERSION}-static`;
const PAGES_CACHE = `${VERSION}-pages`;
const IMG_CACHE = `${VERSION}-img`;

const OFFLINE_URL = '/offline';

const PRECACHE = ['/', OFFLINE_URL, '/manifest.webmanifest', '/icon-192.png'];

// ---------------- Install ----------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

// ---------------- Activate ----------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

// ---------------- Fetch ----------------
const NO_CACHE_PATHS = [
  '/api/',
  '/auth/',
  '/admin',
  '/checkout',
  '/carrito',
  '/orden/',
  '/mi-cuenta',
  '/mis-pedidos',
  '/mis-cursos',
  '/mis-reservas',
];

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Skip cross-origin
  if (url.origin !== location.origin) return;

  // Never cache: APIs, auth, admin, checkout
  if (NO_CACHE_PATHS.some((p) => url.pathname.startsWith(p))) return;

  // Imágenes (cache-first)
  if (req.destination === 'image') {
    event.respondWith(cacheFirst(req, IMG_CACHE, 40));
    return;
  }

  // Estáticos Next.js (_next/static, fonts, etc)
  if (url.pathname.startsWith('/_next/static') || req.destination === 'font') {
    event.respondWith(staleWhileRevalidate(req, STATIC_CACHE));
    return;
  }

  // Navegación HTML (network-first)
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(networkFirstPage(req));
    return;
  }

  // Resto: SWR conservador
  event.respondWith(staleWhileRevalidate(req, STATIC_CACHE));
});

async function networkFirstPage(req) {
  try {
    const res = await fetch(req);
    const cache = await caches.open(PAGES_CACHE);
    cache.put(req, res.clone());
    return res;
  } catch {
    const cache = await caches.open(PAGES_CACHE);
    const cached = await cache.match(req);
    if (cached) return cached;
    return (await caches.match(OFFLINE_URL)) ?? new Response('Offline', { status: 503 });
  }
}

async function cacheFirst(req, name, maxEntries) {
  const cache = await caches.open(name);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res.ok) {
      cache.put(req, res.clone());
      trimCache(name, maxEntries);
    }
    return res;
  } catch {
    return new Response('', { status: 504 });
  }
}

async function staleWhileRevalidate(req, name) {
  const cache = await caches.open(name);
  const cached = await cache.match(req);
  const fetched = fetch(req)
    .then((res) => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);
  return cached ?? (await fetched) ?? new Response('', { status: 504 });
}

async function trimCache(name, maxEntries) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    for (let i = 0; i < keys.length - maxEntries; i++) await cache.delete(keys[i]);
  }
}

// ---------------- Web Push ----------------
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Arte y Tierra', body: event.data.text() };
  }

  const title = payload.title ?? 'Arte y Tierra';
  const options = {
    body: payload.body ?? '',
    icon: payload.icon ?? '/icon-192.png',
    badge: '/icon-192.png',
    image: payload.image,
    tag: payload.tag,
    renotify: Boolean(payload.tag),
    data: { url: payload.url ?? '/' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    (async () => {
      const clientsArr = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const existing = clientsArr.find((c) => c.url.includes(target));
      if (existing) return existing.focus();
      return self.clients.openWindow(target);
    })(),
  );
});
