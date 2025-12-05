import { useState, useRef, useEffect } from 'react';
import { Upload, X, Eye, EyeOff, Lock, Send } from 'lucide-react';
import { fileToBase64 } from '../utils/fileHelper';
import { encryptPayload, generateKey } from '../services/encryption';
import { ErrorTooltip } from './ErrorTooltip';

// --- CONSTANTS & CONFIG ---
const MAX_FILES = 3;
const MAX_FILE_SIZE_MB = 10;
const FORBIDDEN_EXTENSIONS = [
    ".exe", ".bat", ".cmd", ".sh", ".php", ".pl", ".cgi", ".jar", ".vbs",
    ".msi", ".bin", ".py", ".js", ".app", ".com", ".scr", ".pif", ".apk", ".deb", ".rpm"
];
const SUSPICIOUS_MIMES = [
    "application/x-msdownload", "application/x-msdos-program",
    "application/x-executable", "application/x-sh", "application/x-perl", "application/x-python"
];

export const CreateSecretForm = () => {
    // --- STATE ---
    const [message, setMessage] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    // Use string for duration to handle empty state better during typing
    const [duration, setDuration] = useState<string>('1');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Error State: tracks which field has an error and what the message is
    const [activeError, setActiveError] = useState<{ field: string, msg: string } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const errorTimeoutRef = useRef<number | null>(null);

    // --- HELPERS ---

    // Shows error on a specific field and auto-clears after 5 seconds
    const triggerError = (field: string, msg: string) => {
        // Clear previous timeout if exists
        if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);

        setActiveError({ field, msg });

        // Auto hide after 5 seconds
        errorTimeoutRef.current = window.setTimeout(() => {
            setActiveError(null);
        }, 5000);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
        };
    }, []);

    // --- HANDLERS ---

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value.length <= 1000) setMessage(e.target.value);
        // Clear error if user starts typing
        if (activeError?.field === 'message') setActiveError(null);
    };

    // --- DURATION SANITIZATION (Ported from script.js) ---
    const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;

        // 1. Regex Clean: Remove anything that is not a number
        val = val.replace(/[^0-9]/g, "");

        // 2. Remove leading zeros (unless it's just "0", but we want min 1)
        if (val.startsWith("0")) {
            val = val.replace(/^0+/, "");
        }

        // 3. Logic Check: Max 168
        if (val !== "") {
            const numValue = parseInt(val, 10);
            if (numValue > 168) val = "168";
        }

        setDuration(val);
    };

    const handleDurationBlur = () => {
        // On blur, ensure it's at least 1
        if (duration === "" || parseInt(duration) < 1) {
            setDuration("1");
        }
    };

    // --- FILE VALIDATION (Ported from script.js) ---
    const validateFiles = (newFiles: File[]): boolean => {
        const availableSlots = MAX_FILES - files.length;

        // 1. Count Check
        if (newFiles.length > availableSlots) {
            triggerError('files', `File limit exceeded. Limit is ${MAX_FILES}. You can add ${availableSlots} more.`);
            return false;
        }

        for (const file of newFiles) {
            const fileName = file.name.toLowerCase();
            const extension = fileName.substring(fileName.lastIndexOf("."));

            // 2. Extension Check
            if (FORBIDDEN_EXTENSIONS.includes(extension)) {
                triggerError('files', `This type of file is not allowed (${extension}).`);
                return false;
            }

            // 3. Suspicious MIME Check
            if (!file.type || SUSPICIOUS_MIMES.includes(file.type)) {
                // Some valid files might miss type, but for high security we can be strict or lenient.
                // Based on your script, you want to block suspicious ones.
                if (SUSPICIOUS_MIMES.includes(file.type)) {
                    triggerError('files', `This file type is not allowed for security reasons.`);
                    return false;
                }
            }

            // 4. Size Check
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                triggerError('files', `File too large. "${file.name}" exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
                return false;
            }
        }

        return true;
    };

    const handleFilesAdd = (incomingFiles: File[]) => {
        if (validateFiles(incomingFiles)) {
            setFiles(prev => [...prev, ...incomingFiles]);
            setActiveError(null); // Clear errors on success
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFilesAdd(Array.from(e.target.files));
            e.target.value = ''; // Reset input to allow re-selecting same file
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFilesAdd(Array.from(e.dataTransfer.files));
        }
    };

    const handleDrag = (e: React.DragEvent, status: boolean) => {
        e.preventDefault();
        setIsDragging(status);
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
        if (activeError?.field === 'files') setActiveError(null);
    };

    // --- SUBMIT ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Global Validation
        if (!message.trim() && files.length === 0) {
            triggerError('message', 'Please enter a message or attach at least one file');
            return;
        }

        // If password is provided, check length
        if (password.length > 0 && password.length < 6) {
            triggerError('password', 'Password must be at least 6 characters long');
            return;
        }

        try {
            // Process Files
            const processedFiles = await Promise.all(files.map(async f => ({
                name: f.name, type: f.type, size: f.size, content: await fileToBase64(f)
            })));

            const payload = { message, files: processedFiles };
            const key = password || generateKey();

            const encrypted = encryptPayload(payload, key);

            console.log("Encrypted Payload Ready:", encrypted);
            alert("Encryption Successful! (Check Console)");

            // TODO: Axios POST here
        } catch (err) {
            console.error(err);
            triggerError('root', 'An unexpected error occurred while processing.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 relative">
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
                Enter your secret content
            </h2>

            {/* --- MESSAGE --- */}
            <div className="space-y-2 relative">
                <label htmlFor="message" className="block text-sm font-medium text-slate-300">
                    Secret message
                </label>
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
                    {/* Tooltip for Message Error */}
                    {activeError?.field === 'message' && <ErrorTooltip message={activeError.msg} />}
                </div>
                <p className="text-xs text-slate-500 text-right">
                    {message.length} / 1000 characters
                </p>
            </div>

            {/* --- FILE UPLOAD --- */}
            <div className="space-y-2 relative">
                <label className="block text-sm font-medium text-slate-300">
                    File Upload (Optional)
                </label>

                {/* Dropzone */}
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
                ${isDragging
                                    ? 'border-violet-500 bg-violet-500/10'
                                    : activeError?.field === 'files'
                                        ? 'border-red-500 bg-red-500/5'
                                        : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-violet-500/50'}
                `}
                        >
                            <Upload className={`w-10 h-10 mx-auto mb-2 transition-colors ${activeError?.field === 'files' ? 'text-red-400' : 'text-slate-500 group-hover:text-violet-400'}`} />
                            <p className="text-white font-medium text-sm mb-1">Drag files or click to upload</p>
                            <p className="text-slate-600 text-xs">{files.length} / {MAX_FILES} files selected | {MAX_FILE_SIZE_MB} MB max each</p>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" />
                        </div>

                        {/* Tooltip for Files Error */}
                        {activeError?.field === 'files' && <ErrorTooltip message={activeError.msg} />}
                    </div>
                )}

                {/* File List */}
                {files.length > 0 && (
                    <div className="space-y-2 mt-3">
                        {files.map((file, i) => (
                            <div key={i} className="flex items-center justify-between px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="flex-shrink-0">
                                        <Upload className="w-5 h-5 text-violet-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white font-medium truncate text-sm">{file.name}</p>
                                        <p className="text-slate-500 text-xs">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeFile(i)}
                                    className="p-2 ml-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all duration-200 flex-shrink-0"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- DURATION INPUT --- */}
            <div className="space-y-2">
                <label htmlFor="duration" className="block text-sm font-medium text-slate-300">
                    Expiration Time
                </label>
                <div className="relative">
                    <input
                        type="text"
                        id="duration"
                        inputMode="numeric"
                        value={duration}
                        onChange={handleDurationChange}
                        onBlur={handleDurationBlur}
                        placeholder="1"
                        className="w-full px-4 py-3 pr-20 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 
                       focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent 
                       transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-violet-600/80 rounded-lg pointer-events-none">
                        <span className="text-white text-sm font-medium">Hours</span>
                    </div>
                </div>
                <p className="text-xs text-slate-500">Between 1 hour and 168 hours (7 days)</p>
            </div>

            {/* --- PASSWORD INPUT --- */}
            <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                    Protection Password (Optional)
                </label>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full px-4 py-3 pl-10 pr-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 
                       focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent 
                       transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors focus:outline-none"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>

                    {/* Renderizar Tooltip de error aquí */}
                    {activeError?.field === 'password' && <ErrorTooltip message={activeError.msg} />}
                </div>
            </div>

            {/* --- SUBMIT BUTTON --- */}
            <button
                type="submit"
                className="w-full py-4 px-6 bg-gradient-to-r from-violet-600 to-purple-600 
                   hover:from-violet-500 hover:to-purple-500 
                   text-white font-semibold rounded-xl shadow-lg 
                   transform hover:-translate-y-1 hover:shadow-xl 
                   transition-all duration-300 
                   glow-on-hover 
                   flex items-center justify-center gap-2"
            >
                <Send className="w-5 h-5" />
                <span>Create Secret</span>
            </button>
        </form>
    );
};