// Background Audio Service for breathing exercises
class BackgroundAudioService {
  constructor() {
    this.serviceWorker = null;
    this.audioContext = null;
    this.muted = false;
    this.isInitialized = false;
    this.wakeLock = null;
    this.currentUtterance = null;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Register service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        this.serviceWorker = registration;
        console.log('Service Worker registered successfully');
      }

      // Initialize Web Audio API
      if ('AudioContext' in window || 'webkitAudioContext' in window) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContextClass();
      }

      // Request persistent notification permission for background audio
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      // Keep screen wake lock during breathing exercise
      if ('wakeLock' in navigator) {
        try {
          this.wakeLock = await navigator.wakeLock.request('screen');
          console.log('Screen wake lock acquired');
        } catch (err) {
          console.log('Wake lock request failed:', err);
        }
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize background audio service:', error);
    }
  }

  async speak(text, duration = 4000) {
    if (this.muted || !text) return;

    await this.initialize();

    try {
      // Ensure audio context is running
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Use service worker for background speech if available
      if (this.serviceWorker && this.serviceWorker.active) {
        this.serviceWorker.active.postMessage({
          type: 'BREATHING_AUDIO',
          action: 'speak',
          text: text,
          duration: duration
        });
      } else {
        // Fallback to regular speech synthesis
        await this.fallbackSpeak(text);
      }

      // Show notification for background guidance
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Breathing Guide', {
          body: text,
          icon: '/favicon.ico',
          tag: 'breathing-guide',
          silent: true,
          requireInteraction: false
        });
      }

    } catch (error) {
      console.error('Speech synthesis failed:', error);
      // Try fallback method
      await this.fallbackSpeak(text);
    }
  }

  async fallbackSpeak(text) {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Get voices
      const voices = window.speechSynthesis.getVoices();
      const usVoice = voices.find(voice => voice.lang === 'en-US' && voice.localService);
      
      if (usVoice) {
        utterance.voice = usVoice;
      } else {
        const fallbackVoice = voices.find(voice => voice.lang === 'en-US');
        if (fallbackVoice) {
          utterance.voice = fallbackVoice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    });
  }

  stop() {
    // Stop service worker audio
    if (this.serviceWorker && this.serviceWorker.active) {
      this.serviceWorker.active.postMessage({
        type: 'BREATHING_AUDIO',
        action: 'stop'
      });
    }

    // Stop regular speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Clear current utterance
    this.currentUtterance = null;

    // Release wake lock
    if (this.wakeLock) {
      this.wakeLock.release();
      this.wakeLock = null;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stop();
    }
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  // Request permissions needed for background audio
  async requestPermissions() {
    const permissions = [];

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      permissions.push(Notification.requestPermission());
    }

    // Request persistent notification permission (if available)
    if ('permissions' in navigator) {
      try {
        permissions.push(navigator.permissions.query({ name: 'persistent-notification' }));
      } catch (e) {
        // Permission not available
      }
    }

    await Promise.all(permissions);
  }
}

// Create singleton instance
const backgroundAudioService = new BackgroundAudioService();

export default backgroundAudioService;
