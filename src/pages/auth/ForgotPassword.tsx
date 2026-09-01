import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ArrowLeft, ArrowRight, Mail, Lock } from 'lucide-react';
import loginHero from '../../assets/login-hero.jpeg';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                setStep(2);
            } else {
                toast.error(data.message || 'Something went wrong');
            }
        } catch {
            toast.error('Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/verify-reset-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: code.join('') })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                setStep(3);
            } else {
                toast.error(data.message || 'Invalid code');
            }
        } catch {
            toast.error('Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email, 
                    code: code.join(''),
                    password: newPassword,
                    password_confirmation: confirmPassword
                })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                navigate('/login');
            } else {
                toast.error(data.message || 'Reset failed');
            }
        } catch {
            toast.error('Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleCodeChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`code-${index + 1}`);
            nextInput?.focus();
        }
    };

    return (
        <div className="flex min-h-screen bg-white dark:bg-charcoal-900 overflow-hidden relative">
            {/* Left Panel - Hero Visual */}
            <div
                className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 text-white overflow-hidden bg-cover bg-center"
                style={{
                    backgroundImage: `url(${loginHero})`,
                }}
            >
                {/* Cyberpunk dark cyan grid overlay */}
                <div className="absolute inset-0 bg-charcoal-950/75 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,217,233,0.2),transparent_75%)] pointer-events-none" />

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
                            Secure Your <br />Learning Journey
                        </h2>
                        <p className="text-white/75 text-sm font-medium leading-relaxed max-w-sm">
                            Safety first. Reset your password in a few quick steps to keep your progress and personal data protected.
                        </p>
                    </div>

                    {/* Floating Premium Badge */}
                    <div className="bg-white/10 backdrop-blur-xl p-4.5 rounded-2xl border border-white/20 shadow-xl inline-block max-w-[280px] mt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-brand-emerald/20 rounded-full flex items-center justify-center text-xl shadow-inner">
                                <Lock className="text-brand-emerald" size={18} />
                            </div>
                            <div className="pr-2">
                                <div className="font-extrabold text-[11px] uppercase tracking-wider text-white">Enhanced Security</div>
                                <div className="text-[9px] font-bold text-white/60 uppercase tracking-widest mt-0.5">256-bit Encryption</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Recovery Form */}
            <div className="flex-1 flex flex-col justify-between p-8 md:p-16 bg-white dark:bg-charcoal-900 relative min-h-screen overflow-y-auto">
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

                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4">
                            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Forgot Password?</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">No worries, we'll send you reset instructions.</p>
                            <form onSubmit={handleSendCode} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        <input
                                            type="email"
                                            className="w-full pl-12 pr-6 py-3.5 bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none text-sm font-bold focus:border-brand-emerald focus:ring-4 focus:ring-brand-emerald/10 transition-all"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="group w-full py-4 bg-brand-charcoal hover:bg-black dark:bg-brand-emerald dark:hover:bg-cyan-400 text-white rounded-xl font-bold text-sm tracking-widest uppercase active:scale-[0.98] hover:scale-[1.01] transition-all disabled:opacity-70 disabled:pointer-events-none border-none cursor-pointer flex items-center justify-center gap-2" disabled={loading}>
                                    {loading ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <>
                                            <span>Send Reset Code</span>
                                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4">
                            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Verify Code</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">We've sent a 6-digit code to <strong className="text-slate-900 dark:text-white">{email}</strong>.</p>
                            <form onSubmit={handleVerifyCode} className="space-y-8">
                                <div className="flex gap-2 justify-center">
                                    {code.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            id={`code-${idx}`}
                                            type="text"
                                            value={digit}
                                            onChange={(e) => handleCodeChange(idx, e.target.value)}
                                            className="w-12 h-14 md:w-14 md:h-16 text-center text-xl font-black bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-brand-emerald focus:ring-4 focus:ring-brand-emerald/10 transition-all"
                                            maxLength={1}
                                            required
                                        />
                                    ))}
                                </div>
                                <button type="submit" className="group w-full py-4 bg-brand-charcoal hover:bg-black dark:bg-brand-emerald dark:hover:bg-cyan-400 text-white rounded-xl font-bold text-sm tracking-widest uppercase active:scale-[0.98] hover:scale-[1.01] transition-all disabled:opacity-70 disabled:pointer-events-none border-none cursor-pointer flex items-center justify-center gap-2" disabled={loading}>
                                    {loading ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <>
                                            <span>Verify Code</span>
                                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>

                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        Didn't receive the code?{' '}
                                        <button
                                            type="button"
                                            onClick={handleSendCode}
                                            disabled={loading}
                                            className="bg-transparent border-none text-brand-emerald font-black cursor-pointer hover:underline underline-offset-4 uppercase ml-1"
                                        >
                                            Resend
                                        </button>
                                    </p>
                                </div>
                            </form>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4">
                            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Set New Password</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Create a strong password to secure your account.</p>
                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 ml-1">New Password</label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="w-full pl-12 pr-14 py-3.5 bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none text-sm font-bold focus:border-brand-emerald focus:ring-4 focus:ring-brand-emerald/10 transition-all"
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-brand-emerald bg-transparent border-none cursor-pointer transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 ml-1">Confirm New Password</label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="w-full pl-12 pr-6 py-3.5 bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none text-sm font-bold focus:border-brand-emerald focus:ring-4 focus:ring-brand-emerald/10 transition-all"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="group w-full py-4 bg-brand-charcoal hover:bg-black dark:bg-brand-emerald dark:hover:bg-cyan-400 text-white rounded-xl font-bold text-sm tracking-widest uppercase active:scale-[0.98] hover:scale-[1.01] transition-all disabled:opacity-70 disabled:pointer-events-none border-none cursor-pointer flex items-center justify-center gap-2" disabled={loading}>
                                    {loading ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <>
                                            <span>Reset Password</span>
                                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <Link to="/login" className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-brand-emerald transition-colors uppercase tracking-widest group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Login
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
        </div>
    );
}
