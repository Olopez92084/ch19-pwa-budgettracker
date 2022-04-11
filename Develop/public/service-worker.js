const APP_PREFIX = "BudgetTracker-";
const VERSION = "version_01";
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
  "/index.html",
  "/js/index.js",
  "/js/idb.js",
  "/css/styles.css",
  "/icons/icon-72x72.png",
  "/icons/icon-96x96.png",
  "/icons/icon-128x128.png",
  "/icons/icon-144x144.png",
  "/icons/icon-152x152.png",
  "/icons/icon-192x192.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png",
  "/manifest.json",
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log("installing cache : " + CACHE_NAME);
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener("fetch", function (e) {
  console.log("fetch request : " + e.request.url);
  if (e.request.url.includes("/api/")) {
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return (
          fetch(e.request)
            .then((response) => {
              // if response worked
              if (response.status === 200) {
                cache.put(e.request.url, response.clone());
              }
              return response;
            })
            .catch((error) => {
              return cache.match(e.request);
            })
        );
      })
      .catch((error) => {
        console.error(error);
      });
  }

  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request).then((response) => {
        if (response) {
          return response;
        }
     
        else if (e.request.headers.get("accept").includes("text/html")) {
          // send cache result for home route
          return caches.match("/");
        } else {
          throw new Error("unable to fetch");
        }
      });
    })
  );
});