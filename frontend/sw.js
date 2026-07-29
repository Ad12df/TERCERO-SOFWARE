const CACHE = "bibliotech-v1";
self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      try {
        const net = await fetch(e.request);
        cache.put(e.request, net.clone());
        return net;
      } catch {
        return cache.match(e.request);
      }
    })
  );
});