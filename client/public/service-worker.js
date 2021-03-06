console.log("Hello from your service worker!");

const FILES_TO_CACHE = [
   '/',
    '/index.html',

    "./../src/App.js",
    "./../src/App.css",

    "./../src/Components/Contact/index.jsx",
    "./../src/Components/Contact/index.css",
    "./../src/Components/Contact/form/form.jsx",

    "./../src/Components/Footer/index.jsx",

    "./../src/Components/Home/index.jsx",
    "./../src/Components/Home/index.css",
    "./../src/Components/Home/slider/index.jsx",
    "./../src/Components/Home/slider/index.css",

    "./../src/Components/LogIn/index.jsx",

    "./../src/Components/LogOut/index.jsx",

    "./../src/Components/Products/index.jsx",
    "./../src/Components/Products/index.css",
    "./../src/Components/Products/ListProducts.jsx",

    "./../src/Components/reviews/reviews.jsx",
    "./../src/Components/reviews/reviews.css",

    "./../src/Components/SignUp/index.jsx",
    "./../src/Components/SignUp/signup.css"
];

const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';

self.addEventListener('install', function(evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then (cache => {
            console.log('Your files were pre-cached successfully!');
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

self.addEventListener("activate", function(evt) {
    evt.waitUntil(
      // grab all cache and returns all the keys for the cache (not the values) 
      caches.keys().then(keyList => {
        return Promise.all(
          // map thru the keys and if theses keys are different, then delete the old cache in order to free up space
          keyList.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
  
    self.clients.claim();
  });

  self.addEventListener("fetch", function(evt) {
    if (evt.request.url.includes("/api/")) {
      evt.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(evt.request)
            .then(response => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
  
              return response;
            })
            .catch(err => {
              // Network request failed, try to get it from the cache.
                return cache.match(evt.request);
              
            });
        }).catch(err => {
          console.log(err)
        })
      );
  
      return;
    }
  
    evt.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(evt.request).then(response => {
          return response || fetch(evt.request);
        });
      })
    );
  });