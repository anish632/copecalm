import backgroundAudioService from './backgroundAudioService.js';

let muted = false;
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let voices = [];
let voicesLoaded = false;

// Safari-specific fixes for speech synthesis
const isSafari = typeof window !== 'undefined' && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

const voicesPromise = new Promise((resolve, reject) => {
    if (!synth) {
        reject("Speech synthesis not supported.");
        return;
    }

    const loadAndResolve = () => {
        voices = synth.getVoices();
        if (voices.length > 0) {
            voicesLoaded = true;
            resolve();
            return true;
        }
        return false;
    }

    if (loadAndResolve()) {
        return;
    }

    // Safari needs extra time and multiple attempts to load voices
    if (isSafari) {
        setTimeout(() => {
            if (loadAndResolve()) return;

            synth.onvoiceschanged = () => {
                loadAndResolve();
            };
        }, 100);
    } else {
        synth.onvoiceschanged = () => {
            loadAndResolve();
        };
    }
});

export const speak = async (text, duration = 4000) => {
    if (muted || !synth || !text) {
        return;
    }

    // Safari-specific handling for speech synthesis
    try {
        // Wait for voices to load, but don't block indefinitely
        if (!voicesLoaded) {
            await Promise.race([
                voicesPromise,
                new Promise(resolve => setTimeout(resolve, isSafari ? 500 : 100))
            ]);
        }
    } catch (error) {
        console.error("Speech synthesis failed:", error);
        return;
    }

    // Cancel any existing speech
    synth.cancel();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = isSafari ? 0.9 : 1.0; // Slightly slower for Safari
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Voice selection with Safari fallbacks
    if (voices.length > 0) {
        let selectedVoice = null;

        if (isSafari) {
            // Safari prefers system voices
            selectedVoice = voices.find(voice =>
                voice.lang.includes('en') && voice.localService
            ) || voices.find(voice => voice.lang.includes('en'));
        } else {
            selectedVoice = voices.find(voice => voice.lang === 'en-US' && voice.localService) ||
                          voices.find(voice => voice.lang === 'en-US') ||
                          voices.find(voice => voice.lang.includes('en'));
        }

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
    }

    // Safari needs special handling for speech events
    if (isSafari) {
        utterance.onstart = () => {
            console.log('Speech started on Safari');
        };
        utterance.onerror = (event) => {
            console.error('Speech error on Safari:', event);
        };
    }

    synth.speak(utterance);
};

export const toggleMute = () => {
    muted = !muted;
    if (muted && synth) {
        synth.cancel();
    }
    return muted;
};

export const isMuted = () => muted;

export const stopSpeech = () => {
    if (synth) {
        synth.cancel();
    }
};


