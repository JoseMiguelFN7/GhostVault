import { Shield, Flame, EyeOff } from 'lucide-react';
import { CreateSecretForm } from '../components/CreateSecretForm';
import logo from '../assets/GhostVault.svg';

export default function Home() {
    return (
        // Main Layout: Grid 2 cols (matches your HTML structure)
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

            {/* ========== LEFT PANEL: INFO ========== */}
            <div className="flex items-center justify-center p-6 lg:p-12 bg-white/5 backdrop-blur-sm lg:border-r border-white/10">
                <div className="w-full max-w-xl">

                    {/* Header */}
                    <div className="mb-12">
                        <div className="flex flex-row items-center gap-4 mb-4">
                            {/* Logo Icon Container */}
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl flex-shrink-0">
                                <img src={logo} alt="GhostVault Logo" className="w-full h-full p-3" />
                            </div>
                            {/* Page Title */}
                            <h1 className="text-5xl font-bold text-violet-400 tracking-tight">
                                GhostVault
                            </h1>
                        </div>

                        <p className="text-xl text-slate-400 mb-8">
                            Share messages securely and ephemerally
                        </p>

                        <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                            Maximum Security,<br />
                            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                                Zero Knowledge
                            </span>
                        </h2>
                        <p className="text-slate-400 text-lg">
                            Share sensitive information without leaving a trace. GhostVault uses browser-based encryption and
                            burn-on-read technology.
                        </p>
                    </div>

                    {/* Features List */}
                    <div className="space-y-6">
                        <FeatureItem
                            icon={<Flame className="w-6 h-6 text-white" />}
                            title="Burn-on-Read Technology"
                            description="Messages automatically self-destruct after being read once."
                        />
                        <FeatureItem
                            icon={<Shield className="w-6 h-6 text-white" />}
                            title="Zero-Knowledge Architecture"
                            description="Your message is encrypted in your browser before sending. Not even we can read it."
                        />
                        <FeatureItem
                            icon={<EyeOff className="w-6 h-6 text-white" />}
                            title="No Logs, No Traces"
                            description="We store no activity logs. Total privacy guaranteed."
                        />
                    </div>
                </div>
            </div>

            {/* ========== RIGHT PANEL: FORM ========== */}
            <div className="flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-xl">
                    <CreateSecretForm />
                </div>
            </div>
        </div>
    );
}

// Helper to keep code clean, feature item component
const FeatureItem = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
            {icon}
        </div>
        <div>
            <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
            <p className="text-slate-400 text-sm">{description}</p>
        </div>
    </div>
);