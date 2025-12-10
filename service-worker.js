const CACHE_NAME = "bigmotor-cache-v17";

const ASSETS = [
  "/", 
  "/index.html",
  "/home.html",
  
  // semua file html penting
  "/absen.html",
  "/add_item.html",
  "/app.js",
  "/img-cache.js",
  "/sw-images.js",
  "/audit.html",
  "/barang.html",
  "/barang_detail.html",
  "/barang_edit.html",
  "/bonus.html",
  "/buat_katalog.html",
  "/harga.html",
  "/invoice.html",
  "/katalog.html",
  "/laporan.html",
  "/laporan_harian.html",
  "/list_katalog.html",
  "/navigationGuard.js",
  "/pengaturan.html",
  "/pengeluaran.html",
  "/penjualan.html",
  "/riwayat.html",
  "/servis.html",
  "/servis_detail.html",
  "/stok_masuk.html",
  "/stok_kosong.html",
  "/struk.html",
  "/tambah_barang.html",
  "/tambah_servis.html",
  "/user.html",

  // asset
  "/assets/logo.png",
  "/assets/icon-192.png",
  "/assets/icon-512.png"
];

self.addEventListener("install", e=>{
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache=>{
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener("fetch", e=>{
  e.respondWith(
    caches.match(e.request).then(resp=>{
      return resp || fetch(e.request);
    })
  );
});
