
import React, { useState, useEffect } from 'react';
import { GROUNDING_STEPS } from '../constants';
import { speak } from '../services/speechService';

interface GroundingExerciseProps {
    onClose: () => void;
}

export const GroundingExercise: React.FC<GroundingExerciseProps> = ({ onClose }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        speak(GROUNDING_STEPS[step].instruction);
    }, [step]);

    const nextStep = () => {
        if (step < GROUNDING_STEPS.length - 1) {
            setStep(step + 1);
        } else {
            speak("Grounding exercise complete. Well done.");
            onClose();
        }
    };
    
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'Enter') {
                nextStep();
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, onClose]);


    const currentStep = GROUNDING_STEPS[step];
    const progress = ((step + 1) / GROUNDING_STEPS.length) * 100;

    return (
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md mx-auto text-center flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">5-4-3-2-1 Grounding</h2>
                <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 my-4">
                <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
            </div>
            
            <div className="flex-grow flex flex-col items-center justify-center my-6">
                <div className="text-6xl mb-4">{currentStep.icon}</div>
                <p className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-200">{currentStep.title}</p>
                <p className="mt-2 text-slate-600 dark:text-slate-400">{currentStep.instruction}</p>
            </div>

            <button
                onClick={nextStep}
                className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-400 focus:ring-opacity-50"
            >
                {step < GROUNDING_STEPS.length - 1 ? 'Next' : 'Finish'}
            </button>
        </div>
    );
};
