/* Daily - offline app shell.
   Bump CACHE whenever this file changes to force installed devices onto it. */
const CACHE = "daily-v2";
const PAGE = "./index.html";
const SHELL = [
  "./", PAGE, "./manifest.webmanifest",
  "./apple-touch-icon.png", "./icon-192.png", "./icon-512.png", "./icon-512-maskable.png"
];
const NET_TIMEOUT = 2500;

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      /* allSettled: one missing file must not block the whole install */
      .then(c => Promise.allSettled(SHELL.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const put = (key, res) => {
  if (!res || !res.ok || res.type !== "basic") return res;
  const copy = res.clone();
  caches.open(CACHE).then(c => c.put(key, copy));
  return res;
};
const fromCache = key => caches.open(CACHE).then(c => c.match(key, { ignoreSearch: true }));

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== self.location.origin) return;

  /* The page itself: network first, so a published update is live immediately.
     Falls back to cache the moment the network fails or stalls. */
  if (req.mode === "navigate") {
    const net = fetch(req).then(res => put(PAGE, res)).catch(() => null);
    e.waitUntil(net);
    e.respondWith(
      Promise.race([
        net,
        new Promise(r => setTimeout(() => r(null), NET_TIMEOUT))
      ])
        .then(res => res || fromCache(PAGE))
        .then(res => res || fetch(req))
    );
    return;
  }

  /* Icons and manifest: cache first, refreshed in the background.
     waitUntil keeps the worker alive long enough for the put to land. */
  const fresh = fetch(req).then(res => put(req, res)).catch(() => null);
  e.waitUntil(fresh);
  e.respondWith(
    fromCache(req).then(hit => hit || fresh).then(res => res || fetch(req))
  );
});
