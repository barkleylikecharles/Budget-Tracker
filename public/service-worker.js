const APP_PREFIX = 'Budget-Tracker';     
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;
const DATA_CACHING = APP_PREFIX + "-data"

const FILES_TO_CACHE = [
    "/",
    "./index.html",
    "./css/styles.css",
    "./js/idb.js",
    "./js/index.js",
    "./icons/icon-72x72.png",
    "./icons/icon-96x96.png",
    "./icons/icon-128x128.png",
    "./icons/icon-152x152.png",
    "./icons/icon-192x192.png",
    "./icons/icon-384x384.png",
    "./icons/icon-512x512.png"

  ];



self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
          console.log('installing cache : ' + CACHE_NAME)
          return cache.addAll(FILES_TO_CACHE)
        })
      )

});

self.addEventListener('activate', function(e) {
    e.waitUntil(
      caches.keys().then(function(keyList) {
        let cacheKeeplist = keyList.filter(function(key) {
          return key.indexOf(APP_PREFIX);
        });
        cacheKeeplist.push(CACHE_NAME);
  
        return Promise.all(
          keyList.map(function(key, i) {
            if (cacheKeeplist.indexOf(key) === -1) {
              console.log('deleting cache : ' + keyList[i]);
              return caches.delete(keyList[i]);
            }
          })
        );
      })
    );
  });
//Checks whether its possible to get online
  self.addEventListener('fetch', function (e) {
    console.log('fetch request : ' + e.request.url)
    if (e.request.url.includes("/api")) {
        e.respondWith(caches.match(e.request).then(function(response) {
            // caches.match() always resolves
            // but in case of success response will have value
            if (response !== undefined) {
              return response;
            } else {
              return fetch(e.request).then(function (response) {
                // response may be used only once
                // we need to save clone to put one copy in cache
                // and serve second one
                let responseClone = response.clone();
        
                caches.open(DATA_CACHING).then(function (cache) {
                  cache.put(e.request, responseClone);
                });
                return response;
              });
            }
          })); 
    }
else {
 e.respondWith(
      caches.match(e.request).then(function (request) {
        if (request) { // if cache is available, respond with cache
          console.log('responding with cache : ' + e.request.url)
          return request
        } else {       // if there are no cache, try fetching request
          console.log('file is not cached, fetching : ' + e.request.url)
          return fetch(e.request)
        }
  
        // You can omit if/else for console.log & put one line below like this too.
        // return request || fetch(e.request)
      })
    )
    }
  })