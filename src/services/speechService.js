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

    // Check if mobile - use simple direct speech synthesis for mobile reliability
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Mobile: Use direct, simple speech synthesis
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
    } else {
        // Desktop: Use background audio service for enhanced capabilities
        try {
            await backgroundAudioService.speak(text, duration);
        } catch (error) {
            console.error("Background audio failed, falling back to regular speech:", error);
            // Fallback to regular speech synthesis
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
    }
};

export const toggleMute = () => {
    muted = !muted;
    if (muted && synth) {
        synth.cancel();
    }
    // Only use background service on desktop
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) {
        backgroundAudioService.toggleMute();
    }
    return muted;
};

export const isMuted = () => muted;

export const stopSpeech = () => {
    if (synth) {
        synth.cancel();
    }
    // Only use background service on desktop
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) {
        backgroundAudioService.stop();
    }
};

export const requestAudioPermissions = async () => {
    // Only request special permissions on desktop
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) {
        return await backgroundAudioService.requestPermissions();
    }
    return Promise.resolve();
};


