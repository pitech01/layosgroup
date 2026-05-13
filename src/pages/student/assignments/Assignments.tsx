import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
    ClipboardList,
    Calendar,
    ArrowRight,
    CheckCircle,
    Clock,
    AlertCircle,
    Loader2,
    FileText,
    Eye,
    X,
    Sparkles,
    LayoutGrid,
    Trophy
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AIPDFInteraction from '../../../components/student/AIPDFInteraction';
import SecurePDFViewer from '../../../components/student/SecurePDFViewer';

export default function StudentAssignments() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string, type: 'pdf' | 'office' } | null>(null);
    const [iframeLoading, setIframeLoading] = useState(true);
    const [showAiInteraction, setShowAiInteraction] = useState(false);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const fetchAssignments = async () => {
        try {
            const response = await fetch(`${API_URL}/student/assignments`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.status === 401) {
                logout();
                navigate('/login');
                return;
            }

            const data = await response.json();
            if (response.ok) {
                setAssignments(data);
            } else {
                throw new Error(data.message || 'Failed to fetch assignments.');
            }
        } catch (err: any) {
            console.error("Fetch Error:", err);
            if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
                toast.error('Connection failed. Redirecting to login...');
                setTimeout(() => {
                    logout();
                    navigate('/login');
                }, 2000);
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, []);

    const isOverdue = (dueDate: string) => {
        return new Date(dueDate) < new Date();
    };

    const handleViewResource = (e: React.MouseEvent, title: string, fileUrl?: string, rawFileName?: string) => {
        e.preventDefault();
        if (!fileUrl || !rawFileName) {
            toast.error("Instruction file is not available.");
            return;
        }

        let type: 'pdf' | 'office' = 'pdf';
        const filename = rawFileName.toLowerCase();
        
        if (filename.endsWith('.pptx') || filename.endsWith('.ppt') || filename.endsWith('.doc') || filename.endsWith('.docx') || filename.endsWith('.xls') || filename.endsWith('.xlsx')) {
            type = 'office';
        }

        setViewingPdf({ url: fileUrl, title, type });
        setIframeLoading(true);
    };

    return (
        <div className="space-y-12 pb-12">
            {/* Header */}
            <header className="max-w-3xl animate-fade-in-up">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-brand-emerald/10 rounded-lg">
                        <Sparkles className="text-brand-emerald" size={18} />
                    </div>
                    <span className="text-brand-emerald font-black text-xs uppercase tracking-widest">Academic Tasks</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-brand-charcoal dark:text-white tracking-tight mb-4">
                    Coursework <span className="text-brand-emerald">& Deliverables</span>
                </h1>
                <p className="text-brand-muted font-medium text-lg leading-relaxed">
                    Track your assignments, access instructional materials, and manage your academic progress across all active modules.
                </p>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="animate-spin text-brand-emerald" size={48} />
                    <p className="font-black text-xs text-brand-muted uppercase tracking-[0.2em] animate-pulse">Syncing Assignment Grid...</p>
                </div>
            ) : error ? (
                <div className="bg-white dark:bg-brand-charcoal p-12 rounded-[40px] border border-red-100 dark:border-red-900/30 text-center space-y-6 shadow-xl shadow-red-500/5">
                    <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                        <AlertCircle size={40} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Sync Error</h2>
                        <p className="text-brand-muted font-medium mt-2">{error}</p>
                    </div>
                    <button 
                        onClick={fetchAssignments} 
                        className="bg-brand-emerald text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all border-none cursor-pointer shadow-xl shadow-brand-emerald/20"
                    >
                        Retry Connection
                    </button>
                </div>
            ) : assignments.length === 0 ? (
                <div className="bg-white dark:bg-brand-charcoal py-24 text-center rounded-[40px] border border-brand-border shadow-sm border-dashed">
                    <div className="w-24 h-24 bg-brand-beige dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-brand-muted/30">
                        <LayoutGrid size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-brand-charcoal dark:text-white mb-3 uppercase tracking-tight">Ecosystem Clear</h2>
                    <p className="text-brand-muted font-medium max-w-md mx-auto">No pending assignments found in your active curriculums. Keep up the excellent work.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {assignments.map(a => {
                        const hasSubmitted = !!a.my_submission;
                        const overdue = !hasSubmitted && isOverdue(a.due_date);

                        return (
                            <div key={a.id} className="bg-white dark:bg-brand-charcoal p-8 md:p-10 rounded-[40px] border border-brand-border flex flex-col lg:flex-row justify-between lg:items-center gap-8 hover:shadow-2xl hover:shadow-brand-emerald/5 transition-all duration-500 group relative overflow-hidden">
                                <div className="flex gap-8 items-start flex-1 relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-brand-beige dark:bg-white/5 flex items-center justify-center text-brand-emerald shrink-0 shadow-inner border border-brand-border group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                        <FileText size={32} />
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-brand-emerald uppercase tracking-[0.2em] px-3 py-1 bg-brand-emerald/10 rounded-lg border border-brand-emerald/20">{a.cohort?.name}</span>
                                            {hasSubmitted ? (
                                                <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                                    <CheckCircle size={14} /> Completed
                                                </span>
                                            ) : overdue ? (
                                                <span className="flex items-center gap-1.5 text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse">
                                                    <AlertCircle size={14} /> Overdue
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                                                    <Clock size={14} /> Pending
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-black text-brand-charcoal dark:text-white tracking-tight leading-tight">{a.title}</h3>
                                        <div className="flex flex-wrap gap-6 items-center">
                                            <div className="flex items-center gap-2 text-brand-muted text-xs font-black uppercase tracking-widest">
                                                <Calendar size={16} className="text-brand-emerald" />
                                                Due: {new Date(a.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <div className="flex items-center gap-2 text-brand-muted text-xs font-black uppercase tracking-widest">
                                                <Clock size={16} className="text-brand-emerald" />
                                                {new Date(a.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row lg:flex-col lg:items-end gap-4 shrink-0 relative z-10">
                                    {a.assignment_file && (
                                        <button
                                            type="button"
                                            onClick={(e) => handleViewResource(e, a.title, a.assignment_file_url, a.assignment_file)}
                                            className="flex items-center justify-center gap-2 bg-transparent text-brand-muted hover:text-brand-emerald font-black text-[10px] uppercase tracking-widest py-2 px-4 rounded-xl transition-all border-none cursor-pointer"
                                        >
                                            <Eye size={16} /> Technical Instructions
                                        </button>
                                    )}

                                    {hasSubmitted ? (
                                        <div className="bg-emerald-500 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
                                            <Trophy size={20} /> Accomplished
                                        </div>
                                    ) : (
                                        <Link 
                                            to={`/student/assignments/${a.id}/submit`} 
                                            className={`
                                                px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 no-underline
                                                ${overdue ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-brand-charcoal dark:bg-brand-emerald text-white shadow-brand-charcoal/20 dark:shadow-brand-emerald/20'}
                                            `}
                                        >
                                            {overdue ? 'Remediate' : 'Launch Assignment'} <ArrowRight size={20} />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Secure PDF Viewer Modal */}
            {viewingPdf && (
                <div className="fixed inset-0 z-[2000] bg-white dark:bg-brand-charcoal flex flex-col animate-in fade-in duration-300">
                    <div className="px-8 py-6 border-b border-brand-border flex justify-between items-center bg-white/80 dark:bg-brand-charcoal/80 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-emerald/10 flex items-center justify-center text-brand-emerald">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">
                                    {viewingPdf.title}
                                </h3>
                                <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] mt-1">
                                    Secure {viewingPdf.type === 'office' ? 'Document' : 'Credential'} Viewer
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {viewingPdf.type === 'pdf' && (
                                <button 
                                    onClick={() => setShowAiInteraction(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500 text-indigo-500 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all active:scale-95 cursor-pointer bg-transparent"
                                >
                                    <Sparkles size={14} /> Virtual Tutor
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setViewingPdf(null);
                                    setIframeLoading(true);
                                }}
                                className="w-12 h-12 rounded-2xl bg-brand-beige dark:bg-white/10 text-brand-muted flex items-center justify-center hover:text-red-500 transition-all border-none cursor-pointer"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    <div 
                        className="flex-1 relative bg-brand-beige dark:bg-brand-charcoal overflow-hidden flex items-center justify-center"
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        {iframeLoading && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-brand-beige dark:bg-brand-charcoal">
                                <div className="w-16 h-16 border-4 border-brand-border border-t-brand-emerald rounded-full animate-spin mb-6" />
                                <h4 className="font-black text-brand-charcoal dark:text-white uppercase tracking-widest">Synchronizing Workspace...</h4>
                                <p className="text-brand-muted font-black text-[10px] uppercase tracking-widest mt-2 animate-pulse">Establishing high-fidelity secure tunnel</p>
                            </div>
                        )}
                        {viewingPdf.url && (
                            viewingPdf.type === 'pdf' ? (
                                <SecurePDFViewer 
                                    url={viewingPdf.url} 
                                    onLoadSuccess={() => setIframeLoading(false)} 
                                    hideToolbar={false}
                                />
                            ) : (
                                <iframe
                                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(viewingPdf.url)}`}
                                    className="w-full h-full border-none"
                                    title="Secure Document Viewer"
                                    onLoad={() => setIframeLoading(false)}
                                    allow="fullscreen"
                                />
                            )
                        )}
                    </div>

                    <div className="px-8 py-4 bg-brand-beige/20 dark:bg-brand-charcoal border-t border-brand-border text-center">
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">End-to-End Encryption Protocol Active</p>
                    </div>
                </div>
            )}

            {showAiInteraction && viewingPdf && (
                <AIPDFInteraction 
                    pdfUrl={viewingPdf.url} 
                    onClose={() => setShowAiInteraction(false)} 
                />
            )}
        </div>
    );
}
