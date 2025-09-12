import React, { useState, useEffect } from 'react';
import { speak, requestAudioPermissions, stopSpeech } from '../services/speechService';

const breathingSteps = [
    { text: 'Breathe In', duration: 4000 },
    { text: 'Hold', duration: 4000 },
    { text: 'Breathe Out', duration: 6000 },
];

export const BreathingExercise = ({ onClose }) => {
    const [step, setStep] = useState(0);
    const [bubbleStyle, setBubbleStyle] = useState({ transform: 'scale(0.8)', opacity: 0.7 });
    const [permissionsRequested, setPermissionsRequested] = useState(false);
    const [audioInitialized, setAudioInitialized] = useState(false);
    const [showStartPrompt, setShowStartPrompt] = useState(true);

    // Initialize audio on first user interaction (required for mobile)
    const initializeAudio = async () => {
        if (!audioInitialized) {
            try {
                await requestAudioPermissions();
                setPermissionsRequested(true);
                setAudioInitialized(true);
                setShowStartPrompt(false);
                
                // Test speech synthesis to ensure it works
                if ('speechSynthesis' in window) {
                    const testUtterance = new SpeechSynthesisUtterance('');
                    testUtterance.volume = 0;
                    window.speechSynthesis.speak(testUtterance);
                }
            } catch (error) {
                console.error('Failed to initialize audio:', error);
                setShowStartPrompt(false); // Proceed anyway
            }
        } else {
            setShowStartPrompt(false);
        }
    };

    // Request permissions on component mount for non-mobile
    useEffect(() => {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (!isMobile && !permissionsRequested) {
            const requestPermissions = async () => {
                try {
                    await requestAudioPermissions();
                    setPermissionsRequested(true);
                    setAudioInitialized(true);
                    setShowStartPrompt(false);
                } catch (error) {
                    console.error('Failed to request audio permissions:', error);
                    setShowStartPrompt(false);
                }
            };
            requestPermissions();
        }
    }, [permissionsRequested]);

    useEffect(() => {
        // Only start the breathing exercise if audio is initialized or we're not showing the prompt
        if (!showStartPrompt) {
            const currentStep = breathingSteps[step];
            
            // Speak with duration parameter for better background audio handling
            if (audioInitialized) {
                speak(currentStep.text, currentStep.duration);
            }

            if (currentStep.text === 'Breathe In') {
                setBubbleStyle({ transform: 'scale(1.2)', opacity: 1 });
            } else if (currentStep.text === 'Breathe Out') {
                setBubbleStyle({ transform: 'scale(0.8)', opacity: 0.7 });
            }

            const timer = setTimeout(() => {
                setStep((prevStep) => (prevStep + 1) % breathingSteps.length);
            }, currentStep.duration);

            return () => clearTimeout(timer);
        }
    }, [step, showStartPrompt, audioInitialized]);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [onClose]);

    // Cleanup audio when component unmounts
    useEffect(() => {
        return () => {
            stopSpeech();
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-slate-100 dark:bg-gray-900 flex flex-col items-center justify-center z-50 p-4">
            {showStartPrompt ? (
                // Show start prompt for mobile users
                <div className="text-center max-w-md">
                    <div className="mb-8">
                        <div className="w-32 h-32 bg-indigo-400 dark:bg-indigo-600 rounded-full mx-auto flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 9v6M9 12h6" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                        Start Guided Breathing
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">
                        Tap the button below to enable audio guidance for your breathing exercise. This will help you stay focused even if you switch to other apps.
                    </p>
                    <button
                        onClick={initializeAudio}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
                    >
                        Start Audio Guide
                    </button>
                </div>
            ) : (
                // Show normal breathing exercise
                <>
                    <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
                        <div
                            className="absolute inset-0 bg-indigo-400 dark:bg-indigo-600 rounded-full transition-all ease-in-out"
                            style={{
                                ...bubbleStyle,
                                transitionDuration: `${breathingSteps[step].duration}ms`,
                            }}
                        ></div>
                        <div className="relative z-10 text-center">
                            <p className="text-4xl sm:text-5xl font-bold text-white dark:text-gray-200">
                                {breathingSteps[step].text}
                            </p>
                        </div>
                    </div>
                    <p className="mt-12 text-center text-slate-600 dark:text-slate-400 text-lg">
                        Follow the rhythm. Match your breath to the guide.
                        {!audioInitialized && (
                            <span className="block mt-2 text-sm text-amber-600 dark:text-amber-400">
                                (Visual guide only - audio permissions needed for voice guidance)
                            </span>
                        )}
                    </p>
                </>
            )}
            
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                aria-label="Close breathing exercise"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};


