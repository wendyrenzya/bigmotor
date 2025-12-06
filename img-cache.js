// img-cache.js (FINAL)
// Fungsinya hanya untuk mendaftarkan service worker.
// Semua caching gambar dilakukan oleh sw-images.js.

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw-images.js')
    .catch(console.error);
}

// Penting:
// - Jangan menyimpan gambar ke IndexedDB (tidak kompatibel untuk opaque responses).
// - Jangan melakukan fetch dengan mode 'no-cors' untuk mendapatkan blob.
// - Cache API sudah cukup untuk caching gambar sesuai URL (immutable URLs).