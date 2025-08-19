let muted = false;
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let voices: SpeechSynthesisVoice[] = [];

// A promise that resolves when voices are loaded.
const voicesPromise = new Promise<void>((resolve, reject) => {
    if (!synth) {
        reject("Speech synthesis not supported.");
        return;
    }

    const loadAndResolve = () => {
        voices = synth.getVoices();
        if (voices.length > 0) {
            resolve();
            return true;
        }
        return false;
    }

    // Try to load voices immediately. If it works, resolve the promise.
    if (loadAndResolve()) {
        return;
    }

    // If voices are not available yet, wait for the onvoiceschanged event.
    // This is the standard way to handle asynchronous voice loading.
    synth.onvoiceschanged = () => {
        loadAndResolve();
    };
});


export const speak = async (text: string) => {
    if (muted || !synth || !text) {
        return;
    }

    try {
        // Wait for voices to be loaded before trying to speak
        await voicesPromise;
    } catch (error) {
        console.error("Speech synthesis failed:", error);
        return;
    }

    // Cancel any ongoing speech to prevent overlap
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Attempt to find and use a high-quality, local US English voice
    const usVoice = voices.find(voice => voice.lang === 'en-US' && voice.localService);
    if (usVoice) {
        utterance.voice = usVoice;
    } else {
        // Fallback to any available US English voice
        const fallbackVoice = voices.find(voice => voice.lang === 'en-US');
        if (fallbackVoice) {
            utterance.voice = fallbackVoice;
        }
    }
    
    synth.speak(utterance);
};

export const toggleMute = () => {
    muted = !muted;
    if (muted && synth) {
        synth.cancel();
    }
};

export const isMuted = () => muted;
