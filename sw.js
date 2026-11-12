// Offline-Speicher für die Spanisch-Vokabeln-App.
// Bei jeder neuen Version die Nummer erhöhen, damit die Geräte die Änderungen laden.
const CACHE = "spanisch-vokabeln-v16";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Zuerst aus dem Speicher antworten (funktioniert offline),
// im Hintergrund die neueste Version aus dem Internet holen.
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(event.request, { ignoreSearch: true }).then(cached => {
        const fresh = fetch(event.request)
          .then(response => {
            if (response && response.ok) cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || fresh;
      })
    )
  );
});
