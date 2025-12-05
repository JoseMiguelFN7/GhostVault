import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Copy, Check, Download, FileText } from 'lucide-react';
import { BurnedBadge, PasswordPrompt, ErrorView } from '../components/ReceptionVisuals';
import logo from '../assets/GhostVault.svg';
import { secretService, type SecretData } from '../services/api';
import { decryptString, decryptMessage } from '../services/encryption';

// --- TYPES ---
interface DecryptedFile {
    name: string;
    size: string; // Formatted display size (e.g., "1.2 MB")
    content: string; // Base64 Data URL
}

// --- HELPER COMPONENT ---
const BrandHeader = () => (
    <div className="flex flex-row items-center justify-center gap-4 mb-6">
        <div className="w-24 h-24 transparent rounded-2xl flex items-center justify-center">
            <img src={logo} alt="GhostVault" className="w-24 h-24" />
        </div>
        <h1 className="text-5xl font-bold text-violet-400 tracking-tight font-sans">
            GhostVault
        </h1>
    </div>
);

export default function SecretView() {
    // Router Hooks
    const { uuid } = useParams<{ uuid: string }>();
    const location = useLocation();

    // --- STATE MANAGEMENT ---

    // View State: Controls which screen is currently visible
    const [viewState, setViewState] = useState<'LOADING' | 'PASSWORD' | 'SUCCESS' | 'ERROR'>('LOADING');
    const [errorMessage, setErrorMessage] = useState("Secret not found or expired.");

    // Data State: Holds the raw encrypted data and the final decrypted content
    const [encryptedData, setEncryptedData] = useState<SecretData | null>(null);
    const [decryptedMessage, setDecryptedMessage] = useState<string>("");
    const [decryptedFiles, setDecryptedFiles] = useState<DecryptedFile[]>([]);

    // Specific Error State for the Password Modal
    const [passwordError, setPasswordError] = useState<string | null>(null);

    // UI Helpers
    const [copied, setCopied] = useState(false);
    const hasFetched = useRef(false); // Ref to prevent double-fetching in React Strict Mode

    // --- 1. INITIAL FETCH EFFECT ---
    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchSecret = async () => {
            if (!uuid) {
                setErrorMessage("Invalid Link: Missing Secret ID.");
                setViewState('ERROR');
                return;
            }

            try {
                // Fetch data from API
                const response = await secretService.getSecret(uuid);

                // Extract the inner 'data' object based on your API structure
                const secretData = response;
                setEncryptedData(secretData);

                // --- BRANCH A: Secret requires a password ---
                if (secretData.requires_password) {
                    setViewState('PASSWORD');
                }
                // --- BRANCH B: Secret is auto-decrypted via URL Hash ---
                else {
                    // Remove the '#' symbol to get the raw key
                    const urlKey = location.hash.replace('#', '');

                    if (!urlKey) {
                        // Fatal error: The link is incomplete
                        throw new Error("Missing encryption key in URL. Ask the sender for the full link.");
                    }

                    attemptDecryption(secretData, urlKey);
                }

            } catch (err) {
                console.error("API Fetch Error:", err);
                handleApiError(err);
            }
        };

        fetchSecret();
    }, [uuid, location.hash]);


    // --- 2. CORE DECRYPTION LOGIC ---
    const attemptDecryption = (data: SecretData, key: string) => {
        try {
            // A. Decrypt Message Body
            const msg = decryptMessage(data.content, key);

            // If decryption returns null/empty, the key is incorrect (AES failure)
            if (msg === null) throw new Error("Decryption failed");

            setDecryptedMessage(msg);

            // B. Decrypt Files (if present)
            if (data.files && data.files.length > 0) {
                const processedFiles: DecryptedFile[] = [];

                for (const f of data.files) {
                    const name = decryptString(f.encrypted_name, key);
                    const content = decryptString(f.file_data, key);

                    if (name && content) {
                        // Calculate approximate size from Base64 string length
                        // Formula: (length * 3/4) - padding
                        const sizeInBytes = (content.length * 3) / 4 - (content.indexOf('=') > 0 ? (content.length - content.indexOf('=')) : 0);
                        const sizeKB = sizeInBytes / 1024;
                        const sizeDisplay = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(2)} MB` : `${sizeKB.toFixed(1)} KB`;

                        processedFiles.push({ name, content, size: sizeDisplay });
                    }
                }
                setDecryptedFiles(processedFiles);
            }

            // If we reach here, everything is successful
            setViewState('SUCCESS');

        } catch (error) {
            console.error("Decryption Error:", error);

            // Handle error based on context
            if (viewState === 'PASSWORD' || data.requires_password) {
                // Re-throw so the Password Modal can handle it
                throw new Error("Incorrect password");
            } else {
                // If it was an auto-decrypt attempt, it's a fatal error (Bad URL)
                setErrorMessage("Decryption failed. The key in the URL is invalid or broken.");
                setViewState('ERROR');
            }
        }
    };

    // --- 3. EVENT HANDLERS ---

    const handlePasswordSubmit = (password: string) => {
        if (!encryptedData) return;

        setPasswordError(null); // Clear previous errors

        try {
            attemptDecryption(encryptedData, password);
        } catch (e) {
            // Catch the error thrown by attemptDecryption and update UI
            setPasswordError("Incorrect password. Please try again.");
        }
    };

    const handleApiError = (err: any) => {
        let msg = "An unexpected error occurred.";

        if (axios.isAxiosError(err)) {
            if (err.response?.status === 404) msg = "Secret not found. It may have already been viewed and burned.";
            else if (err.response?.status === 410) msg = "This secret has expired and is no longer available.";
            else if (err.response?.status === 500) msg = "Server error. Please try again later.";
        } else if (err instanceof Error) {
            msg = err.message;
        }

        setErrorMessage(msg);
        setViewState('ERROR');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(decryptedMessage);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = (file: DecryptedFile) => {
        // Create a temporary link to trigger download
        const link = document.createElement("a");
        link.href = file.content; // Data URL
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- 4. RENDERERS ---

    // RENDER: LOADING STATE
    if (viewState === 'LOADING') {
        return (
            <div className="min-h-screen gradient-bg animate-gradient-shift flex flex-col items-center justify-center p-4">
                <BrandHeader />
                <div className="flex flex-col items-center gap-4 mt-8">
                    <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-medium animate-pulse">Retrieving secret...</p>
                </div>
            </div>
        );
    }

    // RENDER: ERROR STATE
    if (viewState === 'ERROR') {
        return (
            <ErrorView message={errorMessage}>
                <BrandHeader />
            </ErrorView>
        );
    }

    // RENDER: MAIN SUCCESS VIEW (With Password Overlay if needed)
    return (
        <>
            {/* Password Modal Overlay */}
            {viewState === 'PASSWORD' && (
                <PasswordPrompt
                    onSubmit={handlePasswordSubmit}
                    isLoading={false}
                    error={passwordError} // Pass the specific error state
                />
            )}

            {/* Main Content (Visible underneath modal or standalone on success) */}
            {viewState === 'SUCCESS' && (
                <div className="min-h-screen flex items-center justify-center p-4 lg:p-8">
                    <div className="w-full max-w-3xl bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 md:p-12 animate-fade-in">

                        {/* Header Section */}
                        <div className="text-center mb-10">
                            <BrandHeader />
                            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Secret Revealed</h2>
                            <BurnedBadge />
                            <p className="text-slate-400 mt-4 text-sm">
                                Copy this information now. It has been deleted from the server.
                            </p>
                        </div>

                        {/* Decrypted Message Section */}
                        {decryptedMessage && (
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-slate-300 mb-2">Secret Message</label>
                                <div className="relative group">
                                    <div className="w-full px-5 py-5 bg-black/30 border border-white/10 rounded-xl text-white 
                                min-h-[120px] max-h-[300px] overflow-y-auto font-mono text-sm leading-relaxed backdrop-blur-sm whitespace-pre-wrap">
                                        {decryptedMessage}
                                    </div>
                                    <button
                                        onClick={handleCopy}
                                        className="mt-3 w-full py-3 px-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                    >
                                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                        <span>{copied ? "Copied!" : "Copy to Clipboard"}</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Decrypted Files Section */}
                        {decryptedFiles.length > 0 && (
                            <div className="mb-8 animate-fade-in">
                                <label className="block text-sm font-medium text-slate-300 mb-3">
                                    Attached Files ({decryptedFiles.length})
                                </label>
                                <div className="space-y-3">
                                    {decryptedFiles.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all group">
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center text-violet-400">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-white font-medium truncate">{file.name}</p>
                                                    <p className="text-slate-500 text-xs">{file.size}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDownload(file)}
                                                className="flex-shrink-0 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-lg"
                                            >
                                                <Download className="w-4 h-4" />
                                                <span className="hidden sm:inline">Download</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="pt-6 border-t border-white/10 text-center">
                            <p className="text-slate-500 text-xs">Closing this page clears memory.</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}