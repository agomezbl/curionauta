/* Curionaut · Estación: funciona sin conexión. Guarda la app y la librería de Supabase;
   los datos van siempre por la red. La versión la cambia tools/montar.sh en cada publicación. */
const V = 'curionauta-estacion-__V__';
const SHELL = ['./', 'index.html', 'estacion.css', 'app.js', 'mentores.js', 'economia.js', 'arte.js', 'config.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.112.4/dist/umd/supabase.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('curionauta-estacion-') && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.hostname.endsWith('supabase.co')) return;           // datos: siempre a la red
  if (u.origin === location.origin && !u.pathname.startsWith(new URL('./', location).pathname)) return;   // los juegos tienen su propio sw
  if (u.origin === location.origin) {
    // la app: primero la red (para recibir mejoras); si no hay, la copia guardada
    e.respondWith(fetch(e.request).then(r => { if (r.ok) { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); } return r; }).catch(() => caches.match(e.request, { ignoreSearch: true })));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
