
import React from 'react';

interface ToolButtonProps {
    title: string;
    icon: React.ReactNode;
    onClick: () => void;
    active?: boolean;
}

export const ToolButton: React.FC<ToolButtonProps> = ({ title, icon, onClick, active = false }) => {
    const baseClasses = "group flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-opacity-50";
    const activeClasses = "bg-indigo-600 text-white dark:bg-indigo-500 ring-indigo-500";
    const inactiveClasses = "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 focus:ring-indigo-400";

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
        >
            <div className={`transition-colors duration-300 ${active ? 'text-white' : 'text-indigo-500 dark:text-indigo-400'}`}>
                {icon}
            </div>
            <span className="mt-3 text-sm sm:text-base font-semibold text-center">{title}</span>
        </button>
    );
};
