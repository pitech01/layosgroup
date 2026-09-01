import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Upload,
    FileText,
    CheckCircle,
    Loader2,
    Info,
    Eye,
    X,
    FolderSync,
    Sparkles,
    ShieldCheck,
    CloudUpload
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AIPDFInteraction from '../../../components/student/AIPDFInteraction';
import SecurePDFViewer from '../../../components/student/SecurePDFViewer';

export default function SubmitAssignment() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [answerText, setAnswerText] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string; type: 'pdf' | 'office' } | null>(null);
    const [iframeLoading, setIframeLoading] = useState(true);
    const [showAiInteraction, setShowAiInteraction] = useState(false);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const fetchAssignment = async () => {
        try {
            const response = await fetch(`${API_URL}/student/assignments`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                const found = data.find((a: any) => a.id.toString() === id);
                if (found) {
                    setAssignment(found);
                    if (found.my_submission) {
                        setAnswerText(found.my_submission.answer_text || '');
                    }
                } else {
                    throw new Error('Assignment not found.');
                }
            }
        } catch (err: any) {
            toast.error(err.message);
            navigate('/student/assignments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignment();
    }, [id, navigate]);

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

        if (!selectedFile && !assignment.my_submission && !answerText.trim()) {
            toast.error("Please upload your assignment file or write a response.");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('answer_text', answerText);
            if (selectedFile) {
                formData.append('submission_file', selectedFile);
            }

            const response = await fetch(`${API_URL}/student/assignments/${id}/submit`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (response.ok) {
                toast.success("Assignment turned in successfully!");
                navigate('/student/assignments');
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Transmission failed.');
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewResource = (e: React.MouseEvent) => {
        e.preventDefault();
        
        if (!assignment.assignment_file || !assignment.assignment_file_url) {
            toast.error("Instruction file is not available.");
            return;
        }

        let type: 'pdf' | 'office' = 'pdf';
        const filename = assignment.assignment_file.toLowerCase();
        
        if (filename.endsWith('.pptx') || filename.endsWith('.ppt') || filename.endsWith('.doc') || filename.endsWith('.docx') || filename.endsWith('.xls') || filename.endsWith('.xlsx')) {
            type = 'office';
        }
        
        setViewingPdf({ url: assignment.assignment_file_url, title: assignment.title, type });
        setIframeLoading(true);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] gap-4 bg-[var(--index-card-bg)]">
                <Loader2 className="animate-spin text-[var(--index-primary-color)]" size={44} />
                <p className="font-bold text-xs text-[var(--index-primary-color)]/60 uppercase tracking-[0.25em] animate-pulse">Initializing Interface...</p>
            </div>
        );
    }

    if (!assignment) return null;

    return (
        <div className="min-h-screen bg-[var(--index-card-bg)] px-4 md:px-8 py-8 selection:bg-[var(--index-primary-color)]/10">
            <div className="max-w-5xl mx-auto space-y-8 pb-16">
                
                {/* Back Nav Button */}
                <button 
                    onClick={() => navigate(-1)} 
                    className="group flex items-center gap-2.5 text-[var(--index-primary-color)]/70 hover:text-[var(--index-primary-color)] font-bold text-xs uppercase tracking-widest transition-all bg-transparent border-none cursor-pointer p-0"
                >
                    <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" /> 
                    Back to Assignments
                </button>

                {/* Premium Header Card Block */}
                <div className="relative bg-[var(--index-primary-color)] rounded-[32px] p-8 md:p-12 text-white overflow-hidden shadow-xl shadow-[var(--index-primary-color)]/10">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    
                    <div className="relative z-10 space-y-6">
                        <div className="flex flex-wrap gap-2.5">
                            <span className="px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-bold uppercase tracking-wider text-[var(--lgl-success)]">
                                {assignment.cohort?.name || "March Cohort"}
                            </span>
                            <span className="px-3.5 py-1.5 bg-lgl-warning/20 text-lgl-warning rounded-full text-[11px] font-bold uppercase tracking-wider">
                                Due: {new Date(assignment.due_date).toLocaleDateString()}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--index-bg-color)]">{assignment.title}</h1>
                        <p className="text-base text-[var(--index-bg-color)]/80 max-w-3xl leading-relaxed font-normal">
                            {assignment.description}
                        </p>

                        {assignment.assignment_file && (
                            <button
                                type="button"
                                onClick={handleViewResource}
                                className="inline-flex items-center gap-2.5 bg-[var(--index-bg-color)] text-[var(--index-primary-color)] hover:bg-[var(--index-bg-color)]/90 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.98] cursor-pointer"
                            >
                                <Eye size={16} /> View Assignment Instructions
                            </button>
                        )}
                    </div>
                </div>

                {/* Workspace Matrix Dashboard */}
                <div className="bg-[var(--index-bg-color)] rounded-[32px] border border-[var(--index-border-color)] p-6 md:p-10 shadow-sm space-y-10">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        
                        {/* Interactive Rich Notes Field */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[var(--index-primary-color)]/5 rounded-xl">
                                    <FileText size={20} className="text-[var(--index-primary-color)]" />
                                </div>
                                <h2 className="text-sm font-bold text-[var(--index-primary-color)] uppercase tracking-wider">Written Deliverable Summary</h2>
                            </div>

                            <textarea
                                className="w-full min-h-[180px] p-5 bg-[var(--index-card-bg)]/30 border-2 border-[var(--index-border-color)] rounded-2xl focus:outline-none focus:border-[var(--index-primary-color)] focus:bg-white dark:focus:bg-[var(--index-card-bg)] transition-all text-[var(--index-primary-color)] font-medium text-base placeholder-[var(--index-primary-color)]/40 leading-relaxed resize-none shadow-inner"
                                placeholder="Write any accompanying notes or direct textual submission here for your evaluator..."
                                value={answerText}
                                onChange={(e) => setAnswerText(e.target.value)}
                            />
                        </div>

                        {/* File Dropzone Component Block */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[var(--index-primary-color)]/5 rounded-xl">
                                    <CloudUpload size={20} className="text-[var(--index-primary-color)]" />
                                </div>
                                <h2 className="text-sm font-bold text-[var(--index-primary-color)] uppercase tracking-wider">File Submission Protocol</h2>
                            </div>

                            {!selectedFile ? (
                                <label className="group relative block bg-[var(--index-card-bg)]/20 border-2 border-dashed border-[var(--index-border-color)] hover:border-[var(--index-primary-color)] rounded-2xl p-10 text-center cursor-pointer hover:bg-[var(--index-primary-color)]/5 transition-all duration-300">
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
                                    />
                                    <div className="space-y-3">
                                        <div className="w-14 h-14 bg-[var(--index-card-bg)] rounded-2xl flex items-center justify-center mx-auto text-[var(--index-primary-color)]/60 group-hover:scale-105 transition-transform duration-300">
                                            <FolderSync size={26} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-[var(--index-primary-color)]">Upload Deliverable File</div>
                                            <p className="text-[var(--index-primary-color)]/50 font-semibold text-[11px] uppercase tracking-wider mt-1.5">
                                                PDF, DOCX, ZIP, or Images &bull; Up to 50MB
                                            </p>
                                        </div>
                                    </div>
                                </label>
                            ) : (
                                <div className="bg-[var(--index-card-bg)]/30 border border-[var(--index-border-color)] rounded-2xl p-5 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[var(--index-primary-color)] text-white rounded-xl flex items-center justify-center shadow-md">
                                        <FileText size={22} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-[var(--index-primary-color)] truncate">{selectedFile.name}</div>
                                        <div className="text-[11px] font-bold text-[var(--index-primary-color)]/50 uppercase tracking-wider mt-0.5">
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB &bull; Asset Ready
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setSelectedFile(null)}
                                        className="w-9 h-9 bg-red-500/10 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Audit Tracking Alert Flag */}
                        {assignment.my_submission && !selectedFile && (
                            <div className="bg-[var(--lgl-success)]/60 border border-[var(--lgl-success)] p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                                <div className="flex items-center gap-3.5 text-[var(--index-primary-hover)]">
                                    <div className="w-10 h-10 bg-[var(--index-primary-color)] text-white rounded-xl flex items-center justify-center shrink-0">
                                        <CheckCircle size={20} />
                                    </div>
                                    <div className="text-sm">
                                        {assignment.my_submission.submission_file ? (
                                            <p className="font-medium">Active Record Found: <span className="font-bold underline">{assignment.my_submission.submission_file.split('/').pop()}</span></p>
                                        ) : (
                                            <p className="font-medium">Text submission content recorded.</p>
                                        )}
                                        <span className="text-[var(--index-primary-hover)]/70 text-xs font-semibold block mt-0.5">New saves automatically overwrite previous submissions.</span>
                                    </div>
                                </div>
                                {assignment.my_submission.submission_file_url && (
                                    <a 
                                        href={assignment.my_submission.submission_file_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 bg-[var(--index-primary-color)] text-white hover:bg-[var(--index-primary-color)]/90 px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-wider no-underline shadow-sm transition-all"
                                    >
                                        <Eye size={14} /> Audit Current Upload
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Informational Guideline Badge */}
                        <div className="flex gap-3 p-5 bg-[var(--index-card-bg)]/40 border border-[var(--index-border-color)] rounded-2xl">
                            <Info size={18} className="text-[var(--index-primary-color)]/60 shrink-0 mt-0.5" />
                            <p className="text-[var(--index-primary-color)]/70 text-xs font-medium leading-relaxed">
                                Ensure your workspace components match the architectural outline specified. For compound files or modular projects, package into a standard .ZIP package archive.
                            </p>
                        </div>

                        {/* Master Action Trigger CTA */}
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-14 bg-[var(--index-primary-color)] hover:bg-[var(--index-primary-color)]/95 text-white rounded-xl font-bold text-sm uppercase tracking-[0.15em] shadow-lg shadow-[var(--index-primary-color)]/10 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 border-none cursor-pointer flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="animate-spin" size={18} /> Transmitting Data...</>
                            ) : (
                                <><CheckCircle size={18} /> Turn in Assignment</>
                            )}
                        </button>
                    </form>
                </div>

                {/* Secure Overlay Frame System Container */}
                {viewingPdf && (
                    <div className="fixed inset-0 z-[2000] bg-[var(--index-card-bg)] flex flex-col animate-in fade-in duration-200">
                        <div className="px-6 py-4 border-b border-[var(--index-border-color)] flex justify-between items-center bg-[var(--index-bg-color)]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[var(--index-primary-color)]/5 flex items-center justify-center text-[var(--index-primary-color)]">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[var(--index-primary-color)] uppercase tracking-wide leading-none">
                                        {viewingPdf.title}
                                    </h3>
                                    <p className="text-[10px] font-bold text-[var(--index-primary-color)]/50 uppercase tracking-widest mt-1">
                                        Instructional Material View
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                {viewingPdf.type === 'pdf' && (
                                    <button 
                                        onClick={() => setShowAiInteraction(true)}
                                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-brand-emerald text-brand-emerald font-bold text-[11px] uppercase tracking-wider hover:bg-brand-emerald hover:text-white transition-all bg-transparent cursor-pointer"
                                    >
                                        <Sparkles size={13} /> Layos Virtual Tutor
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setViewingPdf(null);
                                        setIframeLoading(true);
                                    }}
                                    className="w-10 h-10 rounded-xl bg-[var(--index-card-bg)] text-[var(--index-primary-color)]/60 hover:text-red-600 flex items-center justify-center transition-all border-none cursor-pointer"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div 
                            className="flex-1 relative bg-[var(--index-border-color)] overflow-hidden flex items-center justify-center"
                            onContextMenu={(e) => e.preventDefault()}
                        >
                            {iframeLoading && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--index-border-color)]">
                                    <div className="w-12 h-12 border-4 border-[var(--index-border-color)] border-t-[var(--index-primary-color)] rounded-full animate-spin mb-4" />
                                    <h4 className="text-xs font-bold text-[var(--index-primary-color)] uppercase tracking-widest">Building Document Space...</h4>
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
                                        title="Secure Document Window"
                                        onLoad={() => setIframeLoading(false)}
                                        allow="fullscreen"
                                    />
                                )
                            )}
                        </div>

                        <div className="px-6 py-3 bg-[var(--index-bg-color)] border-t border-[var(--index-border-color)] text-center">
                            <p className="text-[10px] font-bold text-[var(--index-primary-color)]/40 uppercase tracking-widest">Layos Learning Architecture Environment</p>
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
        </div>
    );
}