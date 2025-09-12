
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Register service worker only on mobile for background audio, with browser display mode to prevent install prompts
if ('serviceWorker' in navigator) {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    window.addEventListener('load', () => {
      const swPath = import.meta.env.BASE_URL + 'sw.js';
      navigator.serviceWorker.register(swPath, {
        scope: import.meta.env.BASE_URL
      })
      .then((registration) => {
        console.log('Service Worker registered successfully for mobile:', registration.scope);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
    });
  } else {
    // On desktop, unregister any existing service workers to prevent install prompts
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for(let registration of registrations) {
        registration.unregister();
        console.log('Service Worker unregistered on desktop:', registration.scope);
      }
    });
  }
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
