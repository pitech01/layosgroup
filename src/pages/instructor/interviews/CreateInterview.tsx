import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Mic2,
    CheckCircle,
    Loader2,
    FileText,
    Video,
    X,
    Info,
    ChevronRight,
    Zap,
    ShieldCheck,
    Sparkles,
    Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CreateInterview() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cohorts, setCohorts] = useState<any[]>([]);
    const [docFile, setDocFile] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({ title: '', description: '', cohort_id: '' });

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const fetchCohorts = async () => {
        try {
            const response = await fetch(`${API_URL}/cohorts`, {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (response.ok) setCohorts(data);
        } catch (err) {
            console.error("Error fetching cohorts", err);
        }
    };

    useEffect(() => { fetchCohorts(); }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'doc' | 'video') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const maxSize = type === 'doc' ? 50 * 1024 * 1024 : 500 * 1024 * 1024;
            if (file.size > maxSize) {
                toast.error(`File size exceeds ${type === 'doc' ? '50MB' : '500MB'} limit.`);
                return;
            }
            if (type === 'doc') setDocFile(file);
            else setVideoFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            if (formData.cohort_id) data.append('cohort_id', formData.cohort_id);
            if (docFile) data.append('document', docFile);
            if (videoFile) data.append('video', videoFile);

            const response = await fetch(`${API_URL}/instructor/interviews`, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: data
            });

            if (response.ok) {
                toast.success("Interview artifact published");
                navigate('/instructor/interview');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Initialization failure.');
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-32 px-6 md:px-0">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between animate-fade-in-up">
                <Link to="/instructor/interview" className="group flex items-center gap-4 text-[10px] font-black text-brand-muted hover:text-brand-emerald uppercase tracking-[0.3em] transition-all no-underline">
                    <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" /> Back to Intelligence
                </Link>
            </div>

            <header className="space-y-6 animate-fade-in-up">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-brand-emerald/10 rounded-xl">
                        <Mic2 className="text-brand-emerald" size={18} />
                    </div>
                    <span className="text-brand-emerald font-black text-[10px] uppercase tracking-[0.4em]">Artifact Initialization</span>
                </div>
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-6xl font-black text-brand-charcoal dark:text-white tracking-tighter leading-none uppercase">Initialize <span className="text-brand-emerald">Interview</span></h1>
                    <p className="text-brand-muted font-medium text-xl max-w-2xl leading-relaxed">Configure and synchronize instructional artifacts for career preparation.</p>
                </div>
            </header>

            <form className="bg-white dark:bg-brand-charcoal rounded-[60px] border border-brand-border p-12 md:p-16 space-y-12 shadow-2xl shadow-brand-charcoal/5 animate-fade-in-up" style={{ animationDelay: '0.1s' }} onSubmit={handleSubmit}>
                {/* Protocol Parameters */}
                <div className="space-y-10">
                    <div className="flex items-center gap-4 border-b border-brand-border pb-6">
                        <ShieldCheck className="text-brand-emerald" size={20} />
                        <h3 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Protocol Parameters</h3>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Artifact Title</label>
                            <input
                                type="text"
                                className="w-full h-18 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-base focus:border-brand-emerald transition-all placeholder:text-brand-muted/30"
                                placeholder="e.g. Algorithmic Interview Simulation"
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Target Cohort Authorization</label>
                            <select
                                className="w-full h-18 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-sm focus:border-brand-emerald transition-all appearance-none"
                                value={formData.cohort_id}
                                onChange={e => setFormData({ ...formData, cohort_id: e.target.value })}
                            >
                                <option value="">Global Terminal (All Students)</option>
                                {cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Artifact Description</label>
                            <textarea
                                className="w-full min-h-[160px] p-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[32px] text-brand-charcoal dark:text-white outline-none font-bold text-base focus:border-brand-emerald transition-all placeholder:text-brand-muted/30 resize-none"
                                placeholder="Detail the instructional intent of this resource..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Asset Synchronization */}
                <div className="space-y-10">
                    <div className="flex items-center gap-4 border-b border-brand-border pb-6">
                        <Zap className="text-brand-emerald" size={20} />
                        <h3 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Asset Synchronization</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Doc Upload */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Documentation (PDF/DOC)</label>
                            {!docFile ? (
                                <div onClick={() => document.getElementById('doc-input')?.click()} className="p-10 bg-brand-beige/20 dark:bg-white/5 rounded-[40px] border-2 border-brand-border border-dashed text-center space-y-4 hover:border-brand-emerald group transition-all cursor-pointer">
                                    <input type="file" id="doc-input" hidden accept=".pdf,.doc,.docx" onChange={e => handleFileChange(e, 'doc')} />
                                    <div className="w-14 h-14 bg-white dark:bg-brand-charcoal border-2 border-brand-border rounded-2xl flex items-center justify-center mx-auto text-brand-muted group-hover:text-brand-emerald group-hover:scale-110 transition-all"><FileText size={24} /></div>
                                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Attach Protocol</p>
                                </div>
                            ) : (
                                <div className="p-6 bg-brand-emerald/10 border-2 border-brand-emerald/20 rounded-[32px] flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="p-2 bg-brand-emerald text-white rounded-lg shrink-0"><CheckCircle size={16} /></div>
                                        <span className="text-xs font-black text-brand-emerald uppercase tracking-tight truncate">{docFile.name}</span>
                                    </div>
                                    <button onClick={() => setDocFile(null)} className="p-2 hover:bg-white/20 rounded-lg text-brand-muted hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"><X size={18} /></button>
                                </div>
                            )}
                        </div>

                        {/* Video Upload */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Video (MP4/MOV)</label>
                            {!videoFile ? (
                                <div onClick={() => document.getElementById('video-input')?.click()} className="p-10 bg-brand-beige/20 dark:bg-white/5 rounded-[40px] border-2 border-brand-border border-dashed text-center space-y-4 hover:border-brand-emerald group transition-all cursor-pointer">
                                    <input type="file" id="video-input" hidden accept="video/*" onChange={e => handleFileChange(e, 'video')} />
                                    <div className="w-14 h-14 bg-white dark:bg-brand-charcoal border-2 border-brand-border rounded-2xl flex items-center justify-center mx-auto text-brand-muted group-hover:text-brand-emerald group-hover:scale-110 transition-all"><Video size={24} /></div>
                                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Attach Stream</p>
                                </div>
                            ) : (
                                <div className="p-6 bg-brand-emerald/10 border-2 border-brand-emerald/20 rounded-[32px] flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="p-2 bg-brand-emerald text-white rounded-lg shrink-0"><CheckCircle size={16} /></div>
                                        <span className="text-xs font-black text-brand-emerald uppercase tracking-tight truncate">{videoFile.name}</span>
                                    </div>
                                    <button onClick={() => setVideoFile(null)} className="p-2 hover:bg-white/20 rounded-lg text-brand-muted hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"><X size={18} /></button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-4 text-brand-muted">
                        <Info size={18} />
                        <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed max-w-[300px]">Artifacts are synchronized to Bunny.net secure nodes. Limits: 50MB Doc / 500MB Video.</p>
                    </div>
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full md:w-auto h-20 px-12 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-[28px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-brand-charcoal/20 dark:shadow-brand-emerald/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-4 border-none cursor-pointer"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <>Commit Artifact <ChevronRight size={24} /></>}
                    </button>
                </div>
            </form>

            <div className="flex items-center justify-center gap-6 p-10 bg-brand-beige/10 dark:bg-white/5 rounded-[40px] border border-brand-border border-dashed text-brand-muted text-[10px] font-black uppercase tracking-[0.2em] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <Sparkles size={16} className="text-brand-emerald" />
                Interview artifacts are immediately indexed and made available to authorized student cohorts.
            </div>
        </div>
    );
}
