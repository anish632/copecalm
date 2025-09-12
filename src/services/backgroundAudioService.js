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
      // Ensure audio context is running (important for mobile)
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Check if we're on mobile - prioritize direct speech synthesis for mobile compatibility
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // For mobile, use direct speech synthesis for better compatibility
        await this.fallbackSpeak(text);
      } else {
        // For desktop, try service worker first, then fallback
        if (this.serviceWorker && this.serviceWorker.active) {
          this.serviceWorker.active.postMessage({
            type: 'BREATHING_AUDIO',
            action: 'speak',
            text: text,
            duration: duration
          });
        } else {
          await this.fallbackSpeak(text);
        }
      }

      // Show notification for background guidance (only on desktop to avoid mobile issues)
      if (!isMobile && 'Notification' in window && Notification.permission === 'granted') {
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
      // Always try direct fallback method
      await this.fallbackSpeak(text);
    }
  }

  async fallbackSpeak(text) {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        console.log('Speech synthesis not supported');
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

      // Mobile-specific adjustments
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        // Slower rate for mobile for better clarity
        utterance.rate = 0.9;
        // Force local voice on mobile for better reliability
        utterance.localService = true;
      }

      // Function to set voice when available
      const setVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
          // If no voices loaded yet, try again shortly
          setTimeout(setVoice, 100);
          return;
        }

        // Prefer local voices for mobile reliability
        let selectedVoice = null;
        if (isMobile) {
          selectedVoice = voices.find(voice => 
            voice.lang.startsWith('en') && voice.localService
          );
        }
        
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => voice.lang === 'en-US' && voice.localService);
        }
        
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => voice.lang === 'en-US');
        }
        
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log('Selected voice:', selectedVoice.name, 'Local:', selectedVoice.localService);
        }

        // Speak the utterance
        this.currentUtterance = utterance;
        try {
          window.speechSynthesis.speak(utterance);
        } catch (error) {
          console.error('Speech synthesis error:', error);
          resolve();
        }
      };

      utterance.onstart = () => {
        console.log('Speech started:', text);
      };
      
      utterance.onend = () => {
        console.log('Speech ended:', text);
        resolve();
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        resolve();
      };

      // Set voice and speak
      setVoice();
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
