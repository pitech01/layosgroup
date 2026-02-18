import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import loginHero from '../../assets/login-hero.jpeg';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSendCode = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
    };

    const handleVerifyCode = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(3);
    };

    const handleResetPassword = (e: React.FormEvent) => {
        e.preventDefault();
        navigate('/login');
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
                                <button type="submit" className="login-btn-primary">Send Reset Code</button>
                            </form>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="delay-200">
                            <div className="login-header">
                                <h1>Verify Code</h1>
                                <p>We've sent a 6-digit code to your email.</p>
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
                                <button type="submit" className="login-btn-primary">Verify Code</button>
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
                                <button type="submit" className="login-btn-primary">Reset Password</button>
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
