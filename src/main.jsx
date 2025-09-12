
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Ultra-aggressive PWA detection blocking
(function() {
  'use strict';
  
  // Block all PWA-related events
  const blockEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    console.log('PWA event blocked:', e.type);
    return false;
  };

  // Block install prompts
  window.addEventListener('beforeinstallprompt', blockEvent, true);
  window.addEventListener('appinstalled', blockEvent, true);
  
  // Block service worker events
  window.addEventListener('message', (e) => {
    if (e.data && e.data.type && e.data.type.includes('SW')) {
      blockEvent(e);
    }
  }, true);

  // Aggressively unregister all service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      registrations.forEach(registration => {
        registration.unregister().then(() => {
          console.log('Service Worker unregistered:', registration.scope);
        });
      });
    });
    
    // Block future service worker registrations
    navigator.serviceWorker.register = () => Promise.reject('Service worker registration blocked');
  }

  // Clear all caches aggressively
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName);
        console.log('Cache deleted:', cacheName);
      });
    });
  }

  // Override any manifest link attempts
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.tagName === 'LINK' && node.rel === 'manifest') {
          node.remove();
          console.log('Manifest link removed');
        }
      });
    });
  });
  
  observer.observe(document.head, { childList: true });

  // Clear any PWA-related localStorage
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.includes('pwa') || key.includes('install') || key.includes('manifest')) {
        localStorage.removeItem(key);
        console.log('PWA localStorage cleared:', key);
      }
    });
  } catch (e) {
    console.log('localStorage clearing failed:', e);
  }

  console.log('Ultra-aggressive PWA blocking enabled');
})();

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
