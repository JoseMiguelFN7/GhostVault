import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Upload, X, Eye, EyeOff, Lock, Send, AlertCircle } from 'lucide-react';
import { fileToBase64 } from '../utils/fileHelper';
import { encryptString, generateKey } from '../services/encryption';
import { secretService, type EncryptedFilePayload } from '../services/api';
import { ErrorTooltip } from './ErrorTooltip';
// IMPORTAMOS LOS NUEVOS OVERLAYS
import { LoadingOverlay, SuccessModal } from './FeedbackOverlays';

// ... (CONSTANTS & CONFIG se mantienen igual que antes) ...
const MAX_FILES = 3;
const MAX_FILE_SIZE_MB = 10;
const FORBIDDEN_EXTENSIONS = [".exe", ".bat", ".cmd", ".sh", ".php", ".pl", ".cgi", ".jar", ".vbs", ".msi", ".bin", ".py", ".js", ".app", ".com", ".scr", ".pif", ".apk", ".deb", ".rpm"];
const SUSPICIOUS_MIMES = ["application/x-msdownload", "application/x-msdos-program", "application/x-executable", "application/x-sh", "application/x-perl", "application/x-python"];


export const CreateSecretForm = () => {
    // --- STATE ---
    const [message, setMessage] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [duration, setDuration] = useState<string>('1');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // UI States
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [createdUrl, setCreatedUrl] = useState<string | null>(null);

    // Error State
    const [activeError, setActiveError] = useState<{ field: string, msg: string } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const errorTimeoutRef = useRef<number | null>(null);

    // --- HELPERS & HANDLERS ---
    // (Mantén aquí todas tus funciones helpers: triggerError, handlers de inputs, validation, etc.)
    // Para ahorrar espacio en esta respuesta asumo que copias los handlers del paso anterior
    // ... handleMessageChange, handleDurationChange, validateFiles, handleFilesAdd, handleDrop, removeFile ...

    // Copia aquí los helpers y handlers que ya tenías en el código anterior:
    const triggerError = (field: string, msg: string) => {
        if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
        setActiveError({ field, msg });
        errorTimeoutRef.current = window.setTimeout(() => setActiveError(null), 5000);
    };
    useEffect(() => { return () => { if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current); }; }, []);

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value.length <= 1000) setMessage(e.target.value);
        if (activeError?.field === 'message') setActiveError(null);
    };
    const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/[^0-9]/g, "");
        if (val.startsWith("0")) val = val.replace(/^0+/, "");
        if (val !== "") { if (parseInt(val, 10) > 168) val = "168"; }
        setDuration(val);
    };
    const handleDurationBlur = () => { if (duration === "" || parseInt(duration) < 1) setDuration("1"); };

    const validateFiles = (newFiles: File[]): boolean => {
        const availableSlots = MAX_FILES - files.length;
        if (newFiles.length > availableSlots) { triggerError('files', `Limit exceeded.`); return false; }
        for (const file of newFiles) {
            if (FORBIDDEN_EXTENSIONS.includes(file.name.substring(file.name.lastIndexOf(".")))) { triggerError('files', `File type not allowed.`); return false; }
            if (SUSPICIOUS_MIMES.includes(file.type)) { triggerError('files', `Suspicious file type.`); return false; }
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) { triggerError('files', `File too large.`); return false; }
        }
        return true;
    };
    const handleFilesAdd = (incomingFiles: File[]) => { if (validateFiles(incomingFiles)) { setFiles(prev => [...prev, ...incomingFiles]); setActiveError(null); } };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.length) { handleFilesAdd(Array.from(e.target.files)); e.target.value = ''; } };
    const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.length) handleFilesAdd(Array.from(e.dataTransfer.files)); };
    const handleDrag = (e: React.DragEvent, status: boolean) => { e.preventDefault(); setIsDragging(status); };
    const removeFile = (index: number) => { setFiles(files.filter((_, i) => i !== index)); };

    // --- NEW: RESET FORM ---
    const handleCloseModal = () => {
        setCreatedUrl(null);
        setMessage('');
        setFiles([]);
        setPassword('');
        setDuration('1');
        setActiveError(null);
    };

    // --- SUBMIT ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim() && files.length === 0) {
            triggerError('message', 'Please enter a message or attach at least one file');
            return;
        }
        if (password.length > 0 && password.length < 6) {
            triggerError('password', 'Password must be at least 6 characters');
            return;
        }

        setIsLoading(true); // ESTO ACTIVARÁ EL OVERLAY
        setActiveError(null);

        try {
            const keyToUse = password || generateKey();

            const encryptedFilesPromises = files.map(async (file) => {
                const base64Raw = await fileToBase64(file);
                return {
                    encrypted_name: encryptString(file.name, keyToUse),
                    file_data: encryptString(base64Raw, keyToUse)
                } as EncryptedFilePayload;
            });

            const encryptedFiles = await Promise.all(encryptedFilesPromises);
            const encryptedContent = encryptString(message, keyToUse);

            const payload = {
                content: encryptedContent,
                requires_password: password.length > 0,
                expires_in_hours: parseInt(duration),
                files: encryptedFiles
            };

            const response = await secretService.createSecret(payload);

            const finalLink = `${window.location.origin}/s/${response.uuid}#${keyToUse}`;

            // Simular un pequeño delay para que se vea la animación de carga (opcional, se siente mejor UX)
            setTimeout(() => {
                setCreatedUrl(finalLink); // ESTO ACTIVARÁ EL MODAL DE ÉXITO
                setIsLoading(false);
            }, 800);

        } catch (err) {
            console.error("Submission Error:", err);
            let errorMessage = 'Failed to create secret. Check connection.';
            if (axios.isAxiosError(err) && err.response) {
                errorMessage = err.response.data?.message || errorMessage;
            }
            triggerError('root', errorMessage);
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* 1. OVERLAYS (Visual Feedback) */}

            {/* Loading Overlay */}
            {isLoading && <LoadingOverlay />}

            {/* Success Modal */}
            {createdUrl && (
                <SuccessModal
                    url={createdUrl}
                    onClose={handleCloseModal}
                />
            )}


            {/* 2. THE FORM (Siempre visible, queda de fondo cuando salen los modales) */}
            <form onSubmit={handleSubmit} className="space-y-6 relative">
                <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
                    Enter your secret content
                </h2>

                {/* GLOBAL ERROR ALERT */}
                {activeError?.field === 'root' && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 animate-fade-in backdrop-blur-md">
                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <h4 className="text-red-400 font-bold text-sm">Error</h4>
                            <p className="text-red-400/90 text-sm mt-0.5 leading-relaxed">{activeError.msg}</p>
                        </div>
                        <button type="button" onClick={() => setActiveError(null)} className="text-red-400/60 hover:text-red-400"><X className="w-4 h-4" /></button>
                    </div>
                )}

                {/* MESSAGE INPUT */}
                <div className="space-y-2 relative">
                    <label htmlFor="message" className="block text-sm font-medium text-slate-300">Secret message</label>
                    <div className="relative">
                        <textarea
                            id="message"
                            rows={4}
                            value={message}
                            onChange={handleMessageChange}
                            placeholder="Enter your secret message..."
                            className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-500 
                            focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent 
                            transition-all duration-300 resize-none hover:bg-white/10 backdrop-blur-sm
                            ${activeError?.field === 'message' ? 'border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]' : 'border-white/10'}
                            `}
                        />
                        {activeError?.field === 'message' && <ErrorTooltip message={activeError.msg} />}
                    </div>
                    <p className="text-xs text-slate-500 text-right">{message.length} / 1000 characters</p>
                </div>

                {/* FILE UPLOAD */}
                <div className="space-y-2 relative">
                    <label className="block text-sm font-medium text-slate-300">File Upload (Optional)</label>

                    {files.length < MAX_FILES && (
                        <div className="relative">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => handleDrag(e, true)}
                                onDragLeave={(e) => handleDrag(e, false)}
                                onDrop={handleDrop}
                                className={`
                    relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer 
                    transition-all duration-300 group backdrop-blur-sm
                    ${isDragging ? 'border-violet-500 bg-violet-500/10' : activeError?.field === 'files' ? 'border-red-500 bg-red-500/5' : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-violet-500/50'}
                    `}
                            >
                                <Upload className={`w-10 h-10 mx-auto mb-2 transition-colors ${activeError?.field === 'files' ? 'text-red-400' : 'text-slate-500 group-hover:text-violet-400'}`} />
                                <p className="text-white font-medium text-sm mb-1">Drag files or click to upload</p>
                                <p className="text-slate-600 text-xs">{files.length} / {MAX_FILES} files selected | {MAX_FILE_SIZE_MB} MB max</p>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" />
                            </div>
                            {activeError?.field === 'files' && <ErrorTooltip message={activeError.msg} />}
                        </div>
                    )}

                    {/* LISTA DE ARCHIVOS (Igual que antes) */}
                    {files.length > 0 && (
                        <div className="space-y-2 mt-3 animate-fade-in">
                            {files.map((file, i) => (
                                <div key={i} className="flex items-center justify-between px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="flex-shrink-0 w-8 h-8 bg-violet-500/20 rounded flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-violet-300 uppercase">{file.name.split('.').pop()?.slice(0, 3)}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white font-medium truncate text-sm">{file.name}</p>
                                            <p className="text-slate-500 text-xs">{(file.size / 1024).toFixed(2)} KB</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => removeFile(i)} className="p-2 ml-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg"><X className="w-5 h-5" /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* DURATION & PASSWORD (Igual que antes) */}
                <div className="space-y-2">
                    <label htmlFor="duration" className="block text-sm font-medium text-slate-300">Expiration Time</label>
                    <div className="relative">
                        <input type="text" inputMode="numeric" value={duration} onChange={handleDurationChange} onBlur={handleDurationBlur} className="w-full px-4 py-3 pr-20 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all hover:bg-white/10 backdrop-blur-sm" />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-violet-600/80 rounded-lg pointer-events-none"><span className="text-white text-sm font-medium">Hours</span></div>
                    </div>
                    <p className="text-xs text-slate-500">Between 1 hour and 168 hours (7 days)</p>
                </div>

                <div className="space-y-2 relative">
                    <label htmlFor="password" className="block text-sm font-medium text-slate-300">Protection Password (Optional)</label>
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 characters" className={`w-full px-4 py-3 pl-10 pr-10 bg-white/5 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all hover:bg-white/10 backdrop-blur-sm ${activeError?.field === 'password' ? 'border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]' : 'border-white/10'}`} />
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors focus:outline-none">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                        {activeError?.field === 'password' && <ErrorTooltip message={activeError.msg} />}
                    </div>
                </div>

                {/* SUBMIT BUTTON (Ahora siempre muestra Create Secret, el loading va en el overlay) */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 px-6 bg-gradient-to-r from-violet-600 to-purple-600 
                       hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed
                       text-white font-semibold rounded-xl shadow-lg 
                       transform hover:-translate-y-1 hover:shadow-xl active:translate-y-0
                       transition-all duration-300 glow-on-hover 
                       flex items-center justify-center gap-2"
                >
                    <Send className="w-5 h-5" />
                    <span>Create Secret</span>
                </button>
            </form>
        </>
    );
};