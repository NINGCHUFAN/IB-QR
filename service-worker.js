// ===============================
// IB-QRko-do v5 Service Worker
// 离线缓存 + 自动更新
// ===============================

const CACHE_NAME = "ibqr-v5-cache-001";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// ------------------------------
// Install（缓存最新资源）
// ------------------------------
self.addEventListener("install", event => {
  self.skipWaiting(); // 强制立即激活新版 SW

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

// ------------------------------
// Activate（删除旧缓存 + 立即接管）
// ------------------------------
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // 删除旧版本缓存
          }
        })
      )
    )
  );

  return self.clients.claim(); // 新版本立即生效
});

// ------------------------------
// Fetch（离线优先策略）
// ------------------------------
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // 离线时读取缓存
      return (
        response ||
        fetch(event.request).catch(() => {
          // 特殊情况：没网并访问根路径时
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        })
      );
    })
  );
});
