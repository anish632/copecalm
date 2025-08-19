
import React, { useState, useEffect } from 'react';

interface BubbleWrapProps {
    onClose: () => void;
}

const BUBBLE_COUNT = 100; // 10x10 grid

const Bubble: React.FC<{ popped: boolean; onPop: () => void }> = ({ popped, onPop }) => {
    const [isPopped, setIsPopped] = useState(popped);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClick = () => {
        if (!isPopped) {
            setIsPopped(true);
            setIsAnimating(true);
            onPop();
            setTimeout(() => setIsAnimating(false), 200);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`w-12 h-12 rounded-full transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                isPopped ? 'bg-indigo-300 dark:bg-indigo-800 ' : 'bg-indigo-500 dark:bg-indigo-500 shadow-md'
            } ${isAnimating ? 'animate-pop' : ''}`}
            aria-label={isPopped ? 'Popped bubble' : 'Pop bubble'}
            disabled={isPopped}
        ></button>
    );
};


export const BubbleWrap: React.FC<BubbleWrapProps> = ({ onClose }) => {
    const [bubbles, setBubbles] = useState(() => Array(BUBBLE_COUNT).fill(false));

    const popBubble = (index: number) => {
        setBubbles(currentBubbles => {
            const newBubbles = [...currentBubbles];
            newBubbles[index] = true;
            return newBubbles;
        });
    };

    const resetBubbles = () => {
        setBubbles(Array(BUBBLE_COUNT).fill(false));
    }
    
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [onClose]);

    return (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-2xl w-full max-w-lg mx-auto flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Digital Bubble Wrap</h2>
                <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div className="grid grid-cols-10 gap-2 p-2 bg-slate-200 dark:bg-slate-700 rounded-lg">
                {bubbles.map((popped, i) => (
                    <Bubble key={i} popped={popped} onPop={() => popBubble(i)} />
                ))}
            </div>
             <button
                onClick={resetBubbles}
                className="mt-4 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors self-center"
            >
                Reset
            </button>
        </div>
    );
};
