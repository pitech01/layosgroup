import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ArrowLeft, Star, Lock } from 'lucide-react';
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
        <div className="flex min-h-screen bg-brand-beige overflow-hidden">
            {/* Left Panel - Recover Flow */}
            <div className="flex-1 flex flex-col p-8 md:p-16 bg-white dark:bg-brand-charcoal relative overflow-hidden items-center justify-center">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-brand-emerald/5 rounded-full pointer-events-none" />

                <div className="w-full max-w-[400px] animate-fade-in-up">
                    <div className="flex justify-center mb-10">
                        <img
                            src="/logo.png"
                            alt="Layos Group LLC"
                            className="h-12 w-auto"
                        />
                    </div>

                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4">
                            <div className="text-center mb-10">
                                <h1 className="text-3xl font-black text-brand-charcoal dark:text-white mb-2">Forgot Password?</h1>
                                <p className="text-brand-muted font-medium">No worries, we'll send you reset instructions.</p>
                            </div>
                            <form onSubmit={handleSendCode} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-brand-charcoal dark:text-white uppercase tracking-widest ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        className="w-full px-5 py-3.5 bg-brand-beige/50 dark:bg-white/5 border border-brand-border rounded-2xl text-brand-charcoal dark:text-white outline-none text-sm font-bold focus:border-brand-emerald transition-all"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="w-full py-4 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-brand-charcoal/20 hover:-translate-y-1 transition-all disabled:opacity-70 border-none cursor-pointer" disabled={loading}>
                                    {loading ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'Send Reset Code'}
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4">
                            <div className="text-center mb-10">
                                <h1 className="text-3xl font-black text-brand-charcoal dark:text-white mb-2">Verify Code</h1>
                                <p className="text-brand-muted font-medium">We've sent a 6-digit code to <strong className="text-brand-charcoal dark:text-white">{email}</strong>.</p>
                            </div>
                            <form onSubmit={handleVerifyCode} className="space-y-8">
                                <div className="flex gap-2 justify-center">
                                    {code.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            id={`code-${idx}`}
                                            type="text"
                                            value={digit}
                                            onChange={(e) => handleCodeChange(idx, e.target.value)}
                                            className="w-12 h-14 md:w-14 md:h-16 text-center text-xl font-black bg-brand-beige/50 dark:bg-white/5 border border-brand-border rounded-xl text-brand-charcoal dark:text-white outline-none focus:border-brand-emerald focus:ring-4 focus:ring-brand-emerald/10 transition-all"
                                            maxLength={1}
                                            required
                                        />
                                    ))}
                                </div>
                                <button type="submit" className="w-full py-4 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-brand-charcoal/20 hover:-translate-y-1 transition-all disabled:opacity-70 border-none cursor-pointer" disabled={loading}>
                                    {loading ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'Verify Code'}
                                </button>
                                
                                <div className="text-center">
                                    <p className="text-xs font-bold text-brand-muted uppercase tracking-widest">
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
                            <div className="text-center mb-10">
                                <h1 className="text-3xl font-black text-brand-charcoal dark:text-white mb-2">Set New Password</h1>
                                <p className="text-brand-muted font-medium">Create a strong password to secure your account.</p>
                            </div>
                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-brand-charcoal dark:text-white uppercase tracking-widest ml-1">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="w-full px-5 py-3.5 bg-brand-beige/50 dark:bg-white/5 border border-brand-border rounded-2xl text-brand-charcoal dark:text-white outline-none text-sm font-bold focus:border-brand-emerald transition-all pr-14"
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
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
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-brand-charcoal dark:text-white uppercase tracking-widest ml-1">Confirm New Password</label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full px-5 py-3.5 bg-brand-beige/50 dark:bg-white/5 border border-brand-border rounded-2xl text-brand-charcoal dark:text-white outline-none text-sm font-bold focus:border-brand-emerald transition-all"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="w-full py-4 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-brand-charcoal/20 hover:-translate-y-1 transition-all disabled:opacity-70 border-none cursor-pointer" disabled={loading}>
                                    {loading ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'Reset Password'}
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="mt-12 text-center">
                        <Link to="/login" className="flex items-center justify-center gap-2 text-xs font-black text-brand-muted hover:text-brand-charcoal transition-colors uppercase tracking-widest group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Login
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
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(5,150,105,0.15),transparent_70%)] pointer-events-none" />
                
                <div className="relative z-10 w-full flex flex-col items-center">
                    <div className="relative w-full max-w-[500px] perspective-1000">
                        <img
                            src={loginHero}
                            alt="Security Hero"
                            className="w-full h-auto rounded-[32px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10 transform rotate-y-12 rotate-x-6 translate-z-10 hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-1000 ease-out"
                        />

                        {/* Floating Security Badge */}
                        <div className="absolute top-[20%] -right-10 bg-white/10 backdrop-blur-xl p-5 rounded-[24px] border border-white/20 shadow-2xl animate-fade-in-up">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-brand-emerald/20 rounded-full flex items-center justify-center text-2xl shadow-inner">
                                    <Lock className="text-brand-emerald" size={24} />
                                </div>
                                <div className="pr-4">
                                    <div className="font-black text-sm uppercase tracking-widest">Enhanced Security</div>
                                    <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-0.5">256-bit Encryption</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-20 text-center max-w-lg animate-fade-in-up delay-500">
                        <h2 className="text-4xl font-black mb-6 leading-tight">Secure Your Journey</h2>
                        <p className="text-lg text-white/70 font-medium leading-relaxed">Safety first. Reset your password to keep your learning progress and personal data protected.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
