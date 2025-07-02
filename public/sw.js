/**
 * SERVICE WORKER PARA CACHE E SEGURANÇA EM PRODUÇÃO
 */

const CACHE_NAME = 'letra-arena-v1';
const STATIC_CACHE = 'static-v1';

// Recursos críticos para cache
const STATIC_RESOURCES = [
  '/',
  '/src/main.tsx',
  '/src/index.css',
  '/src/App.tsx'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_RESOURCES))
      .then(() => self.skipWaiting())
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Apenas cachear recursos próprios
  if (url.origin !== location.origin) {
    return;
  }

  // Estratégia Network First para API calls
  if (url.pathname.includes('/api/') || url.pathname.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cachear apenas responses válidos
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Fallback para cache se network falhar
          return caches.match(request);
        })
    );
    return;
  }

  // Estratégia Cache First para recursos estáticos
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(request)
          .then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE)
                .then((cache) => cache.put(request, responseClone));
            }
            return response;
          });
      })
  );
});