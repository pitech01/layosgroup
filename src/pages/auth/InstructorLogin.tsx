import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, X, Star, Loader2, Mail, Lock, ArrowRight } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { TwoFactorChallengeModal } from '../../components/auth/TwoFactorChallengeModal';
import loginHero from '../../assets/login-hero.jpeg';
import '../../components/layouts/staff.css';

export default function InstructorLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showForceOption, setShowForceOption] = useState(false);
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [pendingAuthData, setPendingAuthData] = useState<{ user: any; token: string } | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const handleLogin = async (e: React.FormEvent, isForce: boolean = false) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    email, 
                    password, 
                    role: 'instructor',
                    force: isForce 
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 423 && data.action_required === 'confirm_force_login') {
                    setShowForceOption(true);
                }
                throw new Error(data.message || 'Login failed. Please verify your instructor credentials.');
            }

            if (data.two_factor_required || data.user?.two_factor_enabled) {
                setPendingAuthData({ user: data.user, token: data.token });
                setShow2FAModal(true);
            } else {
                login(data.user, data.token);
                navigate('/instructor-dashboard');
            }
        } catch (err: any) {
            console.error('Instructor Login Error:', err);
            setError(err.message || 'A network error occurred. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify2FACode = async (code: string) => {
        try {
            const res = await fetch(`${API_URL}/2fa/verify-login`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json' 
                },
                body: JSON.stringify({ email, code })
            });
            const data = await res.json();
            if (res.ok && data.token) {
                login(data.user || pendingAuthData?.user, data.token);
                setShow2FAModal(false);
                navigate('/instructor-dashboard');
            } else {
                throw new Error(data.message || 'Invalid verification code or recovery key');
            }
        } catch (err: any) {
            throw err;
        }
    };

    return (
        <div className="flex min-h-screen bg-white dark:bg-charcoal-900 overflow-hidden relative">
            {/* Left Panel - Login Form */}
            <div className="flex-1 flex flex-col justify-between p-8 md:p-16 bg-white dark:bg-charcoal-900 relative min-h-screen overflow-y-auto order-first">
                {/* Top Left back option */}
                <div className="hidden sm:block absolute top-8 left-8 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <Link to="/login" className="text-slate-900 dark:text-white font-bold underline underline-offset-4 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">Back to Student Login</Link>
                </div>

                <div className="w-full max-w-[420px] mx-auto my-auto py-12 animate-fade-in-up">
                    {/* Logo shown only on mobile */}
                    <div className="flex justify-center mb-8 lg:hidden">
                        <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-100 dark:border-white/5">
                            <img
                                src="/logo-v2.png"
                                alt="Layos Group LLC"
                                className="h-10 w-auto"
                            />
                        </div>
                    </div>

                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Instructor Portal</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Manage your courses, students, and curriculum in one place.</p>

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-2xl mb-6 text-sm font-bold shadow-sm animate-in slide-in-from-top-2">
                            <div className="flex items-center gap-3">
                                <AlertCircle size={18} />
                                <span className="flex-1">{error}</span>
                                <button
                                    onClick={() => { setError(null); setShowForceOption(false); }}
                                    className="bg-transparent border-none text-red-400 hover:text-red-600 dark:hover:text-red-300 cursor-pointer p-1 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            {showForceOption && (
                                <button
                                    onClick={() => handleLogin(null as any, true)}
                                    className="w-full mt-4 py-3 bg-red-600 text-white rounded-full font-black text-xs uppercase tracking-widest border-none cursor-pointer hover:bg-red-700 transition-colors"
                                >
                                    Sign out other devices & Enter
                                </button>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 ml-1">Instructor Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="email"
                                    className="w-full pl-12 pr-6 py-3.5 bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none text-sm font-bold focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                                    placeholder="Enter your work email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400">Password</label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-xs font-semibold text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1 bg-transparent border-none cursor-pointer transition-colors"
                                >
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            <div className="relative">
                                <Lock size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full pl-12 pr-6 py-3.5 bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none text-sm font-bold focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end px-1">
                            <Link to="/forgot-password" title="Forgot password" className="text-xs font-bold text-slate-500 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors underline underline-offset-4">Forget your password?</Link>
                        </div>

                        <button
                            type="submit"
                            className="group w-full py-4 bg-brand-charcoal hover:bg-black dark:bg-cyan-500 dark:text-brand-charcoal dark:hover:bg-cyan-400 text-white rounded-xl font-bold text-sm tracking-widest uppercase active:scale-[0.98] hover:scale-[1.01] transition-all disabled:opacity-70 disabled:pointer-events-none border-none cursor-pointer flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-3 justify-center">
                                    <Loader2 className="animate-spin" size={18} />
                                    <span>Authenticating...</span>
                                </div>
                            ) : (
                                <>
                                    <span>Login as Instructor</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center sm:hidden">
                        <Link to="/login" className="text-xs font-bold text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors underline underline-offset-4">
                            Back to Student Login
                        </Link>
                    </div>
                </div>

                <div className="w-full flex flex-col sm:flex-row justify-between pt-8 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 gap-4 mt-auto border-t border-slate-100 dark:border-white/5">
                    <div>© 2026 LGL Consulting. All rights reserved.</div>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>

            {/* Right Panel - Hero Visual */}
            <div
                className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 text-white overflow-hidden bg-cover bg-center order-last"
                style={{
                    backgroundImage: `url(${loginHero})`,
                }}
            >
                {/* Cyberpunk dark cyan grid overlay */}
                <div className="absolute inset-0 bg-charcoal-950/75 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(6,182,212,0.2),transparent_75%)] pointer-events-none" />

                {/* Top Content: White Logo Container */}
                <div className="relative z-10">
                    <div className="inline-flex items-center h-20 px-7 rounded-2xl bg-white shadow-lg shadow-black/20">
                        <img
                            src="/logo-v2.png"
                            alt="Layos Group LLC"
                            className="h-11 w-auto object-contain"
                        />
                    </div>
                </div>

                {/* Center/Bottom Content */}
                <div className="relative z-10 mt-auto space-y-8">
                    {/* Decorative Concept Bullet */}
                    <div className="w-6 h-6 rounded-full bg-white/90 shadow-md"></div>

                    <div className="space-y-4">
                        <h2 className="text-4xl font-extrabold tracking-tight leading-tight max-w-md">
                            Empower Your Students
                        </h2>
                        <p className="text-white/75 text-sm font-medium leading-relaxed max-w-sm">
                            Access advanced teaching tools, detailed student analytics, and curriculum management features designed for the modern educator.
                        </p>
                    </div>

                    {/* Floating Premium Badge */}
                    <div className="bg-white/10 backdrop-blur-xl p-4.5 rounded-2xl border border-white/20 shadow-xl inline-block max-w-[280px] mt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center text-xl shadow-inner">
                                <Star className="text-cyan-500 fill-cyan-500" size={18} />
                            </div>
                            <div className="pr-2">
                                <div className="font-extrabold text-[11px] uppercase tracking-wider text-white">Expert Panel</div>
                                <div className="text-[9px] font-bold text-white/60 uppercase tracking-widest mt-0.5">Empowering educators</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <TwoFactorChallengeModal
                isOpen={show2FAModal}
                email={email}
                onClose={() => setShow2FAModal(false)}
                onVerify={handleVerify2FACode}
            />
        </div>
    );
}
