import { precacheAndRoute } from "workbox-precaching";

/* eslint-disable no-restricted-globals */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('my-cache').then((cache) => {
            return cache.addAll([
                '/',
            ]);
        }),
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        }),
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = ['my-cache']; // Update the cache name when you need to force an update

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                }),
            );
        }),
    );
});
precacheAndRoute(self.__WB_MANIFEST);