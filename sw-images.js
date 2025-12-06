// sw-images.js (FINAL, sesuai rules dan logika kamu)
const IMG_CACHE = 'img-cache-v1';
const MAX_ENTRIES = 500;

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => self.clients.claim());

// Trim cache agar tidak terlalu banyak gambar
async function trimCache() {
  const cache = await caches.open(IMG_CACHE);
  const keys = await cache.keys();
  const extra = keys.length - MAX_ENTRIES;
  if (extra > 0) {
    for (let i = 0; i < extra; i++) {
      await cache.delete(keys[i]);
    }
  }
}

// Intercept semua fetch gambar
self.addEventListener('fetch', event => {
  const req = event.request;

  // Hanya proses GET image
  if (req.method === 'GET' &&
      (req.destination === 'image' ||
       /\.(png|jpe?g|webp|gif|svg)$/i.test(req.url))) {

    event.respondWith((async () => {
      const cache = await caches.open(IMG_CACHE);

      // 1. Jika sudah ada di cache → langsung ambil
      const cached = await cache.match(req);
      if (cached) return cached;

      // 2. Jika belum ada → fetch dari internet → simpan → tampilkan
      try {
        const resp = await fetch(req);   // tidak pakai no-cors
        try { cache.put(req, resp.clone()); } catch(e){}
        trimCache();
        return resp;
      } catch(e){
        return cached || Response.error();
      }
    })());

    return; // jangan lanjut proses untuk gambar
  }

  // Untuk bukan gambar → network-first
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});