import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, X, GraduationCap, Loader2, ShieldCheck, Zap, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import loginHero from '../../assets/login-hero.jpeg';

export default function InstructorLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showForceOption, setShowForceOption] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent, isForce: boolean = false) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);

        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ email, password, role: 'instructor', force: isForce })
            });

            const data = await response.json();
            if (!response.ok) {
                if (response.status === 423 && data.action_required === 'confirm_force_login') setShowForceOption(true);
                throw new Error(data.message || 'Verification failed. Credentials rejected.');
            }

            login(data.user, data.token);
            navigate('/instructor-dashboard');
        } catch (err: any) {
            setError(err.message || 'System uplink failure. Check connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-brand-charcoal overflow-hidden font-sans selection:bg-brand-emerald/30">
            {/* Left Panel: Auth Core */}
            <div className="flex-1 flex flex-col p-8 md:p-20 bg-white dark:bg-brand-charcoal relative overflow-hidden items-center justify-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-emerald"></div>
                <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-brand-emerald/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="w-full max-w-[440px] relative z-10 animate-fade-in-up">
                    <div className="flex justify-center mb-12">
                        <div className="p-4 bg-brand-beige/20 dark:bg-white/5 rounded-[32px] border border-brand-border">
                            <img src="/logo.png" alt="Layos Group" className="h-10 w-auto" />
                        </div>
                    </div>

                    <div className="text-center mb-12 space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-emerald/10 text-brand-emerald rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-emerald/20">
                            <ShieldCheck size={12} /> Instructor Protocol
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-brand-charcoal dark:text-white tracking-tighter leading-none uppercase">Portal <span className="text-brand-emerald">Uplink</span></h1>
                        <p className="text-brand-muted font-medium text-base">Authorized academic personnel only. Synchronize your instructional dashboard.</p>
                    </div>

                    {error && (
                        <div className="p-6 bg-red-50 dark:bg-red-500/10 border-2 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-[32px] mb-8 animate-in slide-in-from-top-4 duration-500">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-red-100 dark:bg-red-500/20 rounded-2xl flex items-center justify-center shrink-0">
                                    <AlertCircle size={20} />
                                </div>
                                <div className="flex-1 pt-1 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-black text-xs uppercase tracking-widest">{error}</span>
                                        <button onClick={() => { setError(null); setShowForceOption(false); }} className="text-red-400 hover:text-red-600 transition-colors border-none bg-transparent cursor-pointer"><X size={18} /></button>
                                    </div>
                                    {showForceOption && (
                                        <button onClick={() => handleLogin(null as any, true)} className="w-full h-12 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-red-600/20 hover:scale-105 transition-all border-none cursor-pointer">Override Other Sessions</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Secure Identifier</label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    className="w-full h-16 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-sm focus:border-brand-emerald transition-all"
                                    placeholder="e.g. instructor@layos.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <div className="absolute inset-0 rounded-[24px] bg-brand-emerald/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity"></div>
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Access Token</label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full h-16 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-sm focus:border-brand-emerald transition-all pr-16"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-brand-muted hover:text-brand-emerald transition-colors border-none bg-transparent cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                                <div className="absolute inset-0 rounded-[24px] bg-brand-emerald/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity"></div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-1">
                            <Link to="/forgot-password" title="Forgot password" className="text-[10px] font-black text-brand-muted hover:text-brand-emerald transition-colors uppercase tracking-widest">Recovery Required?</Link>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full h-16 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-[24px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-brand-charcoal/20 dark:shadow-brand-emerald/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-4 border-none cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Syncing...</span>
                                </>
                            ) : (
                                <>
                                    Establish Link <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 p-8 bg-brand-beige/10 dark:bg-white/5 rounded-[32px] border border-brand-border border-dashed text-center">
                        <Link to="/login" className="text-[10px] font-black text-brand-muted hover:text-brand-emerald transition-colors uppercase tracking-[0.2em] group flex items-center justify-center gap-3">
                            Switching Role? <span className="text-brand-emerald group-hover:underline group-hover:underline-offset-4">Student Uplink</span>
                        </Link>
                    </div>
                </div>

                <div className="mt-auto w-full max-w-4xl flex flex-col md:flex-row justify-between pt-12 border-t border-brand-border text-[9px] font-black uppercase tracking-[0.2em] text-brand-muted gap-6 opacity-60">
                    <div>© 2026 Layos Group LLC. Secure Node.</div>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-brand-emerald transition-colors">Privacy Protocol</a>
                        <a href="#" className="hover:text-brand-emerald transition-colors">Compliance</a>
                    </div>
                </div>
            </div>

            {/* Right Panel: Immersion */}
            <div className="hidden xl:flex flex-1 bg-brand-emerald relative flex-col p-20 text-white overflow-hidden justify-center items-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent_60%)]"></div>
                <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[100px] animate-pulse"></div>
                
                <div className="relative z-10 w-full max-w-2xl space-y-20">
                    <div className="relative group">
                        <div className="absolute -inset-10 bg-white/20 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                        <img
                            src={loginHero}
                            alt="Instructor Command Center"
                            className="relative w-full h-auto rounded-[48px] shadow-[0_80px_160px_-40px_rgba(0,0,0,0.4)] border-4 border-white/10 transform -rotate-y-12 rotate-x-6 hover:rotate-0 transition-transform duration-[2s] ease-out select-none"
                        />
                        
                        {/* Floating Intel Card */}
                        <div className="absolute -bottom-10 -right-10 bg-white/10 backdrop-blur-3xl p-8 rounded-[40px] border border-white/20 shadow-2xl animate-fade-in-up delay-700">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-white/10 text-white rounded-3xl flex items-center justify-center shadow-inner">
                                    <GraduationCap size={32} />
                                </div>
                                <div className="pr-6 space-y-1">
                                    <div className="font-black text-base uppercase tracking-tighter">Elite Faculty</div>
                                    <div className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Operational Excellence</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8 animate-fade-in-up delay-1000">
                        <div className="flex gap-4">
                            <div className="w-1.5 h-20 bg-white rounded-full"></div>
                            <div className="space-y-4">
                                <h2 className="text-6xl font-black tracking-tighter leading-none uppercase">Architect <br/>Success</h2>
                                <p className="text-xl text-white/70 font-medium leading-relaxed max-w-md">Access advanced student analytics, curriculum engineering tools, and synchronized communication pathways.</p>
                            </div>
                        </div>
                        <div className="flex gap-8 pt-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><Zap size={20} /></div>
                                <span className="text-[10px] font-black uppercase tracking-widest">Real-time Sync</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><Sparkles size={20} /></div>
                                <span className="text-[10px] font-black uppercase tracking-widest">AI Assistance</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
