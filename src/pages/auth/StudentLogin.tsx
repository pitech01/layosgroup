import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, X, Star, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import loginHero from '../../assets/login-hero.jpeg';

export default function StudentLogin() {
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
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    email, 
                    password, 
                    role: 'student',
                    force: isForce 
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 423 && data.action_required === 'confirm_force_login') {
                    setShowForceOption(true);
                }
                throw new Error(data.message || 'Login failed. Please verify your credentials.');
            }

            login(data.user, data.token);
            navigate('/student/dashboard');
        } catch (err: any) {
            console.error('Student Login Error:', err);
            setError(err.message || 'A network error occurred. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-brand-beige overflow-hidden">
            {/* Left Panel - Login Form */}
            <div className="flex-1 flex flex-col p-8 md:p-16 bg-white dark:bg-brand-charcoal relative overflow-hidden items-center justify-center">
                {/* Decorative background element */}
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-brand-emerald/5 rounded-full pointer-events-none" />

                <div className="w-full max-w-[400px] animate-fade-in-up">
                    <div className="flex justify-center mb-10">
                        <img
                            src="/logo.png"
                            alt="Layos Group LLC"
                            className="h-12 w-auto"
                        />
                    </div>

                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-brand-charcoal dark:text-white mb-2">Welcome Back</h1>
                        <p className="text-brand-muted font-medium">Enter your credentials to access your learning portal.</p>
                    </div>

                    {error && (
                        <div className="p-5 bg-red-50 border border-red-100 text-red-600 rounded-[20px] mb-6 text-sm font-bold shadow-sm animate-in slide-in-from-top-2">
                            <div className="flex items-center gap-3">
                                <AlertCircle size={20} />
                                <span className="flex-1">{error}</span>
                                <button
                                    onClick={() => { setError(null); setShowForceOption(false); }}
                                    className="bg-transparent border-none text-red-400 hover:text-red-600 cursor-pointer p-1 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {showForceOption && (
                                <button
                                    onClick={() => handleLogin(null as any, true)}
                                    className="w-full mt-4 py-3 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest border-none cursor-pointer hover:bg-red-700 transition-colors"
                                >
                                    Sign out other devices & Enter
                                </button>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-xs font-black text-brand-charcoal dark:text-white uppercase tracking-widest ml-1">Email Address</label>
                            <input
                                type="email"
                                className="w-full px-5 py-3.5 bg-brand-beige/50 dark:bg-white/5 border border-brand-border rounded-2xl text-brand-charcoal dark:text-white outline-none text-sm font-bold focus:border-brand-emerald focus:ring-4 focus:ring-brand-emerald/10 transition-all"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-black text-brand-charcoal dark:text-white uppercase tracking-widest ml-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full px-5 py-3.5 bg-brand-beige/50 dark:bg-white/5 border border-brand-border rounded-2xl text-brand-charcoal dark:text-white outline-none text-sm font-bold focus:border-brand-emerald focus:ring-4 focus:ring-brand-emerald/10 transition-all pr-14"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-brand-muted hover:text-brand-emerald bg-transparent border-none cursor-pointer transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Link to="/forgot-password" title="Forgot password" className="text-xs font-black text-brand-charcoal dark:text-white hover:text-brand-emerald transition-colors uppercase tracking-widest">Forgot password?</Link>
                        </div>

                        <button 
                            type="submit" 
                            className="w-full py-4 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-brand-charcoal/20 dark:shadow-brand-emerald/20 hover:-translate-y-1 active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none border-none cursor-pointer"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-3 justify-center">
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Authenticating...</span>
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link to="/instructor-login" className="text-xs font-black text-brand-muted hover:text-brand-emerald transition-colors uppercase tracking-[0.15em] flex items-center justify-center gap-2">
                            Are you an instructor? <span className="text-brand-emerald underline underline-offset-4">Continue here</span>
                        </Link>
                    </div>
                </div>

                <div className="mt-auto w-full flex flex-col md:flex-row justify-between pt-8 text-[10px] font-black uppercase tracking-widest text-brand-muted gap-4">
                    <div>© 2026 Layos Group LLC. All rights reserved.</div>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-brand-charcoal transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-brand-charcoal transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>

            {/* Right Panel - Hero Content */}
            <div className="hidden lg:flex flex-1 bg-brand-charcoal relative flex-col p-16 text-white overflow-hidden justify-center items-center">
                {/* Decorative radial gradient */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(5,150,105,0.15),transparent_70%)] pointer-events-none" />
                
                <div className="relative z-10 w-full flex flex-col items-center">
                    <div className="relative w-full max-w-[500px] perspective-1000">
                        <img
                            src={loginHero}
                            alt="Dashboard Preview"
                            className="w-full h-auto rounded-[32px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10 transform -rotate-y-12 rotate-x-6 translate-z-10 hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-1000 ease-out"
                        />

                        {/* Floating Premium Badge */}
                        <div className="absolute bottom-[10%] -right-10 bg-white/10 backdrop-blur-xl p-5 rounded-[24px] border border-white/20 shadow-2xl animate-fade-in-up delay-300">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-brand-emerald/20 rounded-full flex items-center justify-center text-2xl shadow-inner">
                                    <Star className="text-brand-emerald fill-brand-emerald" size={24} />
                                </div>
                                <div className="pr-4">
                                    <div className="font-black text-sm uppercase tracking-widest">Elite Platform</div>
                                    <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-0.5">Join 5,000+ Students</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-20 text-center max-w-lg animate-fade-in-up delay-500">
                        <h2 className="text-4xl font-black mb-6 leading-tight">Transform Learning <br/>Into Marketable Skills</h2>
                        <p className="text-lg text-white/70 font-medium leading-relaxed">Harness the power of data-driven analytics and expert-led curriculum to accelerate your professional journey.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
