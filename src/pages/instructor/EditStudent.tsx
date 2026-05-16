import { useState, useEffect } from 'react';
import {
    UserCircle,
    ArrowLeft,
    Mail,
    Layers,
    ShieldCheck,
    CheckCircle,
    AlertCircle,
    Loader2,
    X,
    ChevronRight,
    Lock,
    Settings,
    Sparkles
} from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';

export default function EditStudent() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        cohorts: [] as string[]
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [cohorts, setCohorts] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const [cohortsRes, studentRes] = await Promise.all([
                    fetch(`${API_URL}/cohorts`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_URL}/students/${id}`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } })
                ]);
                
                if (cohortsRes.ok) setCohorts(await cohortsRes.json());
                if (studentRes.ok) {
                    const studentData = await studentRes.json();
                    setFormData({
                        name: studentData.name || '',
                        email: studentData.email || '',
                        password: '',
                        cohorts: studentData.cohorts?.map((c: any) => c.id) || []
                    });
                } else throw new Error('Retrieval failure.');
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialData();
    }, [id]);

    const toggleCohort = (cohortId: string) => {
        setFormData(prev => {
            const selected = prev.cohorts.includes(cohortId) ? prev.cohorts.filter(c => c !== cohortId) : [...prev.cohorts, cohortId];
            return { ...prev, cohorts: selected };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/students/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                setIsSuccess(true);
                setTimeout(() => navigate('/instructor/students'), 2000);
            } else throw new Error('Modification rejected.');
        } catch (err: any) {
            setError(err.message);
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-6 animate-pulse">
                <Loader2 className="animate-spin text-brand-emerald" size={48} />
                <p className="font-black text-[10px] text-brand-muted uppercase tracking-[0.4em]">Synchronizing Identity Data...</p>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-8 animate-fade-in">
                <div className="w-32 h-32 bg-brand-emerald/10 text-brand-emerald rounded-xl flex items-center justify-center shadow-inner animate-bounce">
                    <CheckCircle size={64} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-4xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Profile Updated</h2>
                    <p className="text-brand-muted font-medium text-lg">Modifications synchronized successfully.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-32 px-6 md:px-0">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between animate-fade-in-up">
                <Link to="/instructor/students" className="group flex items-center gap-4 text-[10px] font-black text-brand-muted hover:text-brand-emerald uppercase tracking-[0.3em] transition-all no-underline">
                    <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" /> Back to Directory
                </Link>
            </div>

            <header className="space-y-6 animate-fade-in-up">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-brand-emerald/10 rounded-xl">
                        <Settings className="text-brand-emerald" size={18} />
                    </div>
                    <span className="text-brand-emerald font-black text-[10px] uppercase tracking-[0.4em]">Profile Modification</span>
                </div>
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-6xl font-black text-brand-charcoal dark:text-white tracking-tighter leading-none uppercase">Edit <span className="text-brand-emerald">Student</span></h1>
                    <p className="text-brand-muted font-medium text-xl max-w-2xl leading-relaxed">Adjust identity parameters and cohort access for <strong>{formData.name}</strong>.</p>
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

            <form className="bg-white dark:bg-brand-charcoal rounded-[60px] border border-brand-border p-12 md:p-16 space-y-12 shadow-2xl shadow-brand-charcoal/5 animate-fade-in-up" style={{ animationDelay: '0.1s' }} onSubmit={handleSubmit}>
                {/* Identity Section */}
                <div className="space-y-10">
                    <div className="flex items-center gap-4 border-b border-brand-border pb-6">
                        <UserCircle className="text-brand-emerald" size={20} />
                        <h3 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Identity Hub</h3>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Full Identity Name</label>
                            <input
                                type="text"
                                className="w-full h-18 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-base focus:border-brand-emerald transition-all"
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
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" size={18} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Secure Passcode Override</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        className="w-full h-18 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-sm focus:border-brand-emerald transition-all"
                                        placeholder="Leave blank to maintain current"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <Lock className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" size={18} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cohort Access Section */}
                <div className="space-y-10">
                    <div className="flex items-center gap-4 border-b border-brand-border pb-6">
                        <Layers className="text-brand-emerald" size={20} />
                        <h3 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Cohort Authorization</h3>
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
                                    <div className="text-[9px] font-bold text-brand-muted uppercase tracking-widest truncate max-w-[150px]">{c.course?.title || 'General Curriculum'}</div>
                                </div>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${formData.cohorts.includes(c.id) ? 'bg-brand-emerald text-white' : 'bg-white dark:bg-brand-charcoal border-2 border-brand-border text-brand-muted'}`}>
                                    {formData.cohorts.includes(c.id) && <CheckCircle size={18} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-8">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full h-20 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-[28px] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-brand-charcoal/20 dark:shadow-brand-emerald/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4 border-none cursor-pointer"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" size={24} />
                                <span>Syncing Modifications...</span>
                            </>
                        ) : (
                            <>
                                Commit Changes <ChevronRight size={24} />
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="flex items-center justify-center gap-6 p-10 bg-brand-beige/10 dark:bg-white/5 rounded-xl border border-brand-border border-dashed text-brand-muted text-[10px] font-black uppercase tracking-[0.2em] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <Sparkles size={16} className="text-brand-emerald" />
                All identity modifications are logged and synchronized across the central academic grid.
            </div>
        </div>
    );
}
