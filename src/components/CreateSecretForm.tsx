import { useState, useRef } from 'react';
import { Upload, X, Eye, EyeOff, Lock, Send } from 'lucide-react';
import { fileToBase64 } from '../utils/fileHelper';
import { encryptPayload, generateKey } from '../services/encryption';

export const CreateSecretForm = () => {
    // State
    const [message, setMessage] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [duration, setDuration] = useState<string>('1'); // String to handle empty input naturally
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handlers
    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value.length <= 1000) setMessage(e.target.value);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) addFiles(Array.from(e.target.files));
    };

    const handleDrag = (e: React.DragEvent, status: boolean) => {
        e.preventDefault();
        setIsDragging(status);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) addFiles(Array.from(e.dataTransfer.files));
    };

    const addFiles = (newFiles: File[]) => {
        const totalFiles = [...files, ...newFiles];
        if (totalFiles.length > 3) {
            alert("Maximum 3 files allowed");
            setFiles(totalFiles.slice(0, 3));
        } else {
            setFiles(totalFiles);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // (Logic stays the same, omitted for visual focus)
        if (!message && files.length === 0) return;

        try {
            const processedFiles = await Promise.all(files.map(async f => ({
                name: f.name, type: f.type, size: f.size, content: await fileToBase64(f)
            })));

            const payload = { message, files: processedFiles };
            const key = password || generateKey();
            const encrypted = encryptPayload(payload, key);

            console.log("Encrypted:", encrypted);
            alert("Encryption Ready! Check Console.");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
                Enter your secret content
            </h2>

            {/* --- MESSAGE --- */}
            <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium text-slate-300">
                    Secret message
                </label>
                <textarea
                    id="message"
                    rows={4}
                    value={message}
                    onChange={handleMessageChange}
                    placeholder="Enter your secret message..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 
                        focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent 
                        transition-all duration-300 resize-none hover:bg-white/10 backdrop-blur-sm"
                />
                <p className="text-xs text-slate-500">
                    {message.length} / 1000 characters
                </p>
            </div>

            {/* --- FILE UPLOAD --- */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                    File Upload (Optional)
                </label>

                {files.length < 3 && (
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
                                : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-violet-500/50'}
                        `}>
                        <Upload className="w-10 h-10 mx-auto mb-2 text-slate-500 group-hover:text-violet-400 transition-colors" />
                        <p className="text-white font-medium text-sm mb-1">Drag files or click to upload</p>
                        <p className="text-slate-600 text-xs">{files.length} / 3 files selected | 10 MB max each</p>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" />
                    </div>
                )}

                {/* File List */}
                {files.length > 0 && (
                    <div className="space-y-2 mt-3">
                        {files.map((file, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/10">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-8 h-8 bg-violet-500/20 rounded flex items-center justify-center text-violet-400">
                                        <span className="text-xs font-bold uppercase">{file.name.split('.').pop()?.slice(0, 3)}</span>
                                    </div>
                                    <span className="text-sm text-slate-200 truncate">{file.name}</span>
                                </div>
                                <button type="button" onClick={() => setFiles(files.filter((_, idx) => idx !== i))}>
                                    <X className="w-4 h-4 text-slate-500 hover:text-red-400" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- DURATION INPUT (Exact match to HTML layout) --- */}
            <div className="space-y-2">
                <label htmlFor="duration" className="block text-sm font-medium text-slate-300">
                    Expiration Time
                </label>
                <div className="relative">
                    <input
                        type="number"
                        id="duration"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        min="1"
                        max="168"
                        placeholder="1 (Default)"
                        // Added 'pr-20' to make space for the badge
                        className="w-full px-4 py-3 pr-20 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 
                        focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent 
                        transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
                    />
                    {/* Badge 'Hours' fixed to the right */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-violet-600/80 rounded-lg">
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
                    {/* Lock Icon Left */}
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

                    {/* Toggle Button Right */}
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* --- SUBMIT BUTTON (With glow-on-hover) --- */}
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