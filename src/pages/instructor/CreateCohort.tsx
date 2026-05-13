import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    Sparkles,
    CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function CreateCohort() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        enrollmentDeadline: '',
        timezone: 'UTC+1 (WAT)',
        visibility: 'public'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        const cohortId = `CH-${formData.name.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${API_URL}/cohorts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    id: cohortId,
                    name: formData.name,
                    start_date: formData.startDate,
                    end_date: formData.endDate,
                    enrollment_deadline: formData.enrollmentDeadline,
                    timezone: formData.timezone,
                    visibility: formData.visibility,
                    instructor_id: user?.id
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Initialization failed.');
            navigate(`/instructor/cohorts/${data.id}`);
        } catch (err: any) {
            setError(err.message || 'System uplink failure.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-32 px-6 md:px-0">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between animate-fade-in-up">
                <Link to="/instructor/cohorts" className="group flex items-center gap-4 text-[10px] font-black text-brand-muted hover:text-brand-emerald uppercase tracking-[0.3em] transition-all no-underline">
                    <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" /> Back to Cohorts
                </Link>
            </div>

            <header className="space-y-6 animate-fade-in-up">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-brand-emerald/10 rounded-xl">
                        <Zap className="text-brand-emerald" size={18} />
                    </div>
                    <span className="text-brand-emerald font-black text-[10px] uppercase tracking-[0.4em]">Node Initialization</span>
                </div>
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-6xl font-black text-brand-charcoal dark:text-white tracking-tighter leading-none uppercase">Create <span className="text-brand-emerald">Cohort</span></h1>
                    <p className="text-brand-muted font-medium text-xl max-w-2xl leading-relaxed">Configure the operational parameters for a new academic session and enrollment pathway.</p>
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
                {/* Configuration Section */}
                <div className="space-y-10">
                    <div className="flex items-center gap-4 border-b border-brand-border pb-6">
                        <Shield className="text-brand-emerald" size={20} />
                        <h3 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Core Logistics</h3>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Cohort Title</label>
                            <input
                                type="text"
                                className="w-full h-18 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-base focus:border-brand-emerald transition-all placeholder:text-brand-muted/30"
                                placeholder="e.g. Masterclass Batch Jan 2026"
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
                        disabled={loading}
                        className="w-full h-20 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-[28px] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-brand-charcoal/20 dark:shadow-brand-emerald/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4 border-none cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={24} />
                                <span>Processing Protocol...</span>
                            </>
                        ) : (
                            <>
                                Finalize Node <ChevronRight size={24} />
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="flex items-center justify-center gap-6 p-10 bg-brand-beige/10 dark:bg-white/5 rounded-[40px] border border-brand-border border-dashed text-brand-muted text-[10px] font-black uppercase tracking-[0.2em] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <Sparkles size={16} className="text-brand-emerald" />
                New cohorts are automatically synchronized with the central academic directory.
            </div>
        </div>
    );
}
