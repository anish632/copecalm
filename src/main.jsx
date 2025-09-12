
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Aggressively unregister service workers and clear cache to remove PWA detection
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister().then(() => {
        console.log('Service Worker unregistered:', registration.scope);
        // Clear cache after unregistration
        if ('caches' in window) {
          caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
              caches.delete(cacheName);
              console.log('Cache deleted:', cacheName);
            });
          });
        }
      });
    }
  });
}

// Prevent any PWA installation prompts
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  console.log('Install prompt prevented');
});

// Additional cache clearing on load
if ('caches' in window) {
  caches.keys().then(cacheNames => {
    cacheNames.forEach(cacheName => {
      if (cacheName.includes('copecalm') || cacheName.includes('cope-calm')) {
        caches.delete(cacheName);
        console.log('Copecalm cache deleted:', cacheName);
      }
    });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
