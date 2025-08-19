
import React, { useState, useEffect } from 'react';
import { AffirmationDisplay } from './components/AffirmationDisplay';
import { BreathingExercise } from './components/BreathingExercise';
import { BubbleWrap } from './components/BubbleWrap';
import { GroundingExercise } from './components/GroundingExercise';
import { ToolButton } from './components/ToolButton';
import { speak, toggleMute, isMuted } from './src/services/speechService';
import { AFFIRMATIONS } from './constants';

// SVG Icons defined outside the component for performance
const BreathingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const DimmerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
const StopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>;
const GroundingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const FidgetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const VolumeUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>;
const VolumeOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>;

const ScreenDimmer = ({ active }: { active: boolean }) => {
  if (!active) return null;
  return <div className="fixed inset-0 bg-black bg-opacity-70 z-40 pointer-events-none"></div>;
};

const StopModal = ({ onClose }: { onClose: () => void }) => {
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [onClose]);

    const handleAudioClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        speak('Stop.');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-rose-600 text-white p-12 rounded-2xl shadow-2xl text-center max-w-lg mx-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-center gap-4 mb-4">
                    <h2 className="text-6xl font-extrabold">SAY 'STOP'</h2>
                    <button 
                        onClick={handleAudioClick} 
                        className="p-2 rounded-full hover:bg-rose-700 active:bg-rose-800 transition-colors"
                        aria-label="Say 'Stop' out loud"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                    </button>
                </div>
                <p className="text-2xl">out loud, right now.</p>
                <button
                    onClick={onClose}
                    className="mt-8 bg-white text-rose-600 font-bold py-2 px-6 rounded-full hover:bg-rose-100 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

const ActionPrompt = () => {
    const text = "Close the laptop.";
    const handleSpeak = () => {
        speak(text);
    };

    const SpeakerIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
    );

    return (
        <div className="bg-rose-100 dark:bg-rose-900/50 border border-rose-200 dark:border-rose-800 p-4 sm:p-6 rounded-2xl shadow-md text-center flex items-center justify-center gap-4 mt-8">
            <p className="text-lg sm:text-xl text-rose-800 dark:text-rose-200 font-semibold">{text}</p>
            <button 
                onClick={handleSpeak} 
                aria-label="Say 'Close the laptop' aloud" 
                className="p-2 rounded-full hover:bg-rose-200 dark:hover:bg-rose-800 active:bg-rose-300 dark:active:bg-rose-700 transition-colors text-rose-600 dark:text-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
                <SpeakerIcon />
            </button>
        </div>
    );
};


export default function App() {
    const [activeTool, setActiveTool] = useState<string | null>(null);
    const [dimScreen, setDimScreen] = useState(false);
    const [showStopModal, setShowStopModal] = useState(false);
    const [isAudioMuted, setIsAudioMuted] = useState(isMuted());
    const [affirmation, setAffirmation] = useState(AFFIRMATIONS[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            setAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleToolClick = (tool: string) => {
        setActiveTool(tool);
        let text = `Starting ${tool.replace(/([A-Z])/g, ' $1').trim()} exercise.`;
        if (tool === 'bubbleWrap') text = "Let's pop some bubbles.";
        speak(text);
    };

    const handleDimScreen = () => {
        setDimScreen(prev => !prev);
        speak(dimScreen ? 'Screen brightness returning to normal.' : 'Dimming screen.');
    };

    const handleStop = () => {
        setShowStopModal(true);
        speak("Say STOP out loud, right now.");
    };
    
    const handleToggleMute = () => {
        toggleMute();
        setIsAudioMuted(isMuted());
    };

    const renderActiveTool = () => {
        switch (activeTool) {
            case 'breathing':
                return <BreathingExercise onClose={() => setActiveTool(null)} />;
            case 'grounding':
                return <GroundingExercise onClose={() => setActiveTool(null)} />;
            case 'bubbleWrap':
                 return <BubbleWrap onClose={() => setActiveTool(null)} />;
            default:
                return null;
        }
    };

    if (activeTool) {
        return <div className="min-h-screen w-full flex items-center justify-center p-4">{renderActiveTool()}</div>;
    }

    return (
        <div className="min-h-screen w-full text-slate-800 dark:text-slate-200 p-4 sm:p-6 lg:p-8 transition-colors duration-500">
            <ScreenDimmer active={dimScreen} />
            {showStopModal && <StopModal onClose={() => setShowStopModal(false)} />}
            
            <header className="text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-indigo-600 dark:text-indigo-400">Cope & Calm</h1>
                <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">Your space to find a moment of peace.</p>
            </header>

            <main className="max-w-4xl mx-auto">
                <AffirmationDisplay affirmation={affirmation} />
                <ActionPrompt />

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
                    <ToolButton title="Guided Breathing" icon={<BreathingIcon />} onClick={() => handleToolClick('breathing')} />
                    <ToolButton title="Dim Screen" icon={<DimmerIcon />} onClick={handleDimScreen} active={dimScreen}/>
                    <ToolButton title="Say 'Stop'" icon={<StopIcon />} onClick={handleStop} />
                    <ToolButton title="5-4-3-2-1 Grounding" icon={<GroundingIcon />} onClick={() => handleToolClick('grounding')} />
                    <ToolButton title="Fidget Toy" icon={<FidgetIcon />} onClick={() => handleToolClick('bubbleWrap')} />
                </div>
            </main>
            
            <footer className="fixed bottom-4 right-4">
                <button onClick={handleToggleMute} className="p-3 bg-white dark:bg-slate-700 rounded-full shadow-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                    {isAudioMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                </button>
            </footer>
        </div>
    );
}
