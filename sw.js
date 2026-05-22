const CACHE = 'returning-shelves-v2';
const PRECACHE = [
  './',
  './index.html',
  './css/base.css',
  './css/header.css',
  './css/start.css',
  './css/book3d.css',
  './css/detail.css',
  './css/tabs.css',
  './css/books.css',
  './css/location.css',
  './css/connector.css',
  './js/main.js',
  './js/animation.js',
  './js/books.js',
  './js/constants.js',
  './js/dom.js',
  './js/render.js',
  './js/state.js',
  './js/tabs.js',
  './js/utils.js',
  './cover.png',
  './manifest.json',
  './fonts/KristallLLEdu-Regular.otf',
  './fonts/KristallLLEdu-Light.otf',
  './fonts/KristallLLEdu-Medium.otf',
  './fonts/KristallLLEdu-Bold.otf',
  './fonts/KristallLLEdu-Black.otf',
  './fonts/KristallLLEdu-Ultra.otf',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
