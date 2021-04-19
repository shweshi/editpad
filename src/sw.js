var cacheName = 'editpad';
var filesToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/main.js'
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function (evt) {
    evt.waitUntil(
        caches.open(cacheName)
            .then(function (cache) {
                return cache.addAll(filesToCache);
            })
    );
});

/* Serve cached content when offline */
self.addEventListener('fetch', function (evt) {
    evt.respondWith(fromCache(evt.request));

    evt.waitUntil(update(evt.request).then(refresh))
});

function fromCache(request) {
    return caches.open(cacheName)
        .then(function (cache) {
            return cache.match(request);
        })
}

function update(request) {
    return caches.open(cacheName).then(function (cache) {
        return fetch(request).then(function (response) {
            return cache.put(request, response.clone()).then(function () {
                return response;
            });
        });
    });
}

function refresh(response) {
    return self.clients.matchAll().then(function (clients) {
        clients.forEach(function (client) {
            var message = {
                type: 'refresh',
                url: response.url,
                eTag: response.headers.get('ETag')
            };
            client.postMessage(JSON.stringify(message));
        });
    });
}