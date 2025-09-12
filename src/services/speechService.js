import backgroundAudioService from './backgroundAudioService.js';

let muted = false;
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let voices = [];

const voicesPromise = new Promise((resolve, reject) => {
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

    if (loadAndResolve()) {
        return;
    }

    synth.onvoiceschanged = () => {
        loadAndResolve();
    };
});

export const speak = async (text, duration = 4000) => {
    if (muted || !synth || !text) {
        return;
    }

    // Use direct speech synthesis for all browsers for reliability
    try {
        await voicesPromise;
    } catch (error) {
        console.error("Speech synthesis failed:", error);
        return;
    }
    
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    const usVoice = voices.find(voice => voice.lang === 'en-US' && voice.localService);
    if (usVoice) {
        utterance.voice = usVoice;
    } else {
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
    return muted;
};

export const isMuted = () => muted;

export const stopSpeech = () => {
    if (synth) {
        synth.cancel();
    }
};


