const CACHE_NAME = 'fer-roses-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/shop.html',
    '/about.html',
    '/contact.html',
    '/cart.html',
    '/wishlist.html',
    '/style.css',
    '/js/cart.js',
    '/js/wishlist.js',
    '/js/square-payment.js',
    '/Images/fwdlogoferflowers/ferflower-logo.png',
    'https://pro.fontawesome.com/releases/v5.10.0/css/all.css'
];

// Install Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
    );
});

// Activate Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
    );
});

// Fetch Strategy: Cache First, Network Fallback
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then(response => {
                        // Cache new resources
                        if (response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseClone);
                                });
                        }
                        return response;
                    });
            })
    );
});
