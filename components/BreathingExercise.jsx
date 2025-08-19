import React, { useState, useEffect } from 'react';
import { speak } from '../services/speechService';

const breathingSteps = [
    { text: 'Breathe In', duration: 4000 },
    { text: 'Hold', duration: 4000 },
    { text: 'Breathe Out', duration: 6000 },
];

export const BreathingExercise = ({ onClose }) => {
    const [step, setStep] = useState(0);
    const [bubbleStyle, setBubbleStyle] = useState({ transform: 'scale(0.8)', opacity: 0.7 });

    useEffect(() => {
        speak(breathingSteps[step].text);
        const currentStep = breathingSteps[step];

        if (currentStep.text === 'Breathe In') {
            setBubbleStyle({ transform: 'scale(1.2)', opacity: 1 });
        } else if (currentStep.text === 'Breathe Out') {
            setBubbleStyle({ transform: 'scale(0.8)', opacity: 0.7 });
        }

        const timer = setTimeout(() => {
            setStep((prevStep) => (prevStep + 1) % breathingSteps.length);
        }, currentStep.duration);

        return () => clearTimeout(timer);
    }, [step]);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-slate-100 dark:bg-gray-900 flex flex-col items-center justify-center z-50 p-4">
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
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                aria-label="Close breathing exercise"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <p className="mt-12 text-center text-slate-600 dark:text-slate-400 text-lg">
                Follow the rhythm. Match your breath to the guide.
            </p>
        </div>
    );
};


