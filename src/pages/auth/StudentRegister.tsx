import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, X, Eye, EyeOff } from 'lucide-react';
import loginHero from '../../assets/login-hero.jpeg';

export default function StudentRegister() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        country: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        gender: '',
        levelOfEducation: '',
        receiveOn: '',
        password: '',
        confirmPassword: '',
        agreedToTerms: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    name: `${formData.firstName} ${formData.lastName}`, // Combine for backend User model
                    password_confirmation: formData.confirmPassword,
                    role: 'student'
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed. Please try again.');
            }

            // Successful registration
            login(data.user, data.token);
            navigate('/student/dashboard');
        } catch (err: any) {
            console.error('Registration Error:', err);
            setError(err.message || 'A network error occurred. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const prevStep = () => {
        setStep(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="student-login-container">
            {/* Left Panel - Registration Flow */}
            <div className="login-left-panel" style={{ overflowY: 'auto', display: 'block' }}>
                <div className="login-form-wrapper animate-fade-in-up" style={{ maxWidth: '600px', margin: '4rem auto' }}>
                    <div className="login-logo-centered delay-100">
                        <img
                            src="/logo.png"
                            alt="Layos Group LLC"
                            className="login-logo-img"
                        />
                    </div>

                    {step === 1 ? (
                        <div className="animate-fade-in-up">
                            <div className="login-header delay-200" style={{ textAlign: 'left', marginBottom: '3rem' }}>
                                <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Become a job-ready project scheduler in 8 weeks</h1>
                                <p style={{ fontSize: '1.2rem', lineHeight: '1.6', color: '#475569', marginBottom: '2.5rem' }}>
                                    Everything you need for project management with intense support. No matter your background or experience, this course is designed for you.
                                </p>

                                <div className="student-reg-hero-grid">
                                    {[
                                        { title: 'Primavera P6 (Hands-On)', icon: '📊', color: '#eff6ff' },
                                        { title: 'Microsoft Project (MSP)', icon: '💻', color: '#f0fdf4' },
                                        { title: 'Smartsheet', icon: '📋', color: '#fff7ed' },
                                        { title: 'Resource Planning & Cost Loading', icon: '📉', color: '#faf5ff' },
                                        { title: 'Earned Value Management (SPI/CPI)', icon: '📈', color: '#fdf2f2' },
                                        { title: 'Schedule Analysis & Reporting', icon: '📄', color: '#f0f9ff' }
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: item.color, borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                            <span style={{ fontSize: '1.75rem' }}>{item.icon}</span>
                                            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>{item.title}</span>
                                        </div>
                                    ))}
                                </div>


                                <button
                                    onClick={nextStep}
                                    className="login-btn-primary"
                                    style={{ height: '60px', fontSize: '1.1rem', marginTop: '1rem' }}
                                >
                                    Proceed to Registration
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in-up">
                            <button
                                onClick={prevStep}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#64748b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    cursor: 'pointer',
                                    marginBottom: '2rem',
                                    fontWeight: 600,
                                    fontSize: '0.9rem'
                                }}
                            >
                                ← Back to Course Overview
                            </button>

                            <div className="login-header" style={{ textAlign: 'left', marginBottom: '2.5rem' }}>
                                <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Student Information</h2>
                                <p style={{ color: '#64748b' }}>Please fill in the details below to complete your registration.</p>
                            </div>

                            {error && (
                                <div className="animate-slide-in" style={{
                                    padding: '1rem 1.25rem',
                                    background: '#fff1f2',
                                    border: '1px solid #ffe4e6',
                                    color: '#e11d48',
                                    borderRadius: '16px',
                                    marginBottom: '1.5rem',
                                    fontSize: '0.95rem',
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.08)'
                                }}>
                                    <AlertCircle size={20} strokeWidth={2.5} />
                                    <span style={{ flex: 1 }}>{error}</span>
                                    <button
                                        onClick={() => setError(null)}
                                        style={{ background: 'none', border: 'none', color: '#fb7185', cursor: 'pointer', display: 'flex', padding: '4px' }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}

                            <form onSubmit={handleRegister}>
                                <div className="form-responsive-grid">
                                    <div className="login-form-group">
                                        <label className="login-label">First Name *</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            className="login-input"
                                            placeholder="First Name"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="login-form-group">
                                        <label className="login-label">Last Name *</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            className="login-input"
                                            placeholder="Last Name"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>


                                <div className="login-form-group">
                                    <label className="login-label">Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        className="login-input"
                                        placeholder="Enter your phone number"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="login-form-group">
                                    <label className="login-label">Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="login-input"
                                        placeholder="Enter your email address"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="login-form-group">
                                    <label className="login-label">Choose Country</label>
                                    <select
                                        name="country"
                                        className="login-input"
                                        value={formData.country}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Country</option>
                                        <option value="US">United States</option>
                                        <option value="NG">Nigeria</option>
                                        <option value="GB">United Kingdom</option>
                                        <option value="CA">Canada</option>
                                        <option value="AU">Australia</option>
                                    </select>
                                </div>

                                <div className="login-form-group">
                                    <label className="login-label">Address Line 1 *</label>
                                    <input
                                        type="text"
                                        name="addressLine1"
                                        className="login-input"
                                        placeholder="Address Line 1"
                                        value={formData.addressLine1}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="login-form-group">
                                    <label className="login-label">Address Line 2</label>
                                    <input
                                        type="text"
                                        name="addressLine2"
                                        className="login-input"
                                        placeholder="Address Line 2"
                                        value={formData.addressLine2}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-responsive-grid">
                                    <div className="login-form-group">
                                        <label className="login-label">City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            className="login-input"
                                            placeholder="City"
                                            value={formData.city}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="login-form-group">
                                        <label className="login-label">State *</label>
                                        <input
                                            type="text"
                                            name="state"
                                            className="login-input"
                                            placeholder="State"
                                            value={formData.state}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>


                                <div className="form-responsive-grid">
                                    <div className="login-form-group">
                                        <label className="login-label">Zip Code *</label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            className="login-input"
                                            placeholder="Zip Code"
                                            value={formData.zipCode}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="login-form-group">
                                        <label className="login-label">Gender *</label>
                                        <select
                                            name="gender"
                                            className="login-input"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>


                                <div className="login-form-group">
                                    <label className="login-label">Level of Education *</label>
                                    <select
                                        name="levelOfEducation"
                                        className="login-input"
                                        value={formData.levelOfEducation}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Level</option>
                                        <option value="High School">High School</option>
                                        <option value="Bachelors">Bachelors Degree</option>
                                        <option value="Masters">Masters Degree</option>
                                        <option value="PhD">PhD</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="login-form-group">
                                    <label className="login-label">Would like to receive on *</label>
                                    <select
                                        name="receiveOn"
                                        className="login-input"
                                        value={formData.receiveOn}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Platform</option>
                                        <option value="WhatsApp">WhatsApp</option>
                                        <option value="Telegram">Telegram</option>
                                        <option value="SMS">SMS</option>
                                        <option value="Email">Email</option>
                                    </select>
                                </div>

                                <div className="form-options" style={{ justifyContent: 'flex-start', gap: '0.5rem', alignItems: 'flex-start' }}>
                                    <input
                                        type="checkbox"
                                        name="agreedToTerms"
                                        id="agreedToTerms"
                                        checked={formData.agreedToTerms}
                                        onChange={handleChange}
                                        required
                                        style={{ width: 'auto', marginBottom: 0, marginTop: '2px' }}
                                    />
                                    <label htmlFor="agreedToTerms" className="login-label" style={{ fontSize: '0.8rem', cursor: 'pointer' }}>
                                        I have read and agree to the <Link to="/terms" style={{ color: '#3b82f6' }}>Terms of service</Link> and <Link to="/privacy" style={{ color: '#3b82f6' }}>Privacy Policy</Link>
                                    </label>
                                </div>

                                <div className="form-responsive-grid" style={{ marginTop: '1.5rem' }}>
                                    <div className="login-form-group">
                                        <label className="login-label">Password *</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                className="login-input"
                                                placeholder="Create password"
                                                style={{ paddingRight: '2.5rem' }}
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
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
                                                    padding: '4px',
                                                    zIndex: 10
                                                }}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="login-form-group">
                                        <label className="login-label">Confirm Password *</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                className="login-input"
                                                placeholder="Repeat password"
                                                style={{ paddingRight: '2.5rem' }}
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                                                    padding: '4px',
                                                    zIndex: 10
                                                }}
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>


                                <button type="submit" className="login-btn-primary" style={{ marginTop: '1.5rem' }} disabled={loading}>
                                    {loading ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                            <div style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                                            <span>Processing...</span>
                                        </div>
                                    ) : (
                                        'Register or be Renewed'
                                    )}
                                </button>
                                <style>{`
                                    .student-reg-hero-grid {
                                        max-width: 1100px;
                                        margin: 0 auto 2.5rem auto;
                                        display: grid;
                                        grid-template-columns: 1.2fr 1fr;
                                        gap: 2rem;
                                        align-items: center;
                                    }
                                    .form-responsive-grid {
                                        display: grid;
                                        grid-template-columns: 1fr 1fr;
                                        gap: 1rem;
                                    }
                                    @media (max-width: 768px) {
                                        .student-reg-hero-grid, .form-responsive-grid {
                                            grid-template-columns: 1fr;
                                        }
                                        .student-reg-hero-grid {
                                            gap: 1rem;
                                        }
                                    }
                                    @keyframes spin {
                                        to { transform: rotate(360deg); }
                                    }
                                `}</style>
                            </form>
                        </div>
                    )}

                    <div className="login-register-prompt delay-400">
                        Already have an account? <Link to="/login" className="login-register-link">Login</Link>
                    </div>
                </div>

                <div className="login-bottom-info animate-fade-in-up delay-500" style={{ padding: '2rem' }}>
                    <div>© 2026 Layos Group LLC. All rights reserved.</div>
                    <div className="login-bottom-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Term & Condition</a>
                    </div>
                </div>
            </div>

            {/* Right Panel - Hero Content */}
            <div className="login-right-panel" style={{ height: '100vh', position: 'sticky', top: 0 }}>
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
                    <h2>Become a Professional</h2>
                    <p>Unlock your potential with our comprehensive training programs. From project management to technical skills, we have you covered.</p>
                </div>
            </div>
        </div>
    );
}
