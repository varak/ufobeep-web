// UFOBeep v2.0 Service Worker
const CACHE_NAME = 'ufobeep-v2.0';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
  console.log('🛸 UFOBeep Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Caching app resources');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Service Worker installed successfully');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('🚀 UFOBeep Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          console.log('📦 Serving from cache:', event.request.url);
          return response;
        }
        
        // Fetch from network and cache the response
        return fetch(event.request).then(response => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response for caching
          const responseToCache = response.clone();
          
          // Cache API responses and assets
          if (event.request.url.includes('/sightings') || 
              event.request.url.includes('/upload') ||
              event.request.url.includes('leaflet') ||
              event.request.url.includes('fonts.googleapis.com')) {
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }

          return response;
        }).catch(() => {
          // Return offline fallback for main pages
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
      })
  );
});

// Push notification event
self.addEventListener('push', event => {
  console.log('🚨 Push notification received');
  
  let title = '🛸 UFOBeep Alert';
  let options = {
    body: 'New UFO activity detected nearby!',
    icon: 'data:image/svg+xml,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"%3e%3ccircle cx="96" cy="96" r="88" fill="%23000015" stroke="%2300ffcc" stroke-width="8"/%3e%3cellipse cx="96" cy="85" rx="70" ry="25" fill="%2300ffcc"/%3e%3cellipse cx="96" cy="80" rx="45" ry="15" fill="%23ffffff" opacity="0.8"/%3e%3ccircle cx="96" cy="75" r="8" fill="%23000015"/%3e%3ccircle cx="76" cy="110" r="4" fill="%2300ffcc"/%3e%3ccircle cx="96" cy="115" r="4" fill="%2300ffcc"/%3e%3ccircle cx="116" cy="110" r="4" fill="%2300ffcc"/%3e%3c/svg%3e',
    badge: 'data:image/svg+xml,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"%3e%3ccircle cx="48" cy="48" r="40" fill="%2300ffcc"/%3e%3ctext x="48" y="60" font-size="32" text-anchor="middle"%3e🛸%3c/text%3e%3c/svg%3e',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'ufo-alert',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: '👁️ View Map',
        icon: 'data:image/svg+xml,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3e%3cpath fill="%2300ffcc" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/%3e%3c/svg%3e'
      },
      {
        action: 'dismiss',
        title: '✕ Dismiss',
        icon: 'data:image/svg+xml,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3e%3cpath fill="%23888" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/%3e%3c/svg%3e'
      }
    ]
  };

  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      title = data.title || title;
      options.body = data.body || options.body;
      options.data = data;
      console.log('📨 Push data:', data);
    } catch (e) {
      console.log('📝 Push data (text):', event.data.text());
      options.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('🔔 Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'view') {
    // Open app to map view
    event.waitUntil(
      clients.openWindow('./#map')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    console.log('❌ Notification dismissed');
  } else {
    // Default action - open app
    event.waitUntil(
      clients.matchAll().then(clientList => {
        if (clientList.length > 0) {
          // Focus existing window
          clientList[0].focus();
        } else {
          // Open new window
          clients.openWindow('./');
        }
      })
    );
  }
});

// Background sync for offline sighting uploads
self.addEventListener('sync', event => {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === 'upload-sighting') {
    event.waitUntil(
      // Handle offline sighting upload when back online
      handleOfflineUploads()
    );
  }
});

async function handleOfflineUploads() {
  console.log('📤 Processing offline uploads...');
  // This would handle any queued sighting uploads
  // Implementation would depend on IndexedDB storage
  return Promise.resolve();
}

// Listen for messages from the main app
self.addEventListener('message', event => {
  console.log('💬 Message from app:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🛸 UFOBeep Service Worker loaded');