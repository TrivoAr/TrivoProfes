// Service Worker para cache offline
const CACHE_NAME = 'trivo-admin-v1';
const STATIC_CACHE = 'trivo-static-v1';
const API_CACHE = 'trivo-api-v1';
const IMAGE_CACHE = 'trivo-images-v1';

// Recursos estáticos para cachear
const STATIC_RESOURCES = [
  '/',
  '/dashboard',
  '/members',
  '/outings',
  '/teams',
  '/academies',
];

// Instalar el Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static resources');
      return cache.addAll(STATIC_RESOURCES.map(url => new Request(url, {credentials: 'same-origin'})));
    }).catch(err => {
      console.log('[SW] Error caching static resources:', err);
    })
  );
  self.skipWaiting();
});

// Activar el Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (![CACHE_NAME, STATIC_CACHE, API_CACHE, IMAGE_CACHE].includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Estrategia de cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo cachear requests GET
  if (request.method !== 'GET') {
    return;
  }

  // Estrategia para imágenes: Cache First
  if (request.destination === 'image' || url.pathname.includes('/_next/image')) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            return response;
          }
          return fetch(request).then((networkResponse) => {
            // Cachear la respuesta para futuras solicitudes
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Retornar placeholder si está offline
            return new Response('', { status: 404, statusText: 'Image not found offline' });
          });
        });
      })
    );
    return;
  }

  // Estrategia para API: Network First, fallback a Cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) => {
        return fetch(request)
          .then((networkResponse) => {
            // Solo cachear respuestas exitosas
            if (networkResponse.ok) {
              // No cachear mutaciones
              if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
                cache.put(request, networkResponse.clone());
              }
            }
            return networkResponse;
          })
          .catch(() => {
            // Si falla la red, intentar con cache
            return cache.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              return new Response(
                JSON.stringify({ error: 'Offline', cached: false }),
                {
                  status: 503,
                  headers: { 'Content-Type': 'application/json' },
                }
              );
            });
          });
      })
    );
    return;
  }

  // Estrategia para archivos estáticos Next.js: Cache First
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            return response;
          }
          return fetch(request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Estrategia para páginas: Network First, fallback a Cache
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        });
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Página offline genérica
          return caches.match('/').then((fallbackResponse) => {
            return fallbackResponse || new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable',
            });
          });
        });
      })
  );
});

// Background sync para requests fallidas
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Aquí puedes implementar lógica para sincronizar datos cuando vuelva la conexión
  console.log('[SW] Syncing data...');
}
