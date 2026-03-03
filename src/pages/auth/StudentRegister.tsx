import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
        agreedToTerms: false
    });
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

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        // Here we would typically call an API to register the user
        // For now, we'll just log them in as a student
        login('student');
        navigate('/student/dashboard');
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

                                <div className="responsive-two-col" style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '2rem', alignItems: 'center' }}>
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

                            <form onSubmit={handleRegister}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

                                <button type="submit" className="login-btn-primary" style={{ marginTop: '1.5rem' }}>
                                    Register or be Renewed
                                </button>
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
