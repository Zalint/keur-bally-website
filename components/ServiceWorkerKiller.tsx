'use client';

import { useEffect } from 'react';

/**
 * Désinscrit tout service worker laissé par une ancienne version statique
 * de l'app (qui réécrivait les URLs en .html, cassant les routes Next.js).
 */
export default function ServiceWorkerKiller() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.getRegistrations().then((regs) => {
      if (regs.length === 0) return;
      Promise.all(regs.map((r) => r.unregister())).then(() => {
        // Vide aussi le cache HTTP du SW si possible
        if ('caches' in window) {
          caches.keys().then((names) => names.forEach((n) => caches.delete(n)));
        }
        console.info('[SW] anciens service workers désinscrits');
      });
    });
  }, []);
  return null;
}
