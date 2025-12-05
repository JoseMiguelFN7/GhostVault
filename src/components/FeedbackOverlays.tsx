import { Check, Copy, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

// --- LOADING OVERLAY ---
export const LoadingOverlay = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            {/* The small dark card from your image */}
            <div className="bg-[#18181b] border border-white/10 px-8 py-5 rounded-2xl flex items-center gap-4 shadow-2xl transform scale-100">
                {/* Purple Spinner */}
                <div className="w-6 h-6 border-2 border-white/20 border-t-violet-500 rounded-full animate-spin"></div>
                <span className="text-white font-medium text-lg">Creating secret...</span>
            </div>
        </div>
    );
};

// --- SUCCESS MODAL ---
interface SuccessModalProps {
    url: string;
    onClose: () => void;
}

export const SuccessModal = ({ url, onClose }: SuccessModalProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
            {/* Main Card */}
            <div className="bg-[#121212] border border-white/10 w-full max-w-lg rounded-3xl p-8 shadow-2xl relative">

                {/* Green Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center border border-green-500/20">
                        <Check className="w-8 h-8 text-green-500" strokeWidth={3} />
                    </div>
                </div>

                {/* Titles */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">¡Secret Created!</h2>
                    <p className="text-slate-400">Share this URL with the recipient</p>
                </div>

                {/* URL Box (Monospace & Darker) */}
                <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 mb-6 font-mono text-sm text-slate-300 break-all">
                    {url}
                </div>

                {/* Action Buttons Row */}
                <div className="flex gap-3 mb-6">
                    <button
                        onClick={handleCopy}
                        className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        {copied ? "Copied!" : "Copy URL"}
                    </button>

                    <button
                        onClick={onClose}
                        className="bg-transparent border border-white/20 hover:bg-white/5 text-white font-semibold py-3 px-6 rounded-xl transition-all"
                    >
                        Close
                    </button>
                </div>

                {/* Warning Alert */}
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-500 text-sm leading-relaxed">
                        <span className="font-bold">Important:</span> This URL will self-destruct after being viewed or in 1 hour(s).
                    </p>
                </div>

            </div>
        </div>
    );
};