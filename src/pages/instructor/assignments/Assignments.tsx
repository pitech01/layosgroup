import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ClipboardList,
    Plus,
    Calendar,
    ChevronRight,
    Clock,
    Search,
    Filter,
    Loader2,
    AlertCircle,
    FileText,
    Trash2,
    Sparkles,
    Zap,
    Inbox,
    ArrowUpRight,
    ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';

export default function InstructorAssignments() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const fetchAssignments = async () => {
        try {
            const response = await fetch(`${API_URL}/instructor/assignments`, {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.status === 401) { logout(); navigate('/instructor-login'); return; }
            const data = await response.json();
            if (response.ok) setAssignments(data);
            else throw new Error(data.message || 'Retrieval failure.');
        } catch (err: any) {
            if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
                toast.error('Network sync lost');
                setTimeout(() => { logout(); navigate('/instructor-login'); }, 2000);
            } else setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Redact this assignment and all associated student artifacts?')) return;
        try {
            const response = await fetch(`${API_URL}/instructor/assignments/${id}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                setAssignments(prev => prev.filter(a => a.id !== id));
                toast.success('Assignment redacted');
            } else throw new Error('Deletion failure.');
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    useEffect(() => { fetchAssignments(); }, []);

    const filteredAssignments = assignments.filter(a =>
        a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.cohort?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-32 px-6 md:px-0">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 animate-fade-in-up">
                <div className="space-y-6 flex-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-brand-emerald/10 rounded-xl">
                            <ClipboardList className="text-brand-emerald" size={18} />
                        </div>
                        <span className="text-brand-emerald font-black text-[10px] uppercase tracking-[0.4em]">Curriculum Control</span>
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-black text-brand-charcoal dark:text-white tracking-tighter leading-none uppercase">Manage <span className="text-brand-emerald">Assessments</span></h1>
                        <p className="text-brand-muted font-medium text-xl max-w-2xl leading-relaxed">Orchestrate academic evaluations and review student performance artifacts.</p>
                    </div>
                </div>

                <Link 
                    to="/instructor/assignments/create" 
                    className="h-20 px-10 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-[32px] font-black text-xs uppercase tracking-[0.3em] flex items-center gap-4 shadow-2xl shadow-brand-charcoal/20 transition-all hover:scale-105 active:scale-95 group no-underline"
                >
                    <Plus size={24} className="group-hover:rotate-90 transition-transform" /> New Assignment
                </Link>
            </header>

            {/* Controls Bar */}
            <div className="flex flex-col xl:flex-row gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex-1 relative group">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-emerald transition-colors" size={24} />
                    <input
                        type="text"
                        placeholder="Filter assessments by title or cohort identity..."
                        className="w-full h-20 pl-20 pr-10 bg-white dark:bg-brand-charcoal border-2 border-brand-border rounded-[32px] focus:outline-none focus:border-brand-emerald transition-all text-sm font-bold text-brand-charcoal dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="h-20 px-10 bg-white dark:bg-white/5 border-2 border-brand-border rounded-[32px] flex items-center gap-4 font-black text-[10px] uppercase tracking-[0.3em] text-brand-muted hover:text-brand-emerald transition-all border-none cursor-pointer">
                    <Filter size={20} /> Evaluation Protocol
                </button>
            </div>

            {/* Grid / Content */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {loading ? (
                    <div className="py-40 flex flex-col items-center justify-center gap-8 bg-brand-beige/20 dark:bg-white/5 rounded-[60px] border-2 border-brand-border border-dashed">
                        <Loader2 className="animate-spin text-brand-emerald" size={64} />
                        <p className="font-black text-[10px] text-brand-muted uppercase tracking-[0.4em] animate-pulse">Syncing Evaluation Grid...</p>
                    </div>
                ) : error ? (
                    <div className="p-20 bg-red-50 dark:bg-red-500/5 border-2 border-red-100 dark:border-red-500/10 rounded-[60px] text-center space-y-8">
                        <AlertCircle size={64} className="text-red-500 mx-auto" />
                        <div className="space-y-4">
                            <h3 className="text-3xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">Sync Terminated</h3>
                            <p className="text-red-600/60 dark:text-red-400/60 font-medium">{error}</p>
                        </div>
                        <button onClick={fetchAssignments} className="px-10 h-16 bg-red-500 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all border-none cursor-pointer">Re-Establish Sync</button>
                    </div>
                ) : filteredAssignments.length === 0 ? (
                    <div className="bg-white dark:bg-brand-charcoal py-40 text-center rounded-[60px] border-2 border-brand-border border-dashed shadow-sm space-y-10">
                        <div className="w-32 h-32 bg-brand-beige dark:bg-white/5 rounded-[48px] flex items-center justify-center mx-auto text-brand-muted/30 group relative overflow-hidden">
                            <Inbox size={64} className="group-hover:scale-125 transition-transform duration-1000" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-4xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">Assessment Vacuum</h3>
                            <p className="text-brand-muted font-medium text-lg max-w-md mx-auto">No academic evaluations have been initialized in the current sector.</p>
                        </div>
                        <Link to="/instructor/assignments/create" className="inline-flex h-18 px-12 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-[32px] font-black text-xs uppercase tracking-[0.4em] items-center gap-4 shadow-2xl shadow-brand-charcoal/20 no-underline hover:scale-105 transition-all">
                            Initialize Protocol <Plus size={20} />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredAssignments.map((assignment, idx) => (
                            <div key={assignment.id} className="group bg-white dark:bg-brand-charcoal rounded-[56px] border border-brand-border p-10 flex flex-col hover:shadow-[0_40px_80px_-20px_rgba(26,77,62,0.15)] transition-all duration-700 relative overflow-hidden animate-fade-in-up" style={{ animationDelay: `${0.1 * idx}s` }}>
                                <div className="absolute top-0 right-0 p-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                    <button onClick={() => handleDelete(assignment.id)} className="w-10 h-10 flex items-center justify-center bg-red-500/10 border-2 border-red-500/20 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"><Trash2 size={16} /></button>
                                </div>

                                <div className="flex-1 space-y-10">
                                    <div className="flex items-center gap-4">
                                        <div className="px-4 py-1.5 bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                                            {assignment.cohort?.name || 'General Terminal'}
                                        </div>
                                        {assignment.assignment_file && (
                                            <div className="p-1.5 bg-brand-beige dark:bg-white/10 rounded-lg text-brand-muted" title="Instructional Artifact Attached">
                                                <FileText size={12} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-3xl font-black text-brand-charcoal dark:text-white tracking-tighter leading-tight group-hover:text-brand-emerald transition-colors line-clamp-2 uppercase">
                                            {assignment.title}
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-brand-muted font-bold text-[11px] uppercase tracking-wider">
                                                <Calendar size={14} className="text-brand-emerald" /> 
                                                <span>Deadline: {new Date(assignment.due_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-brand-muted font-bold text-[11px] uppercase tracking-wider">
                                                <Clock size={14} className="text-brand-emerald" /> 
                                                <span>Terminal: {new Date(assignment.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-brand-muted font-medium text-sm line-clamp-2 leading-relaxed">
                                        {assignment.description}
                                    </p>
                                </div>

                                <div className="mt-12 pt-10 border-t border-brand-border flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="text-3xl font-black text-brand-charcoal dark:text-white leading-none tracking-tighter">
                                            {assignment.submissions_count || 0}
                                        </div>
                                        <div className="text-[9px] font-black text-brand-muted uppercase tracking-[0.2em]">Submissions</div>
                                    </div>
                                    <Link 
                                        to={`/instructor/assignments/${assignment.id}/submissions`} 
                                        className="w-16 h-16 bg-brand-beige/50 dark:bg-white/5 group-hover:bg-brand-emerald border-2 border-brand-border rounded-[24px] flex items-center justify-center text-brand-muted group-hover:text-white transition-all shadow-xl shadow-brand-charcoal/5"
                                    >
                                        <ArrowRight size={24} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-center gap-6 p-10 bg-brand-beige/10 dark:bg-white/5 rounded-xl border border-brand-border border-dashed text-brand-muted text-[10px] font-black uppercase tracking-[0.2em] animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <Sparkles size={16} className="text-brand-emerald" />
                Evaluations are synchronized with student dashboard timelines in real-time.
            </div>
        </div>
    );
}
