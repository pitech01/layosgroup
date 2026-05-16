import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
    Shield,
    ChevronRight,
    ArrowLeft,
    AlertCircle,
    X,
    Loader2,
    Calendar,
    Target,
    Zap,
    Settings,
    Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function EditCohort() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        enrollmentDeadline: '',
        timezone: 'UTC+1 (WAT)',
        visibility: 'public'
    });

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const fetchCohort = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${API_URL}/cohorts/${id}`, {
                    headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setFormData({
                        name: data.name || '',
                        startDate: data.start_date || '',
                        endDate: data.end_date || '',
                        enrollmentDeadline: data.enrollment_deadline || '',
                        timezone: data.timezone || 'UTC+1 (WAT)',
                        visibility: data.visibility || 'public'
                    });
                } else throw new Error(data.message || 'Retrieval failure.');
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCohort();
    }, [id, API_URL]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        setError(null);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/cohorts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    name: formData.name,
                    start_date: formData.startDate,
                    end_date: formData.endDate,
                    enrollment_deadline: formData.enrollmentDeadline,
                    timezone: formData.timezone,
                    visibility: formData.visibility,
                    instructor_id: user?.id
                })
            });
            if (response.ok) navigate(`/instructor/cohorts/${id}`);
            else throw new Error('Modification failed.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-6 animate-pulse">
                <Loader2 className="animate-spin text-brand-emerald" size={48} />
                <p className="font-black text-[10px] text-brand-muted uppercase tracking-[0.4em]">Synchronizing Parameters...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-32 px-6 md:px-0">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between animate-fade-in-up">
                <Link to={`/instructor/cohorts/${id}`} className="group flex items-center gap-4 text-[10px] font-black text-brand-muted hover:text-brand-emerald uppercase tracking-[0.3em] transition-all no-underline">
                    <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" /> Back to Node Details
                </Link>
            </div>

            <header className="space-y-6 animate-fade-in-up">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-brand-emerald/10 rounded-xl">
                        <Settings className="text-brand-emerald" size={18} />
                    </div>
                    <span className="text-brand-emerald font-black text-[10px] uppercase tracking-[0.4em]">Node Configuration</span>
                </div>
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-6xl font-black text-brand-charcoal dark:text-white tracking-tighter leading-none uppercase">Edit <span className="text-brand-emerald">Cohort</span></h1>
                    <p className="text-brand-muted font-medium text-xl max-w-2xl leading-relaxed">Adjust operational parameters for <strong>{formData.name}</strong> to align with current academic requirements.</p>
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
                <div className="space-y-10">
                    <div className="flex items-center gap-4 border-b border-brand-border pb-6">
                        <Shield className="text-brand-emerald" size={20} />
                        <h3 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight">System Parameters</h3>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Cohort Title</label>
                            <input
                                type="text"
                                className="w-full h-18 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-base focus:border-brand-emerald transition-all"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Deployment Start</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className="w-full h-18 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-sm focus:border-brand-emerald transition-all"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                    <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" size={18} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Deployment End</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className="w-full h-18 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-sm focus:border-brand-emerald transition-all"
                                        required
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                    <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" size={18} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Enrollment Cut-off</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    className="w-full h-18 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-sm focus:border-brand-emerald transition-all"
                                    required
                                    value={formData.enrollmentDeadline}
                                    onChange={(e) => setFormData({ ...formData, enrollmentDeadline: e.target.value })}
                                />
                                <Target className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" size={18} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8">
                    <button 
                        type="submit" 
                        disabled={updating}
                        className="w-full h-20 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-[28px] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-brand-charcoal/20 dark:shadow-brand-emerald/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4 border-none cursor-pointer"
                    >
                        {updating ? (
                            <>
                                <Loader2 className="animate-spin" size={24} />
                                <span>Synchronizing...</span>
                            </>
                        ) : (
                            <>
                                Update Configuration <ChevronRight size={24} />
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="flex items-center justify-center gap-6 p-10 bg-brand-beige/10 dark:bg-white/5 rounded-xl border border-brand-border border-dashed text-brand-muted text-[10px] font-black uppercase tracking-[0.2em] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <Sparkles size={16} className="text-brand-emerald" />
                Parameters are verified before commit to the central repository.
            </div>
        </div>
    );
}
