const base = self.registration.scope;
const shell = [
  "",
  "logo.png",
  "icon-192.png",
  "icon-512.png",
  "manifest.webmanifest",
].map((p) => new URL(p, base).href);
const CACHE = "ozgur-harita-shell-1.2";
self.addEventListener("install", (event) =>
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(shell))),
);
self.addEventListener("activate", (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("ozgur-harita-shell-") && k !== CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // Auth and database requests are never cached.
  if (event.request.method !== "GET" || url.origin !== self.location.origin)
    return;
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((r) => {
          if (r.ok) {const copy=r.clone(); caches.open(CACHE).then((c) => c.put(base, copy));}
          return r;
        })
        .catch(() => caches.match(base)),
    );
    return;
  }
  if (url.href.startsWith(base + "assets/") || shell.includes(url.href))
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request).then((r) => {
            if (r.ok) {const copy=r.clone(); caches.open(CACHE).then((c) => c.put(event.request, copy));}
            return r;
          }),
      ),
    );
});
