import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
// Import images
import loginHero from '../../assets/login-hero.jpeg';



export default function StudentLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        login('student');
        navigate('/student-dashboard');
    };

    return (
        <div className="student-login-container">
            {/* Left Panel - Login Form */}
            <div className="login-left-panel">
                <div className="login-form-wrapper animate-fade-in-up">
                    <div className="login-logo-centered delay-100">
                        <img
                            src="/logo.png"
                            alt="Layos Group LLC"
                            className="login-logo-img"
                        />
                    </div>

                    <div className="login-header delay-200">
                        <h1>Welcome Back</h1>
                        <p>Enter your email and password to continue.</p>
                    </div>

                    <form onSubmit={handleLogin} className="delay-300">
                        <div className="login-form-group">
                            <label className="login-label">Email</label>
                            <input
                                type="email"
                                className="login-input"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="login-form-group">
                            <label className="login-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="login-input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                                        transform: 'translateY(-70%)',
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
                                    {showPassword ? (
                                        <EyeOff size={18} strokeWidth={2.5} />
                                    ) : (
                                        <Eye size={18} strokeWidth={2.5} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="form-options" style={{ justifyContent: 'flex-end' }}>
                            <Link to="/forgot-password" title="Forgot password" className="forgot-password-link">Forgot password</Link>
                        </div>

                        <button type="submit" className="login-btn-primary">
                            Sign In
                        </button>
                    </form>



                    <div className="login-register-prompt delay-400">
                        Don't have an account? <Link to="/register" className="login-register-link">Register</Link>
                    </div>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }} className="delay-500">
                        <Link to="/instructor-login" className="instructor-link-modern">
                            Continue as an instructor
                        </Link>
                    </div>

                </div>

                <div className="login-bottom-info animate-fade-in-up delay-500">
                    <div>© 2026 Layos Group LLC. All rights reserved.</div>
                    <div className="login-bottom-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Term & Condition</a>
                    </div>
                </div>
            </div>

            {/* Right Panel - Hero Content */}
            <div className="login-right-panel">
                <div className="dashboard-preview-wrapper">
                    <img
                        src={loginHero}
                        alt="Dashboard Preview"
                        className="dashboard-preview-img animate-fade-in-up"
                    />

                    {/* Floating Premium Badge */}
                    <div
                        className="animate-fade-in-up delay-300"
                        style={{
                            position: 'absolute',
                            bottom: '20%',
                            right: '-5%',
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(12px)',
                            padding: '1rem 1.5rem',
                            borderRadius: '1.25rem',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                            zIndex: 10
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '40px', height: '40px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>⭐</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'white' }}>Elite Platform</div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Join 5,000+ students</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hero-text-content animate-fade-in-up delay-400">
                    <h2>Transform Learning into Skills</h2>
                    <p>Make informed decisions with Layos's powerful analytics tools. Harness the power of data to drive your learning journey forward.</p>
                </div>
            </div>
        </div>
    );
}

