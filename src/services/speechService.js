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
    if (muted || !text) {
        return;
    }
    
    // Use background audio service for better background support
    try {
        await backgroundAudioService.speak(text, duration);
    } catch (error) {
        console.error("Background audio failed, falling back to regular speech:", error);
        // Fallback to regular speech synthesis
        if (!synth) return;
        
        try {
            await voicesPromise;
        } catch (voiceError) {
            console.error("Speech synthesis failed:", voiceError);
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
    }
};

export const toggleMute = () => {
    muted = !muted;
    const backgroundMuted = backgroundAudioService.toggleMute();
    if (muted && synth) {
        synth.cancel();
    }
    return backgroundMuted;
};

export const isMuted = () => {
    return backgroundAudioService.isMuted();
};

export const stopSpeech = () => {
    backgroundAudioService.stop();
    if (synth) {
        synth.cancel();
    }
};

export const requestAudioPermissions = async () => {
    return await backgroundAudioService.requestPermissions();
};


