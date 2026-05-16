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
    Trophy,
    Search,
    SlidersHorizontal,
    MoreVertical
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
    const [searchQuery, setSearchQuery] = useState('');

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

        // Defensive fallback loader dismissal
        setTimeout(() => {
            setIframeLoading(false);
        }, 5000);
    };

    const filteredAssignments = assignments.filter(a => 
        a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.cohort?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 md:space-y-8 pb-12 max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 text-[#2D312E]">
            {/* Top Header Section */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#E6DFD5] pb-6 md:pb-8">
                <div className="max-w-2xl">
                    <div className="flex items-center gap-2 mb-2.5">
                        <div className="p-1.5 bg-[#1A4D3E]/10 rounded-md">
                            <Sparkles className="text-[#1A4D3E]" size={14} />
                        </div>
                        <span className="text-[#1A4D3E] font-bold text-[10px] md:text-xs uppercase tracking-wider">Academic Portal</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-[#1A4D3E] mb-2">
                        Assignments & Deliverables
                    </h1>
                    <p className="text-[#7A827E] text-xs sm:text-sm md:text-base font-medium leading-relaxed">
                        Manage your academic tasks, download specifications, and track evaluation progress.
                    </p>
                </div>

                {/* Search and Filter Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 sm:w-72 md:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A827E]" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#FBF9F6] border border-[#E6DFD5] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#1A4D3E] transition-colors font-medium placeholder-[#A5ADA9]"
                        />
                    </div>
                    {/* <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FBF9F6] border border-[#E6DFD5] rounded-xl text-sm font-semibold text-[#2D312E] hover:bg-[#F4EFEA] transition-colors whitespace-nowrap">
                        <SlidersHorizontal size={15} />
                        <span>Filters</span>
                    </button> */}
                </div>
            </header>

            {/* Content States */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 md:py-32 gap-3">
                    <Loader2 className="animate-spin text-[#1A4D3E]" size={40} />
                    <p className="text-[10px] font-bold text-[#7A827E] uppercase tracking-widest animate-pulse">Syncing Workspace...</p>
                </div>
            ) : error ? (
                <div className="bg-white p-6 sm:p-10 rounded-[24px] border border-red-100 text-center max-w-xl mx-auto space-y-4 shadow-sm">
                    <div className="w-12 h-12 sm:w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
                        <AlertCircle size={26} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-[#2D312E]">Sync Error</h2>
                        <p className="text-[#7A827E] text-xs sm:text-sm mt-1">{error}</p>
                    </div>
                    <button 
                        onClick={fetchAssignments} 
                        className="w-full sm:w-auto bg-[#1A4D3E] text-white px-6 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider hover:bg-[#12362C] transition-all"
                    >
                        Retry Connection
                    </button>
                </div>
            ) : filteredAssignments.length === 0 ? (
                <div className="bg-[#FBF9F6] py-16 md:py-20 px-4 text-center rounded-[32px] border border-dashed border-[#E6DFD5] max-w-2xl mx-auto">
                    <div className="w-14 h-14 sm:w-16 h-16 bg-[#F4EFEA] rounded-full flex items-center justify-center mx-auto mb-4 text-[#A5ADA9]">
                        <LayoutGrid size={26} />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-[#2D312E] mb-1">No Assignments Found</h2>
                    <p className="text-[#7A827E] text-xs sm:text-sm max-w-xs mx-auto font-medium">Your schedule is currently clear. Active deliverables will appear here.</p>
                </div>
            ) : (
                /* Fully fluid layout system responsive across all devices */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredAssignments.map(a => {
                        const hasSubmitted = !!a.my_submission;
                        const overdue = !hasSubmitted && isOverdue(a.due_date);

                        return (
                            <div 
                                key={a.id} 
                                className="bg-white border border-[#E6DFD5] rounded-[24px] p-5 md:p-6 flex flex-col justify-between hover:shadow-md transition-all duration-300 relative group overflow-hidden"
                            >
                                <div>
                                    {/* Top Row: Context Tag & Options Icon */}
                                    <div className="flex items-center justify-between mb-3.5">
                                        <span className="text-[10px] md:text-[11px] font-semibold text-[#7A827E] uppercase tracking-wider block max-w-[85%] truncate">
                                            {a.cohort?.name || "General Module"}
                                        </span>
                                        <button className="text-[#A5ADA9] hover:text-[#2D312E] transition-colors p-1 -mr-1">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-base md:text-lg font-semibold text-[#2D312E] tracking-tight leading-snug group-hover:text-[#1A4D3E] transition-colors mb-4 line-clamp-2 sm:min-h-[3rem] md:min-h-[3.5rem]">
                                        {a.title}
                                    </h3>

                                    {/* Metadata Row: Calendar and Time */}
                                    <div className="space-y-2 border-b border-[#F4EFEA] pb-4 mb-4">
                                        <div className="flex items-center gap-2 text-xs font-medium text-[#7A827E]">
                                            <Calendar size={14} className="text-[#1A4D3E] flex-shrink-0" />
                                            <span className="truncate">Due: {new Date(a.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-medium text-[#7A827E]">
                                            <Clock size={14} className="text-[#1A4D3E] flex-shrink-0" />
                                            <span className="truncate">Time: {new Date(a.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Dynamic Status Badges & Action CTA Block */}
                                <div className="space-y-3.5">
                                    <div className="flex items-center justify-between gap-2">
                                        {hasSubmitted ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 md:py-1 text-[10px] md:text-[11px] font-semibold uppercase tracking-wider bg-[#E8F2EE] text-[#1A4D3E] rounded-md whitespace-nowrap">
                                                <CheckCircle size={12} /> Completed
                                            </span>
                                        ) : overdue ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 md:py-1 text-[10px] md:text-[11px] font-semibold uppercase tracking-wider bg-red-50 text-red-600 rounded-md whitespace-nowrap">
                                                <AlertCircle size={12} /> Overdue
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 md:py-1 text-[10px] md:text-[11px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-700 rounded-md whitespace-nowrap">
                                                <Clock size={12} /> Pending
                                            </span>
                                        )}

                                        {/* Technical Instructions link */}
                                        {a.assignment_file && (
                                            <button
                                                type="button"
                                                onClick={(e) => handleViewResource(e, a.title, a.assignment_file_url, a.assignment_file)}
                                                className="inline-flex items-center gap-1 text-[10px] md:text-[11px] font-bold uppercase text-[#7A827E] hover:text-[#1A4D3E] transition-colors border-none bg-transparent cursor-pointer whitespace-nowrap p-1"
                                            >
                                                <Eye size={13} /> View Guidelines
                                            </button>
                                        )}
                                    </div>

                                    {/* Action Launch Button Block */}
                                    {hasSubmitted ? (
                                        <div className="w-full bg-[#F4EFEA] text-[#1A4D3E] text-center py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                                            <Trophy size={14} className="flex-shrink-0" /> Submission Received
                                        </div>
                                    ) : (
                                        <Link 
                                            to={`/student/assignments/${a.id}/submit`} 
                                            className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all no-underline text-center border ${
                                                overdue 
                                                    ? 'bg-red-600 border-red-600 text-white hover:bg-red-700' 
                                                    : 'bg-[#1A4D3E] border-[#1A4D3E] text-white hover:bg-[#12362C]'
                                            }`}
                                        >
                                            <span>{overdue ? 'Submit Late' : 'Open Assignment'}</span>
                                            <ArrowRight size={14} className="flex-shrink-0" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Responsive Full-screen Document Viewer Modal */}
            {viewingPdf && (
                <div className="fixed inset-0 z-[2000] bg-[#FBF9F6] flex flex-col animate-in fade-in duration-200">
                    {/* Header: Made highly responsive to preserve layout structural integrity on small phones */}
                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#E6DFD5] flex justify-between items-center bg-white gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1A4D3E]/10 flex items-center justify-center text-[#1A4D3E] flex-shrink-0 hidden xs:flex">
                                <FileText size={18} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-xs sm:text-sm font-semibold text-[#2D312E] truncate max-w-[140px] xs:max-w-[200px] sm:max-w-md md:max-w-xl">
                                    {viewingPdf.title}
                                </h3>
                                <p className="text-[9px] sm:text-[10px] font-bold text-[#7A827E] uppercase tracking-wider mt-0.5 truncate">
                                    {viewingPdf.type === 'office' ? 'Secure Office Viewer' : 'Secure Encrypted PDF Viewer'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                            {viewingPdf.type === 'pdf' && (
                                <button 
                                    onClick={() => setShowAiInteraction(true)}
                                    className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 font-bold text-[9px] sm:text-[11px] uppercase tracking-wider hover:bg-indigo-100 transition-colors"
                                >
                                    <Sparkles size={12} className="sm:size-[13px]" /> 
                                    <span>Virtual Tutor</span>
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setViewingPdf(null);
                                    setIframeLoading(true);
                                }}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#F4EFEA] text-[#7A827E] flex items-center justify-center hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Viewer Sandbox Canvas */}
                    <div 
                        className="flex-1 relative bg-[#F4EFEA] overflow-hidden flex items-center justify-center"
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        {iframeLoading && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#F4EFEA] p-4 text-center">
                                <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-[#1A4D3E] animate-spin mb-3" />
                                <h4 className="font-semibold text-xs sm:text-sm text-[#2D312E]">Loading Document Environment...</h4>
                                <p className="text-[#7A827E] text-[11px] sm:text-xs mt-1">Establishing high-fidelity verification bridge</p>
                            </div>
                        )}
                        {viewingPdf.url && (
                            viewingPdf.type === 'pdf' ? (
                                <div className="w-full h-full overflow-auto flex justify-center">
                                    <SecurePDFViewer 
                                        url={viewingPdf.url} 
                                        onLoadSuccess={() => setIframeLoading(false)} 
                                        hideToolbar={false}
                                    />
                                </div>
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

                    {/* Modal Footer Section */}
                    <div className="px-4 py-2.5 sm:py-3 bg-white border-t border-[#E6DFD5] text-center">
                        <p className="text-[9px] sm:text-[10px] font-bold text-[#A5ADA9] uppercase tracking-widest">End-to-End Encryption Protocol Active</p>
                    </div>
                </div>
            )}

            {/* AI Assistant Overlay Container */}
            {showAiInteraction && viewingPdf && (
                <AIPDFInteraction 
                    pdfUrl={viewingPdf.url} 
                    onClose={() => setShowAiInteraction(false)} 
                />
            )}
        </div>
    );
}