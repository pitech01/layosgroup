import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
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
        <div className="student-login-container">
            <div className="login-left-panel">
                <div className="login-form-wrapper animate-fade-in-up">
                    <div className="login-logo-centered delay-100">
                        <img src="/logo.png" alt="Layos Group" className="login-logo-img" />
                    </div>

                    {step === 1 && (
                        <div className="delay-200">
                            <div className="login-header">
                                <h1>Forgot Password?</h1>
                                <p>No worries, we'll send you reset instructions.</p>
                            </div>
                            <form onSubmit={handleSendCode}>
                                <div className="login-form-group">
                                    <label className="login-label">Email</label>
                                    <input
                                        type="email"
                                        className="login-input"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="login-btn-primary" disabled={loading}>
                                    {loading ? <Loader2 size={20} className="animate-spin" /> : 'Send Reset Code'}
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="delay-200">
                            <div className="login-header">
                                <h1>Verify Code</h1>
                                <p>We've sent a 6-digit code to <strong>{email}</strong>.</p>
                            </div>
                            <form onSubmit={handleVerifyCode}>
                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '2rem' }}>
                                    {code.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            id={`code-${idx}`}
                                            type="text"
                                            value={digit}
                                            onChange={(e) => handleCodeChange(idx, e.target.value)}
                                            className="login-input"
                                            style={{ width: '3.5rem', textAlign: 'center', padding: '0.75rem 0' }}
                                            maxLength={1}
                                            required
                                        />
                                    ))}
                                </div>
                                <button type="submit" className="login-btn-primary" disabled={loading}>
                                    {loading ? <Loader2 size={20} className="animate-spin" /> : 'Verify Code'}
                                </button>
                                
                                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                        Didn't receive the code?{' '}
                                        <button 
                                            type="button" 
                                            onClick={handleSendCode} 
                                            disabled={loading}
                                            style={{ 
                                                background: 'none', 
                                                border: 'none', 
                                                color: '#1e293b', 
                                                fontWeight: 700, 
                                                cursor: 'pointer',
                                                textDecoration: 'underline'
                                            }}
                                        >
                                            Resend Code
                                        </button>
                                    </p>
                                </div>
                            </form>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="delay-200">
                            <div className="login-header">
                                <h1>Set New Password</h1>
                                <p>Must be at least 8 characters.</p>
                            </div>
                            <form onSubmit={handleResetPassword}>
                                <div className="login-form-group">
                                    <label className="login-label">New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="login-input"
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            style={{ paddingRight: '4rem' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                position: 'absolute',
                                                right: '0.75rem',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#94a3b8',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '0.5rem',
                                                borderRadius: '0.5rem',
                                                transition: 'all 0.2s',
                                                zIndex: 10
                                            }}
                                        >
                                            {showPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="login-form-group">
                                    <label className="login-label">Confirm Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="login-input"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            style={{ paddingRight: '4rem' }}
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="login-btn-primary" disabled={loading}>
                                    {loading ? <Loader2 size={20} className="animate-spin" /> : 'Reset Password'}
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="login-register-prompt delay-400" style={{ marginTop: '2rem' }}>
                        <Link to="/login" className="login-register-link">← Back to Login</Link>
                    </div>
                </div>
            </div>

            <div className="login-right-panel">
                <div className="dashboard-preview-wrapper">
                    <img src={loginHero} alt="Hero" className="dashboard-preview-img animate-fade-in-up" />
                </div>
                <div className="hero-text-content animate-fade-in-up delay-400">
                    <h2>Secure Your Journey</h2>
                    <p>Safety first. Reset your password to keep your learning progress and personal data protected.</p>
                </div>
            </div>
        </div>
    );
}
