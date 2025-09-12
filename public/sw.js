// Service Worker for background audio processing
const CACHE_NAME = 'copecalm-v1';
const urlsToCache = [
  '/',
  '/src/main.jsx',
  '/src/App.jsx'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Handle background audio messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'BREATHING_AUDIO') {
    const { action, text, duration } = event.data;
    
    if (action === 'speak') {
      // Use service worker's speech synthesis for background audio
      handleBackgroundSpeech(text, duration);
    } else if (action === 'stop') {
      // Stop any ongoing speech
      if (self.speechSynthesis) {
        self.speechSynthesis.cancel();
      }
    }
  }
});

async function handleBackgroundSpeech(text, duration) {
  try {
    if ('speechSynthesis' in self) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Get available voices
      const voices = self.speechSynthesis.getVoices();
      const usVoice = voices.find(voice => voice.lang === 'en-US' && voice.localService);
      
      if (usVoice) {
        utterance.voice = usVoice;
      } else {
        const fallbackVoice = voices.find(voice => voice.lang === 'en-US');
        if (fallbackVoice) {
          utterance.voice = fallbackVoice;
        }
      }
      
      self.speechSynthesis.cancel(); // Cancel any ongoing speech
      self.speechSynthesis.speak(utterance);
    }
  } catch (error) {
    console.error('Background speech synthesis failed:', error);
  }
}
