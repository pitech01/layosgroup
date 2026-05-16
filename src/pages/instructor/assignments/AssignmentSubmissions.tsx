import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    FileText,
    Download,
    Calendar,
    Search,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Clock,
    User,
    ChevronRight,
    Zap,
    ShieldCheck,
    Sparkles,
    Eye,
    Inbox,
    Mail,
    ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AssignmentSubmissions() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    const BASE_URL = API_URL.replace('/api', '');

    const fetchSubmissions = async () => {
        try {
            const response = await fetch(`${API_URL}/instructor/assignments/${id}/submissions`, {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const result = await response.json();
            if (response.ok) setData(result);
            else throw new Error(result.message || 'Retrieval failure.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSubmissions(); }, [id]);

    const filteredSubmissions = data?.submissions?.filter((s: any) =>
        s.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.student?.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const getFileUrl = (path: string, url_override?: string) => {
        if (url_override) return url_override;
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${BASE_URL}/storage/${path}`;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-32 px-6 md:px-0">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between animate-fade-in-up">
                <Link to="/instructor/assignments" className="group flex items-center gap-4 text-[10px] font-black text-brand-muted hover:text-brand-emerald uppercase tracking-[0.3em] transition-all no-underline">
                    <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" /> Back to Assessments
                </Link>
            </div>

            {loading ? (
                <div className="h-[60vh] flex flex-col items-center justify-center gap-8 animate-pulse">
                    <Loader2 className="animate-spin text-brand-emerald" size={64} />
                    <p className="font-black text-[10px] text-brand-muted uppercase tracking-[0.4em]">Aggregating Submission Data...</p>
                </div>
            ) : error ? (
                <div className="p-20 bg-red-50 dark:bg-red-500/5 border-2 border-red-100 dark:border-red-500/10 rounded-[60px] text-center space-y-8">
                    <AlertCircle size={64} className="text-red-500 mx-auto" />
                    <div className="space-y-4">
                        <h3 className="text-3xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">Sync Error</h3>
                        <p className="text-red-600/60 dark:text-red-400/60 font-medium">{error}</p>
                    </div>
                    <button onClick={fetchSubmissions} className="px-10 h-16 bg-red-500 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all border-none cursor-pointer">Re-Establish Sync</button>
                </div>
            ) : (
                <>
                    {/* Assignment Info Card */}
                    <header className="bg-white dark:bg-brand-charcoal rounded-[60px] border border-brand-border p-10 md:p-16 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 shadow-2xl shadow-brand-charcoal/5 animate-fade-in-up">
                        <div className="space-y-8 flex-1">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="px-5 py-2 bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                                    {data.assignment?.cohort?.name || 'Authorized Cohort'}
                                </div>
                                <div className="flex items-center gap-3 text-brand-muted font-bold text-[11px] uppercase tracking-wider">
                                    <Calendar size={14} className="text-brand-emerald" /> 
                                    Due {new Date(data.assignment?.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h1 className="text-4xl md:text-5xl font-black text-brand-charcoal dark:text-white tracking-tighter leading-none uppercase">{data.assignment?.title}</h1>
                                {data.assignment?.assignment_file && (
                                    <a href={getFileUrl(data.assignment.assignment_file)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 text-brand-emerald font-black text-[10px] uppercase tracking-widest hover:translate-x-2 transition-transform no-underline">
                                        <FileText size={16} /> Reference Artifact Attached <ChevronRight size={14} />
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-6 p-8 bg-brand-beige/20 dark:bg-white/5 rounded-xl border border-brand-border min-w-[240px]">
                            <div className="w-16 h-16 bg-brand-emerald text-white rounded-[24px] flex items-center justify-center shadow-lg shadow-brand-emerald/20 shrink-0">
                                <CheckCircle2 size={32} />
                            </div>
                            <div className="space-y-1">
                                <div className="text-4xl font-black text-brand-charcoal dark:text-white tracking-tighter leading-none">
                                    {data.submissions?.length || 0}
                                </div>
                                <div className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Total Responses</div>
                            </div>
                        </div>
                    </header>

                    {/* Submissions List */}
                    <div className="space-y-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-brand-emerald/10 rounded-xl text-brand-emerald">
                                    <Eye size={20} />
                                </div>
                                <h3 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Review Manifest</h3>
                            </div>
                            <div className="w-full md:w-96 relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-emerald transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by student identity..."
                                    className="w-full h-16 pl-16 pr-6 bg-white dark:bg-brand-charcoal border-2 border-brand-border rounded-[24px] focus:outline-none focus:border-brand-emerald transition-all text-sm font-bold text-brand-charcoal dark:text-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {filteredSubmissions.length === 0 ? (
                            <div className="bg-white dark:bg-brand-charcoal py-32 text-center rounded-[60px] border-2 border-brand-border border-dashed shadow-sm space-y-8">
                                <div className="w-24 h-24 bg-brand-beige dark:bg-white/5 rounded-[32px] flex items-center justify-center mx-auto text-brand-muted/30 group">
                                    <Inbox size={48} className="group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">Response Vacuum</h3>
                                    <p className="text-brand-muted font-medium text-base max-w-xs mx-auto">No student records were identified matching your query filter.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {filteredSubmissions.map((submission: any, idx: number) => (
                                    <div key={submission.id} className="group bg-white dark:bg-brand-charcoal rounded-xl border border-brand-border p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-10 hover:shadow-xl hover:shadow-brand-charcoal/5 transition-all duration-500 animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                                        <div className="flex flex-col md:flex-row items-center gap-8 flex-1 w-full">
                                            {/* Student Identity */}
                                            <div className="flex items-center gap-6 min-w-[280px]">
                                                <div className="w-20 h-20 bg-brand-beige/50 dark:bg-white/5 rounded-[28px] border-2 border-brand-border flex items-center justify-center text-brand-charcoal dark:text-white font-black text-2xl shrink-0 group-hover:bg-brand-emerald group-hover:text-white group-hover:border-brand-emerald transition-all duration-500">
                                                    {submission.student?.name.charAt(0)}
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="text-xl font-black text-brand-charcoal dark:text-white tracking-tight uppercase leading-none">{submission.student?.name}</h4>
                                                    <div className="flex items-center gap-2 text-brand-muted font-bold text-[10px] uppercase tracking-widest">
                                                        <Mail size={12} className="text-brand-emerald" /> {submission.student?.email}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Submission Metadata */}
                                            <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-16 flex-1 w-full">
                                                <div className="space-y-2 shrink-0">
                                                    <div className="text-[9px] font-black text-brand-muted uppercase tracking-[0.2em]">Transmission Log</div>
                                                    <div className="flex items-center gap-3 text-brand-charcoal dark:text-white font-bold text-xs uppercase tracking-tight">
                                                        <Clock size={16} className="text-brand-emerald" />
                                                        {new Date(submission.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>

                                                <div className="space-y-2 flex-1 w-full">
                                                    <div className="text-[9px] font-black text-brand-muted uppercase tracking-[0.2em]">Evaluation Note</div>
                                                    <p className="text-sm font-medium text-brand-muted line-clamp-2 leading-relaxed">
                                                        {submission.answer_text || "No accompanying protocol notes provided."}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Cell */}
                                        <div className="shrink-0 w-full md:w-auto">
                                            {submission.submission_file ? (
                                                <a 
                                                    href={getFileUrl(submission.submission_file, submission.submission_file_url)} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="w-full md:w-48 h-18 bg-brand-emerald text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-xl shadow-brand-emerald/10 hover:scale-105 active:scale-95 transition-all no-underline"
                                                >
                                                    <Download size={18} /> Review Artifact
                                                </a>
                                            ) : (
                                                <div className="w-full md:w-48 h-18 bg-brand-beige/50 dark:bg-white/5 border-2 border-brand-border border-dashed rounded-[24px] flex items-center justify-center text-brand-muted text-[10px] font-black uppercase tracking-[0.3em]">
                                                    N/A
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            <div className="flex items-center justify-center gap-6 p-10 bg-brand-beige/10 dark:bg-white/5 rounded-xl border border-brand-border border-dashed text-brand-muted text-[10px] font-black uppercase tracking-[0.2em] animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Sparkles size={16} className="text-brand-emerald" />
                Response artifacts are archived and accessible for retroactive evaluation cycles.
            </div>
        </div>
    );
}
