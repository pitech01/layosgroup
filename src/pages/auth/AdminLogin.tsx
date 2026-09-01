import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, X, Loader2, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { TwoFactorChallengeModal } from '../../components/auth/TwoFactorChallengeModal';
import '../../components/layouts/staff.css';

export default function AdminLogin() {
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

    const handleLogin = async (e: React.FormEvent | null, isForce: boolean = false) => {
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
                    role: 'admin',
                    force: isForce
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 423 && data.action_required === 'confirm_force_login') {
                    setShowForceOption(true);
                }
                throw new Error(data.message || 'Access Denied: Administrative credentials invalid.');
            }

            if (data.two_factor_required || data.user?.two_factor_enabled) {
                setPendingAuthData({ user: data.user, token: data.token });
                setShow2FAModal(true);
            } else {
                login(data.user, data.token);
                navigate('/admin-dashboard');
            }
        } catch (err: any) {
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
                navigate('/admin-dashboard');
            } else {
                throw new Error(data.message || 'Invalid verification code or recovery key');
            }
        } catch (err: any) {
            throw err;
        }
    };

    return (
        <div
            className="flex items-center justify-center min-h-screen p-6 relative overflow-hidden"
            style={{
                background: 'radial-gradient(circle at top right, var(--lgl-charcoal), #05070a)',
            }}
        >
            {/* Subtle red admin-accent glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--lgl-error) 12%, transparent), transparent 60%)' }}
            />

            <div className="w-full max-w-[440px] relative z-10 animate-fade-in-up">
                <div className="flex justify-center mb-8">
                    <div className="bg-white p-3 rounded-2xl shadow-lg">
                        <img src="/logo-v2.png" alt="Layos Group LLC" className="h-9 w-auto" />
                    </div>
                </div>

                <div
                    className="rounded-3xl p-8 md:p-10 shadow-2xl"
                    style={{
                        background: 'color-mix(in srgb, white 6%, transparent)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid color-mix(in srgb, var(--lgl-error) 25%, transparent)',
                    }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'color-mix(in srgb, var(--lgl-error) 18%, transparent)', color: 'var(--lgl-error)' }}
                        >
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-white tracking-tight m-0">Admin Console</h1>
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm mb-8 m-0">Restricted access &mdash; system administration only.</p>

                    {error && (
                        <div className="p-4 rounded-2xl mb-6 text-sm font-bold shadow-sm" style={{ background: 'color-mix(in srgb, var(--lgl-error) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--lgl-error) 30%, transparent)', color: '#fca5a5' }}>
                            <div className="flex items-center gap-3">
                                <AlertCircle size={18} />
                                <span className="flex-1">{error}</span>
                                <button
                                    onClick={() => { setError(null); setShowForceOption(false); }}
                                    className="bg-transparent border-none text-red-300 hover:text-red-100 cursor-pointer p-1 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            {showForceOption && (
                                <button
                                    onClick={() => handleLogin(null, true)}
                                    className="w-full mt-4 py-3 rounded-full font-black text-xs uppercase tracking-widest border-none cursor-pointer transition-colors"
                                    style={{ background: 'var(--lgl-error)', color: 'white' }}
                                >
                                    Sign out other devices & enter
                                </button>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-xs font-extrabold text-slate-400 ml-1 uppercase tracking-wide">Admin Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                <input
                                    type="email"
                                    className="w-full pl-12 pr-5 py-3.5 rounded-xl text-white outline-none text-sm font-bold transition-all"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                                    placeholder="admin@layosgroupllc.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wide">Password</label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-xs font-semibold text-slate-500 hover:text-slate-300 flex items-center gap-1 bg-transparent border-none cursor-pointer transition-colors"
                                >
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            <div className="relative">
                                <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="w-full pl-12 pr-5 py-3.5 rounded-xl text-white outline-none text-sm font-bold transition-all"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end px-1">
                            <Link to="/forgot-password" className="text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-4">Forgot your password?</Link>
                        </div>

                        <button
                            type="submit"
                            className="group w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase active:scale-[0.98] hover:scale-[1.01] transition-all disabled:opacity-70 disabled:pointer-events-none border-none cursor-pointer flex items-center justify-center gap-2"
                            style={{ background: 'var(--lgl-error)', color: 'white' }}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-3 justify-center">
                                    <Loader2 className="animate-spin" size={18} />
                                    Authenticating...
                                </span>
                            ) : (
                                <>
                                    <span>Login as Admin</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 flex justify-center gap-6 text-xs font-bold" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        <Link to="/login" className="text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-4">Student Login</Link>
                        <Link to="/instructor-login" className="text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-4">Instructor Login</Link>
                    </div>
                </div>

                <p className="text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest mt-6">
                    &copy; 2026 LGL Consulting. All rights reserved.
                </p>
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
