import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    ClipboardList,
    Clock,
    CheckCircle,
    Loader2,
    BookOpen,
    Upload,
    FileText,
    X,
    ChevronRight,
    Zap,
    ShieldCheck,
    Sparkles,
    CalendarDays,
    Info,
    Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CreateAssignment() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cohorts, setCohorts] = useState<any[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({ title: '', description: '', cohort_id: '', due_date: '', due_time: '23:59' });

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 50 * 1024 * 1024) {
                toast.error("File size exceeds 50MB limit.");
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.cohort_id) { toast.error("Select authorization cohort"); return; }
        setIsSubmitting(true);
        try {
            const combinedDateTime = `${formData.due_date}T${formData.due_time}:00`;
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('cohort_id', formData.cohort_id);
            data.append('due_date', combinedDateTime);
            if (selectedFile) data.append('assignment_file', selectedFile);

            const response = await fetch(`${API_URL}/instructor/assignments`, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: data
            });

            if (response.ok) {
                toast.success("Assignment published");
                navigate('/instructor/assignments');
            } else throw new Error('Initialization failure.');
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-32 px-6 md:px-0">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between animate-fade-in-up">
                <Link to="/instructor/assignments" className="group flex items-center gap-4 text-[10px] font-black text-brand-muted hover:text-brand-emerald uppercase tracking-[0.3em] transition-all no-underline">
                    <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" /> Back to Evaluation
                </Link>
            </div>

            <header className="space-y-6 animate-fade-in-up">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-brand-emerald/10 rounded-xl">
                        <ClipboardList className="text-brand-emerald" size={18} />
                    </div>
                    <span className="text-brand-emerald font-black text-[10px] uppercase tracking-[0.4em]">Protocol Initialization</span>
                </div>
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-6xl font-black text-brand-charcoal dark:text-white tracking-tighter leading-none uppercase">Create <span className="text-brand-emerald">Assessment</span></h1>
                    <p className="text-brand-muted font-medium text-xl max-w-2xl leading-relaxed">Configure evaluation parameters and distribute instructional artifacts.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <form className="xl:col-span-8 bg-white dark:bg-brand-charcoal rounded-[60px] border border-brand-border p-10 md:p-16 space-y-12 shadow-2xl shadow-brand-charcoal/5" onSubmit={handleSubmit}>
                    {/* Core Parameters */}
                    <div className="space-y-10">
                        <div className="flex items-center gap-4 border-b border-brand-border pb-6">
                            <ShieldCheck className="text-brand-emerald" size={20} />
                            <h3 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Core Parameters</h3>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Assessment Title</label>
                                <input
                                    type="text"
                                    className="w-full h-18 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-base focus:border-brand-emerald transition-all placeholder:text-brand-muted/30"
                                    placeholder="e.g. Q4 Technical Evaluation"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Target Authorization Cohort</label>
                                <select
                                    className="w-full h-18 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-sm focus:border-brand-emerald transition-all appearance-none"
                                    required
                                    value={formData.cohort_id}
                                    onChange={e => setFormData({ ...formData, cohort_id: e.target.value })}
                                >
                                    <option value="">Select Recipient Cohort</option>
                                    {cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Instructional Description</label>
                                <textarea
                                    className="w-full min-h-[200px] p-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[32px] text-brand-charcoal dark:text-white outline-none font-bold text-base focus:border-brand-emerald transition-all placeholder:text-brand-muted/30 resize-none"
                                    placeholder="Detail the expectations and requirements for this evaluation..."
                                    required
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Deadline & Artifact Section */}
                    <div className="space-y-10">
                        <div className="flex items-center gap-4 border-b border-brand-border pb-6">
                            <Zap className="text-brand-emerald" size={20} />
                            <h3 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Timeline & Artifacts</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Termination Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className="w-full h-18 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-sm focus:border-brand-emerald transition-all"
                                        required
                                        value={formData.due_date}
                                        onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                    />
                                    <CalendarDays className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" size={18} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Termination Time</label>
                                <div className="relative">
                                    <input
                                        type="time"
                                        className="w-full h-18 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-sm focus:border-brand-emerald transition-all"
                                        required
                                        value={formData.due_time}
                                        onChange={e => setFormData({ ...formData, due_time: e.target.value })}
                                    />
                                    <Clock className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" size={18} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Instructional Artifact (Optional)</label>
                            {!selectedFile ? (
                                <div onClick={() => document.getElementById('file-input')?.click()} className="p-16 bg-brand-beige/20 dark:bg-white/5 rounded-[40px] border-2 border-brand-border border-dashed text-center space-y-6 group-hover:border-brand-emerald transition-all cursor-pointer">
                                    <input type="file" id="file-input" hidden onChange={handleFileChange} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip" />
                                    <div className="w-20 h-20 bg-white dark:bg-brand-charcoal border-2 border-brand-border rounded-[24px] flex items-center justify-center mx-auto text-brand-muted group-hover:text-brand-emerald group-hover:scale-110 transition-all shadow-sm"><Upload size={40} /></div>
                                    <div className="space-y-1">
                                        <p className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">Attach Protocol</p>
                                        <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest leading-relaxed">PDF, DOCX, ZIP (Max 50MB)</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 bg-brand-emerald/10 border-2 border-brand-emerald/20 rounded-[40px] flex items-center justify-between gap-6 shadow-xl shadow-brand-emerald/5">
                                    <div className="flex items-center gap-6 min-w-0">
                                        <div className="w-16 h-16 bg-brand-emerald text-white rounded-[20px] flex items-center justify-center shrink-0 shadow-lg shadow-brand-emerald/20"><FileText size={32} /></div>
                                        <div className="space-y-1 truncate">
                                            <div className="text-sm font-black text-brand-emerald uppercase tracking-tight truncate">{selectedFile.name}</div>
                                            <div className="text-[9px] font-bold text-brand-emerald/60 uppercase tracking-widest">Target Synchronized</div>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedFile(null)} className="w-12 h-12 flex items-center justify-center hover:bg-red-500 hover:text-white text-brand-muted rounded-xl transition-all border-none bg-transparent cursor-pointer"><X size={20} /></button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-8">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full h-20 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-[28px] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-brand-charcoal/20 dark:shadow-brand-emerald/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4 border-none cursor-pointer"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <>Initialize Assessment <ChevronRight size={24} /></>}
                        </button>
                    </div>
                </form>

                {/* Sidebar: Intelligence */}
                <div className="xl:col-span-4 space-y-8 sticky top-32">
                    <div className="bg-brand-emerald p-10 rounded-[48px] text-white space-y-10 shadow-2xl shadow-brand-emerald/20">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white/10 rounded-xl">
                                <BookOpen size={20} />
                            </div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Protocol Guidelines</h4>
                        </div>
                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 font-black text-xs">01</div>
                                <p className="text-xs font-medium leading-relaxed opacity-80">Assessments are visible to students immediately upon publication protocol completion.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 font-black text-xs">02</div>
                                <p className="text-xs font-medium leading-relaxed opacity-80">One instructional artifact can be synchronized per evaluation protocol.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 bg-white dark:bg-brand-charcoal rounded-[48px] border border-brand-border space-y-8 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-brand-beige/50 dark:bg-white/10 rounded-xl text-brand-emerald">
                                <Clock size={18} />
                            </div>
                            <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-[0.3em]">Termination Logic</h4>
                        </div>
                        <p className="text-xs font-medium text-brand-muted leading-relaxed">
                            Terminal deadlines are absolute. Late submissions will be flagged in the evaluation panel with a time-divergence indicator.
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-4 text-brand-muted text-[10px] font-black uppercase tracking-widest px-4">
                        <Sparkles size={14} className="text-brand-emerald" /> Evaluator Grid Synchronized
                    </div>
                </div>
            </div>
        </div>
    );
}
