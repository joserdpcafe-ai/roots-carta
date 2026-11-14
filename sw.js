/* Service worker de la carta. Lo genera armar_pwa.py: no se edita a mano. */
const VERSION = "20261111-4afcee51";
const CACHE = 'carta-' + VERSION;
const ARCHIVOS = [
  "./",
  ".nojekyll",
  "fonts/figtree-latin-italic.woff2",
  "fonts/figtree-latin-normal.woff2",
  "fonts/gloock-latin-400-normal.woff2",
  "icons/apple-touch-180.png",
  "icons/favicon-32.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "img/cafetales-caficultor.webp",
  "img/cheesecake-arandanos-m.webp",
  "img/cheesecake-frutos-amarillos-m.webp",
  "img/cheesecake-pistacho-m.webp",
  "img/coldbrew-botella-gente.webp",
  "img/coldbrew-mano.webp",
  "img/crema-de-mani-m.webp",
  "img/eventos-bar.webp",
  "img/eventos-montaditos-noche.webp",
  "img/eventos-sandwiches-noche.webp",
  "img/frappe-cafe.webp",
  "img/hongo-chaga.webp",
  "img/infusion-vaso.webp",
  "img/lago.webp",
  "img/logo-roots.webp",
  "img/melena-de-leon.webp",
  "img/mini-hamburguesa.webp",
  "img/pez-arapaima-marfil.webp",
  "img/pez-arapaima-oro-sm.webp",
  "img/portada-nevado.webp",
  "img/soda-michelada-flor.webp",
  "img/soplete-plato-v2.webp",
  "img/taza.webp",
  "img/terraza-noche.webp",
  "img/torta-almojabana-m.webp",
  "img/torta-banano-m.webp",
  "img/torta-chocopassion-m.webp",
  "img/torta-tiramisu-m.webp",
  "index.html",
  "manifest.webmanifest"
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ARCHIVOS.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k.startsWith('carta-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// La pagina pide primero la red (para no mostrar un precio viejo) y, si no hay
// señal en 4 segundos, abre la ultima copia guardada. Imagenes y fuentes salen
// de la copia guardada, que se renueva con cada version.
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  if (new URL(r.url).origin !== self.location.origin) return;
  if (r.mode === 'navigate') { e.respondWith(redPrimero(r)); return; }
  e.respondWith(caches.match(r, { ignoreSearch: true }).then((c) => c || fetch(r)));
});

function redPrimero(r) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 4000);
  return fetch(r, { signal: ctrl.signal })
    .then((res) => {
      clearTimeout(t);
      if (res.ok) { const copia = res.clone(); caches.open(CACHE).then((c) => c.put('./', copia)); }
      return res;
    })
    .catch(() => caches.match('./').then((c) => c || caches.match('index.html')));
}
