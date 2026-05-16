import { useState, useEffect } from 'react';
import {
    UserPlus,
    ArrowLeft,
    Mail,
    Layers,
    ShieldCheck,
    CheckCircle,
    Info,
    AlertCircle,
    Loader2,
    X,
    ChevronRight,
    Zap,
    Sparkles,
    Lock
} from 'lucide-react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

export default function AddStudent() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const cohortIdFromUrl = searchParams.get('cohortId');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        cohorts: cohortIdFromUrl ? [cohortIdFromUrl] : [] as string[],
        sendWelcomeEmail: true
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [cohorts, setCohorts] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const fetchCohorts = async () => {
        try {
            const response = await fetch(`${API_URL}/cohorts`, {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (response.ok) setCohorts(data);
        } catch (err) {
            console.error('Failed to load academic sessions.');
        }
    };

    useEffect(() => {
        fetchCohorts();
    }, []);

    const toggleCohort = (id: string) => {
        setFormData(prev => {
            const selected = prev.cohorts.includes(id) ? prev.cohorts.filter(c => c !== id) : [...prev.cohorts, id];
            return { ...prev, cohorts: selected };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ name: formData.name, email: formData.email, cohorts: formData.cohorts, password: formData.password || undefined })
            });
            const data = await response.json();
            if (response.ok) {
                setIsSuccess(true);
                setTimeout(() => navigate('/instructor/students'), 2000);
            } else throw new Error(data.message || 'Enrollment rejected.');
        } catch (err: any) {
            setError(err.message);
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-8 animate-fade-in">
                <div className="w-32 h-32 bg-brand-emerald/10 text-brand-emerald rounded-xl flex items-center justify-center shadow-inner animate-bounce">
                    <CheckCircle size={64} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-4xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Cadet Enrolled</h2>
                    <p className="text-brand-muted font-medium text-lg">Identity synchronized. Redirecting to academic directory...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-32 px-6 md:px-0">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between animate-fade-in-up">
                <button onClick={() => navigate(-1)} className="group flex items-center gap-4 text-[10px] font-black text-brand-muted hover:text-brand-emerald uppercase tracking-[0.3em] transition-all border-none bg-transparent cursor-pointer">
                    <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" /> Back to Directory
                </button>
            </div>

            <header className="space-y-6 animate-fade-in-up">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-brand-emerald/10 rounded-xl">
                        <UserPlus className="text-brand-emerald" size={18} />
                    </div>
                    <span className="text-brand-emerald font-black text-[10px] uppercase tracking-[0.4em]">Onboarding Protocol</span>
                </div>
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-6xl font-black text-brand-charcoal dark:text-white tracking-tighter leading-none uppercase">Enroll <span className="text-brand-emerald">Cadet</span></h1>
                    <p className="text-brand-muted font-medium text-xl max-w-2xl leading-relaxed">Initialize a new student identity and authorize access to academic cohorts.</p>
                </div>
            </header>

            {error && (
                <div className="p-6 bg-red-50 dark:bg-red-500/10 border-2 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-[32px] animate-in slide-in-from-top-4 duration-500 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <AlertCircle size={24} />
                        <span className="font-black text-xs uppercase tracking-widest">{error}</span>
                    </div>
                    <button onClick={() => setError(null)} className="p-2 hover:bg-white/20 rounded-xl border-none bg-transparent cursor-pointer"><X size={18} /></button>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <form className="xl:col-span-8 bg-white dark:bg-brand-charcoal rounded-[60px] border border-brand-border p-10 md:p-16 space-y-12 shadow-2xl shadow-brand-charcoal/5" onSubmit={handleSubmit}>
                    {/* Identity Section */}
                    <div className="space-y-10">
                        <div className="flex items-center gap-4 border-b border-brand-border pb-6">
                            <ShieldCheck className="text-brand-emerald" size={20} />
                            <h3 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Identity Details</h3>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Full Identity Name</label>
                                <input
                                    type="text"
                                    className="w-full h-18 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-base focus:border-brand-emerald transition-all placeholder:text-brand-muted/30"
                                    placeholder="e.g. John Doe"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Endpoint Email</label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            className="w-full h-18 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-sm focus:border-brand-emerald transition-all"
                                            placeholder="student@example.com"
                                            required
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                        <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" size={18} />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Secure Passcode</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            className="w-full h-18 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-sm focus:border-brand-emerald transition-all"
                                            placeholder="Auto-generated if empty"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                        <Lock className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cohort Allocation */}
                    <div className="space-y-10">
                        <div className="flex items-center gap-4 border-b border-brand-border pb-6">
                            <Layers className="text-brand-emerald" size={20} />
                            <h3 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Cohort Allocation</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cohorts.map(c => (
                                <div
                                    key={c.id}
                                    onClick={() => toggleCohort(c.id)}
                                    className={`p-6 rounded-[32px] border-2 transition-all cursor-pointer flex items-center justify-between group ${formData.cohorts.includes(c.id) ? 'bg-brand-emerald/10 border-brand-emerald' : 'bg-brand-beige/10 dark:bg-white/5 border-brand-border hover:border-brand-emerald/50'}`}
                                >
                                    <div className="space-y-1">
                                        <div className={`text-sm font-black uppercase tracking-tight transition-colors ${formData.cohorts.includes(c.id) ? 'text-brand-emerald' : 'text-brand-charcoal dark:text-white'}`}>{c.name}</div>
                                        <div className="text-[9px] font-bold text-brand-muted uppercase tracking-widest truncate max-w-[180px]">{c.course?.title || 'General Curriculum'}</div>
                                    </div>
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${formData.cohorts.includes(c.id) ? 'bg-brand-emerald text-white' : 'bg-white dark:bg-brand-charcoal border-2 border-brand-border text-brand-muted'}`}>
                                        {formData.cohorts.includes(c.id) && <CheckCircle size={18} />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="flex items-center gap-4 p-5 bg-brand-beige/20 dark:bg-white/5 rounded-[24px] border border-brand-border">
                            <input
                                type="checkbox"
                                id="welcomeEmail"
                                className="w-6 h-6 accent-brand-emerald rounded-lg"
                                checked={formData.sendWelcomeEmail}
                                onChange={e => setFormData({ ...formData, sendWelcomeEmail: e.target.checked })}
                            />
                            <label htmlFor="welcomeEmail" className="text-[10px] font-black text-brand-muted uppercase tracking-widest cursor-pointer">Transmit Onboarding Artifacts via Email</label>
                        </div>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full md:w-auto h-18 px-12 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-[24px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-brand-charcoal/20 dark:shadow-brand-emerald/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-4 border-none cursor-pointer"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <>Initialize Profile <ChevronRight size={18} /></>}
                        </button>
                    </div>
                </form>

                {/* Sidebar: Intelligence */}
                <div className="xl:col-span-4 space-y-8 sticky top-32">
                    <div className="bg-brand-emerald p-10 rounded-[48px] text-white space-y-8 shadow-2xl shadow-brand-emerald/20">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white/10 rounded-xl">
                                <Sparkles size={20} />
                            </div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Enrollment Intel</h4>
                        </div>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0"><CheckCircle size={16} /></div>
                                <p className="text-xs font-medium leading-relaxed opacity-80">Credentials are validated against the global identity matrix immediately.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0"><Zap size={16} /></div>
                                <p className="text-xs font-medium leading-relaxed opacity-80">Cohort access is provisioned in real-time upon protocol completion.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 bg-white dark:bg-brand-charcoal rounded-[48px] border border-brand-border space-y-8 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-brand-beige/50 dark:bg-white/10 rounded-xl text-brand-emerald">
                                <Info size={18} />
                            </div>
                            <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-[0.3em]">Operational Note</h4>
                        </div>
                        <p className="text-xs font-medium text-brand-muted leading-relaxed">
                            Ensure all PII data is accurate before initialization. System logs will record this enrollment event in the master activity manifest.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
