"use client";

import { useEffect } from 'react';

export function PWAListener() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((err) => {
          console.error('Service Worker registration failed:', err);
        });

      window.addEventListener('online', () => {
        console.log('Network online. Triggering sync.');
        navigator.serviceWorker.ready.then((registration: ServiceWorkerRegistration) => {
          const regWithSync = registration as unknown as { sync?: { register: (tag: string) => Promise<void> } };
          if (regWithSync.sync) {
            regWithSync.sync.register('sync-updates').catch((err: unknown) => console.log('Sync registration failed', err));
          }
        });
      });
    }
  }, []);

  return null;
}
