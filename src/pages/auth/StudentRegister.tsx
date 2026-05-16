import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, X, Eye, EyeOff, Star, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
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
                    name: `${formData.firstName} ${formData.lastName}`,
                    password_confirmation: formData.confirmPassword,
                    role: 'student'
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed. Please try again.');
            }

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
        <div className="flex min-h-screen bg-brand-beige overflow-hidden">
            {/* Left Panel - Registration Flow */}
            <div className="flex-1 flex flex-col bg-white dark:bg-brand-charcoal relative overflow-y-auto custom-scrollbar h-screen">
                <div className="w-full max-w-[700px] mx-auto p-8 md:p-16 animate-fade-in-up">
                    <div className="flex justify-center mb-12">
                        <img
                            src="/logo.png"
                            alt="Layos Group LLC"
                            className="h-12 w-auto"
                        />
                    </div>

                    {step === 1 ? (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="mb-12">
                                <h1 className="text-3xl md:text-5xl font-black text-brand-charcoal dark:text-white mb-6 leading-tight">Become a job-ready project scheduler in 8 weeks</h1>
                                <p className="text-lg md:text-xl text-brand-muted font-medium leading-relaxed mb-10">
                                    Everything you need for project management with intense support. No matter your background or experience, this course is designed for you.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                                    {[
                                        { title: 'Primavera P6 (Hands-On)', icon: '📊', color: 'bg-blue-50 dark:bg-blue-900/10' },
                                        { title: 'Microsoft Project (MSP)', icon: '💻', color: 'bg-emerald-50 dark:bg-emerald-900/10' },
                                        { title: 'Smartsheet', icon: '📋', color: 'bg-orange-50 dark:bg-orange-900/10' },
                                        { title: 'Resource Planning & Cost Loading', icon: '📉', color: 'bg-purple-50 dark:bg-purple-900/10' },
                                        { title: 'Earned Value Management', icon: '📈', color: 'bg-red-50 dark:bg-red-900/10' },
                                        { title: 'Schedule Analysis & Reporting', icon: '📄', color: 'bg-sky-50 dark:bg-sky-900/10' }
                                    ].map((item, i) => (
                                        <div key={i} className={`flex items-center gap-4 p-5 ${item.color} rounded-2xl border border-black/5 shadow-sm hover:scale-[1.02] transition-transform`}>
                                            <span className="text-2xl">{item.icon}</span>
                                            <span className="font-bold text-sm text-brand-charcoal dark:text-white">{item.title}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={nextStep}
                                    className="w-full py-5 bg-brand-emerald text-white rounded-3xl font-black text-lg uppercase tracking-[0.2em] shadow-2xl shadow-brand-emerald/20 hover:-translate-y-1 active:scale-[0.98] transition-all border-none cursor-pointer"
                                >
                                    Proceed to Registration
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                            <button
                                onClick={prevStep}
                                className="flex items-center gap-2 text-brand-muted hover:text-brand-emerald font-black text-xs uppercase tracking-widest bg-transparent border-none cursor-pointer mb-8 transition-colors group"
                            >
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                Back to Course Overview
                            </button>

                            <div className="mb-10">
                                <h2 className="text-3xl font-black text-brand-charcoal dark:text-white mb-2">Student Information</h2>
                                <p className="text-brand-muted font-medium">Please fill in the details below to complete your registration.</p>
                            </div>

                            {error && (
                                <div className="p-5 bg-red-50 border border-red-100 text-red-600 rounded-2xl mb-8 flex items-center gap-4 shadow-sm animate-in slide-in-from-top-2">
                                    <AlertCircle size={20} />
                                    <span className="flex-1 font-bold text-sm">{error}</span>
                                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 bg-transparent border-none cursor-pointer">
                                        <X size={20} />
                                    </button>
                                </div>
                            )}

                            <form onSubmit={handleRegister} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-brand-charcoal dark:text-white uppercase tracking-widest ml-1">First Name *</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            className="w-full px-5 py-3.5 bg-brand-beige/50 dark:bg-white/5 border border-brand-border rounded-2xl text-brand-charcoal dark:text-white outline-none text-sm font-bold focus:border-brand-emerald transition-all"
                                            placeholder="John"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-brand-charcoal dark:text-white uppercase tracking-widest ml-1">Last Name *</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            className="w-full px-5 py-3.5 bg-brand-beige/50 dark:bg-white/5 border border-brand-border rounded-2xl text-brand-charcoal dark:text-white outline-none text-sm font-bold focus:border-brand-emerald transition-all"
                                            placeholder="Doe"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-brand-charcoal dark:text-white uppercase tracking-widest ml-1">Phone Number *</label>
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            className="w-full px-5 py-3.5 bg-brand-beige/50 dark:bg-white/5 border border-brand-border rounded-2xl text-brand-charcoal dark:text-white outline-none text-sm font-bold focus:border-brand-emerald transition-all"
                                            placeholder="+1 (555) 000-0000"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-brand-charcoal dark:text-white uppercase tracking-widest ml-1">Email Address *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            className="w-full px-5 py-3.5 bg-brand-beige/50 dark:bg-white/5 border border-brand-border rounded-2xl text-brand-charcoal dark:text-white outline-none text-sm font-bold focus:border-brand-emerald transition-all"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-brand-charcoal dark:text-white uppercase tracking-widest ml-1">Country</label>
                                    <select
                                        name="country"
                                        className="w-full px-5 py-3.5 bg-brand-beige/50 dark:bg-white/5 border border-brand-border rounded-2xl text-brand-charcoal dark:text-white outline-none text-sm font-bold focus:border-brand-emerald transition-all appearance-none"
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

                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-brand-charcoal dark:text-white uppercase tracking-widest ml-1">Address Line 1 *</label>
                                    <input
                                        type="text"
                                        name="addressLine1"
                                        className="w-full px-5 py-3.5 bg-brand-beige/50 dark:bg-white/5 border border-brand-border rounded-2xl text-brand-charcoal dark:text-white outline-none text-sm font-bold focus:border-brand-emerald transition-all"
                                        placeholder="123 Education Street"
                                        value={formData.addressLine1}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-brand-charcoal dark:text-white uppercase tracking-widest ml-1">City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            className="w-full px-5 py-3.5 bg-brand-beige/50 dark:bg-white/5 border border-brand-border rounded-2xl text-brand-charcoal dark:text-white outline-none text-sm font-bold focus:border-brand-emerald transition-all"
                                            placeholder="City"
                                            value={formData.city}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-brand-charcoal dark:text-white uppercase tracking-widest ml-1">State *</label>
                                        <input
                                            type="text"
                                            name="state"
                                            className="w-full px-5 py-3.5 bg-brand-beige/50 dark:bg-white/5 border border-brand-border rounded-2xl text-brand-charcoal dark:text-white outline-none text-sm font-bold focus:border-brand-emerald transition-all"
                                            placeholder="State"
                                            value={formData.state}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-brand-charcoal dark:text-white uppercase tracking-widest ml-1">Zip Code *</label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            className="w-full px-5 py-3.5 bg-brand-beige/50 dark:bg-white/5 border border-brand-border rounded-2xl text-brand-charcoal dark:text-white outline-none text-sm font-bold focus:border-brand-emerald transition-all"
                                            placeholder="10001"
                                            value={formData.zipCode}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-brand-charcoal dark:text-white uppercase tracking-widest ml-1">Gender *</label>
                                        <select
                                            name="gender"
                                            className="w-full px-5 py-3.5 bg-brand-beige/50 dark:bg-white/5 border border-brand-border rounded-2xl text-brand-charcoal dark:text-white outline-none text-sm font-bold focus:border-brand-emerald appearance-none"
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
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-brand-charcoal dark:text-white uppercase tracking-widest ml-1">Education Level *</label>
                                        <select
                                            name="levelOfEducation"
                                            className="w-full px-5 py-3.5 bg-brand-beige/50 dark:bg-white/5 border border-brand-border rounded-2xl text-brand-charcoal dark:text-white outline-none text-sm font-bold focus:border-brand-emerald appearance-none"
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
                                </div>

                                <div className="flex items-start gap-3 p-1">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            name="agreedToTerms"
                                            id="agreedToTerms"
                                            checked={formData.agreedToTerms}
                                            onChange={handleChange}
                                            required
                                            className="w-5 h-5 rounded-lg border-brand-border text-brand-emerald focus:ring-brand-emerald/20 transition-all cursor-pointer"
                                        />
                                    </div>
                                    <label htmlFor="agreedToTerms" className="text-xs font-bold text-brand-muted leading-relaxed cursor-pointer">
                                        I have read and agree to the <Link to="/terms" className="text-brand-emerald hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-brand-emerald hover:underline">Privacy Policy</Link>
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-brand-charcoal dark:text-white uppercase tracking-widest ml-1">Password *</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                className="w-full px-5 py-3.5 bg-brand-beige/50 dark:bg-white/5 border border-brand-border rounded-2xl text-brand-charcoal dark:text-white outline-none text-sm font-bold focus:border-brand-emerald pr-12"
                                                placeholder="Create password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-brand-muted hover:text-brand-emerald bg-transparent border-none cursor-pointer"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-brand-charcoal dark:text-white uppercase tracking-widest ml-1">Confirm Password *</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                className="w-full px-5 py-3.5 bg-brand-beige/50 dark:bg-white/5 border border-brand-border rounded-2xl text-brand-charcoal dark:text-white outline-none text-sm font-bold focus:border-brand-emerald pr-12"
                                                placeholder="Repeat password"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-brand-muted hover:text-brand-emerald bg-transparent border-none cursor-pointer"
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    className="w-full py-5 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-3xl font-black text-sm uppercase tracking-[0.25em] shadow-2xl shadow-brand-charcoal/20 dark:shadow-brand-emerald/20 hover:-translate-y-1 active:scale-[0.98] transition-all border-none cursor-pointer mt-6"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-3 justify-center">
                                            <Loader2 className="animate-spin" size={20} />
                                            <span>Processing...</span>
                                        </div>
                                    ) : (
                                        'Register & Join Academy'
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="mt-10 text-center text-xs font-black uppercase tracking-widest text-brand-muted">
                        Already have an account? <Link to="/login" className="text-brand-emerald hover:underline underline-offset-4 ml-1">Login</Link>
                    </div>
                </div>

                <div className="mt-auto w-full p-8 md:p-12 border-t border-brand-border flex flex-col md:flex-row justify-between text-[10px] font-black uppercase tracking-widest text-brand-muted gap-4">
                    <div>© 2026 Layos Group LLC. All rights reserved.</div>
                    <div className="flex gap-8">
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
                            alt="Academy Preview"
                            className="w-full h-auto rounded-xl shadow-[0_60px_120px_-30px_rgba(0,0,0,0.6)] border border-white/10 transform -rotate-y-12 rotate-x-6 translate-z-20 hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-1000 ease-out"
                        />

                        {/* Floating Feature Chip */}
                        <div className="absolute top-[20%] -left-10 bg-brand-emerald/90 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-white/20 animate-fade-in-up">
                            <div className="flex items-center gap-4">
                                <CheckCircle2 className="text-white" size={24} />
                                <div className="pr-2">
                                    <div className="font-black text-xs uppercase tracking-widest">Industry Certified</div>
                                    <div className="text-[9px] font-bold text-white/80 uppercase tracking-widest">Recognized by top firms</div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Premium Badge */}
                        <div className="absolute bottom-[10%] -right-10 bg-white/10 backdrop-blur-xl p-5 rounded-3xl border border-white/20 shadow-2xl animate-fade-in-up delay-300">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                                    <Star className="text-brand-emerald fill-brand-emerald" size={24} />
                                </div>
                                <div className="pr-4">
                                    <div className="font-black text-sm uppercase tracking-widest text-white">Elite Academy</div>
                                    <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-0.5">Top Rated Program</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-24 text-center max-w-lg animate-fade-in-up delay-500">
                        <h2 className="text-5xl font-black mb-8 leading-tight">Your Future in <br/>Project Scheduling</h2>
                        <p className="text-xl text-white/70 font-medium leading-relaxed">Join thousands of students transforming their careers with our intensive, hands-on certification programs.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
