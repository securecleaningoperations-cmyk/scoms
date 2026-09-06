const CACHE_NAME = 'scoms-offline-cache-v1';
const DB_NAME = 'scoms_sync_db';
const STORE_NAME = 'sync_queue';

// IndexedDB setup for offline requests
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveToSyncQueue(requestData) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.add(requestData);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject();
  });
}

async function getSyncQueue() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject();
  });
}

async function clearSyncQueueItem(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject();
  });
}

// Service Worker events
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/offline.html',
        // In a real app, add critical CSS/JS chunks here
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  
  // Only intercept API calls for mutation (POST, PUT, DELETE, PATCH)
  if (req.url.includes('/rest/v1/') && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    event.respondWith(
      fetch(req.clone()).catch(async (error) => {
        // If offline, save to IndexedDB
        console.warn('Network offline. Queuing request for background sync.');
        const clonedReq = req.clone();
        
        let bodyText = null;
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          bodyText = await clonedReq.text();
        }

        const headers = {};
        for (const [key, value] of req.headers.entries()) {
          headers[key] = value;
        }

        await saveToSyncQueue({
          url: req.url,
          method: req.method,
          headers: headers,
          body: bodyText,
          timestamp: new Date().toISOString()
        });

        return new Response(JSON.stringify({ offline: true, message: 'Saved to offline sync queue.' }), {
          status: 202,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Standard cache-first strategy for GET requests (specifically for static assets)
  event.respondWith(
    fetch(req).catch(() => caches.match(req).then((res) => res || caches.match('/offline.html')))
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-updates') {
    event.waitUntil(
      (async () => {
        const queue = await getSyncQueue();
        for (const item of queue) {
          try {
            const reqOptions = {
              method: item.method,
              headers: item.headers,
              body: item.body
            };
            const response = await fetch(item.url, reqOptions);
            if (response.ok) {
              await clearSyncQueueItem(item.id);
              console.log('Successfully synced background task:', item.id);
            }
          } catch (err) {
            console.error('Background sync failed for item:', item.id, err);
          }
        }
      })()
    );
  }
});
