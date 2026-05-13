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
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="animate-spin text-brand-emerald" size={40} />
                <p className="font-black text-xs text-brand-muted uppercase tracking-[0.2em] animate-pulse">Initializing Interface...</p>
            </div>
        );
    }

    if (!assignment) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-12 animate-fade-in-up">
            {/* Back Button */}
            <button 
                onClick={() => navigate(-1)} 
                className="group flex items-center gap-2 text-brand-muted hover:text-brand-charcoal dark:hover:text-white font-black text-xs uppercase tracking-widest transition-all bg-transparent border-none cursor-pointer p-0"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                Back to Grid
            </button>

            {/* Premium Assignment Overview */}
            <div className="relative bg-brand-charcoal dark:bg-brand-emerald rounded-[40px] p-8 md:p-12 text-white overflow-hidden shadow-2xl shadow-brand-charcoal/20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <div className="relative z-10 space-y-6">
                    <div className="flex flex-wrap gap-3">
                        <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest">
                            {assignment.cohort?.name}
                        </span>
                        <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-brand-beige">
                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none">{assignment.title}</h1>
                    <p className="text-lg font-medium text-brand-beige/80 max-w-2xl leading-relaxed">
                        {assignment.description}
                    </p>

                    {assignment.assignment_file && (
                        <button
                            type="button"
                            onClick={handleViewResource}
                            className="inline-flex items-center gap-3 bg-white/10 hover:bg-white text-white hover:text-brand-charcoal px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-white/20 transition-all cursor-pointer"
                        >
                            <Eye size={18} /> View Technical Specifications
                        </button>
                    )}
                </div>
            </div>

            {/* Submission Panel */}
            <div className="bg-white dark:bg-brand-charcoal rounded-[40px] border border-brand-border p-8 md:p-16 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-12">
                    {/* Notes Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-emerald/10 rounded-xl">
                                <FileText size={22} className="text-brand-emerald" />
                            </div>
                            <h2 className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Written Submission</h2>
                        </div>

                        <textarea
                            className="w-full min-h-[200px] p-6 bg-brand-beige/30 dark:bg-white/5 border-2 border-brand-border rounded-[32px] focus:outline-none focus:border-brand-emerald focus:bg-white transition-all text-brand-charcoal dark:text-white font-medium text-lg leading-relaxed resize-none"
                            placeholder="Provide your written response or additional notes for the evaluator..."
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                        />
                    </div>

                    {/* File Upload Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-emerald/10 rounded-xl">
                                <CloudUpload size={22} className="text-brand-emerald" />
                            </div>
                            <h2 className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Attachment Protocol</h2>
                        </div>

                        {!selectedFile ? (
                            <label className="group relative block bg-brand-beige/30 dark:bg-white/5 border-4 border-dashed border-brand-border rounded-[40px] p-12 md:p-20 text-center cursor-pointer hover:bg-brand-emerald/5 hover:border-brand-emerald transition-all duration-500">
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
                                />
                                <div className="space-y-4">
                                    <div className="w-20 h-20 bg-brand-beige dark:bg-white/10 rounded-[32px] flex items-center justify-center mx-auto text-brand-muted group-hover:text-brand-emerald group-hover:scale-110 transition-all duration-500">
                                        <FolderSync size={40} />
                                    </div>
                                    <div>
                                        <div className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Transmit Deliverable</div>
                                        <p className="text-brand-muted font-bold text-sm uppercase tracking-widest mt-2">
                                            PDF, DOCX, ZIP or IMAGES • Limit 50MB
                                        </p>
                                    </div>
                                </div>
                            </label>
                        ) : (
                            <div className="bg-brand-beige/30 dark:bg-white/5 border border-brand-border rounded-[32px] p-8 flex items-center gap-6 group">
                                <div className="w-16 h-16 bg-brand-emerald text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-emerald/20">
                                    <FileText size={28} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-lg font-black text-brand-charcoal dark:text-white truncate uppercase tracking-tight">{selectedFile.name}</div>
                                    <div className="text-xs font-black text-brand-muted uppercase tracking-[0.2em] mt-1">
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Unit Prepared
                                    </div>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setSelectedFile(null)}
                                    className="w-12 h-12 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Submission History / Feedback */}
                    {assignment.my_submission && !selectedFile && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[32px] flex flex-col md:flex-row items-center gap-8 justify-between">
                            <div className="flex items-center gap-6 text-emerald-600 dark:text-emerald-400">
                                <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                                    <CheckCircle size={24} />
                                </div>
                                <p className="font-bold leading-relaxed text-sm">
                                    {assignment.my_submission.submission_file ? (
                                        <>Existing unit found: <span className="font-black underline">{assignment.my_submission.submission_file.split('/').pop()}</span>.</>
                                    ) : (
                                        <>A text-based response is currently recorded.</>
                                    )}
                                    <br />
                                    <span className="opacity-70 text-xs font-black uppercase tracking-widest mt-1 block">New submissions will overwrite current records.</span>
                                </p>
                            </div>
                            {assignment.my_submission.submission_file_url && (
                                <a 
                                    href={assignment.my_submission.submission_file_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-emerald-500 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest no-underline shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                                >
                                    <Eye size={16} /> Audit Current Upload
                                </a>
                            )}
                        </div>
                    )}

                    {/* Submission Protocol Note */}
                    <div className="flex gap-4 p-8 bg-brand-beige/20 dark:bg-white/5 rounded-[32px]">
                        <Info size={24} className="text-brand-muted shrink-0" />
                        <p className="text-brand-muted text-sm font-bold leading-relaxed">
                            Verify all technical requirements as specified in the instructional brief. For multiple artifacts, please compile into a single ZIP archive to maintain data integrity.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-20 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-[24px] font-black text-xl uppercase tracking-[0.2em] shadow-2xl shadow-brand-charcoal/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 border-none cursor-pointer flex items-center justify-center gap-4"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="animate-spin" size={28} /> Synchronizing...</>
                        ) : (
                            <><CheckCircle size={28} strokeWidth={3} /> Commit to Evaluation</>
                        )}
                    </button>
                </form>
            </div>

            {/* Global Document Viewer Modal */}
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
                                    Instructional Brief • Secure Tunnel Active
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
                                <h4 className="font-black text-brand-charcoal dark:text-white uppercase tracking-widest">Reconstructing Document...</h4>
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
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Layos Virtual Ecosystem • End-to-End Encryption Protocol</p>
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
