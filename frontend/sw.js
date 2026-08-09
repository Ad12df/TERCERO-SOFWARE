const CACHE = "bibliotech-v1";

// Dominios/rutas que NO deben cachearse: API en Render y peticiones POST/PUT/DELETE.
// El Service Worker solo cachea assets estáticos del propio frontend (GET same-origin).
const API_HOST = "tercero-sofware.onrender.com";

self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // 1) Peticiones a la API (Render): siempre a la red, sin caché.
  if (url.hostname === API_HOST || url.pathname.startsWith("/api/")) {
    e.respondWith(fetch(req));
    return;
  }

  // 2) Métodos de escritura (POST, PUT, PATCH, DELETE): siempre a la red.
  if (req.method !== "GET") {
    e.respondWith(fetch(req));
    return;
  }

  // 3) Resto de peticiones GET same-origin: estrategia network-first
  //    (actualiza la caché cuando hay conexión, sirve caché si offline).
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      try {
        const net = await fetch(req);
        cache.put(req, net.clone());
        return net;
      } catch {
        return cache.match(req);
      }
    })
  );
});