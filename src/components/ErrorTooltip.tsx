import React from 'react';

interface ErrorTooltipProps {
    message: string;
}

export const ErrorTooltip: React.FC<ErrorTooltipProps> = ({ message }) => {
    return (
        <div className="absolute left-0 bottom-[-10px] transform translate-y-full z-50 w-full max-w-sm animate-fade-in">
            <div className="bg-[#141414]/95 text-red-500 text-sm px-4 py-3 rounded-lg border border-red-500/30 shadow-xl backdrop-blur-md flex items-center gap-2">
                {/* Triangle pointer */}
                <div className="absolute -top-2 left-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-red-500/30"></div>
                <span>{message}</span>
            </div>
        </div>
    );
};