import React from 'react';
import { speak } from '../services/speechService';

const SpeakerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
);

export const AffirmationDisplay = ({ affirmation }) => {
    const handleSpeak = (e) => {
        e.stopPropagation();
        speak(affirmation);
    };
    
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md text-center flex items-center justify-center gap-3">
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 italic">"{affirmation}"</p>
            <button 
                onClick={handleSpeak}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Read affirmation aloud"
            >
                <SpeakerIcon />
            </button>
        </div>
    );
};


