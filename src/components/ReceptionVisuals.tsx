import { type ReactNode } from 'react';
import { Lock, Unlock, AlertCircle } from 'lucide-react';
import { useState } from 'react';

// --- 1. Status Badge ---
export const BurnedBadge = () => (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg backdrop-blur-sm animate-pulse-glow">
        <div className="text-orange-400">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3a7 7 0 0 1 3-6.5" />
            </svg>
        </div>
        <span className="text-orange-400 font-medium text-sm">
            Status: BURNED. This secret has been deleted from our servers.
        </span>
    </div>
);

// --- 2. Error Modal ---
export const ErrorView = ({ message, children }: { message: string, children?: ReactNode }) => (
    <div className="min-h-screen gradient-bg animate-gradient-shift flex flex-col items-center justify-center p-4 gap-8">

        {/* Logo + Brand */}
        {children}

        {/* 2. Error Card */}
        <div className="bg-[#121212]/90 backdrop-blur-xl border border-red-500/30 rounded-3xl p-10 max-w-lg w-full shadow-2xl text-center">
            <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Error</h3>
            <p className="text-slate-300 leading-relaxed mb-6">{message}</p>
            <p className="text-slate-500 text-sm">You can close this tab</p>
        </div>
    </div>
);

// --- 3. Password Modal ---
export const PasswordPrompt = ({ onSubmit, isLoading, error }: { onSubmit: (pwd: string) => void, isLoading: boolean, error: string | null }) => {
    const [password, setPassword] = useState('');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 max-w-md w-full shadow-2xl">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-violet-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-violet-500/30">
                        <Lock className="w-8 h-8 text-violet-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Password Required</h3>
                    <p className="text-slate-400 text-sm">This secret is protected. Enter the password to decrypt it.</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); onSubmit(password); }}>
                    <div className="space-y-4">
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password..."
                                className={`w-full px-4 py-3 bg-black/30 border rounded-xl text-white placeholder-slate-500 outline-none transition-all
                  ${error ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-violet-500'}
                `}
                                autoFocus
                            />
                            {error && <p className="text-red-400 text-sm mt-2 ml-1">{error}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !password}
                            className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Unlock className="w-5 h-5" />
                                    <span>Decrypt Secret</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};