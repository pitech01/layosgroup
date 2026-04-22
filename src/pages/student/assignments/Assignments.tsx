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
    Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AIPDFInteraction from '../../../components/student/AIPDFInteraction';

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
        <div className="student-assignments-container">
            <style>{`
                .student-assignments-container {
                    max-width: 1000px;
                    margin: 2rem auto;
                    padding: 0 1.5rem;
                    font-family: 'Inter', sans-serif;
                }

                .page-header {
                    margin-bottom: 3.5rem;
                }

                .page-header h1 {
                    font-size: 2.75rem;
                    font-weight: 950;
                    color: #0f172a;
                    margin: 0 0 0.75rem 0;
                    letter-spacing: -0.05em;
                }

                .page-header p {
                    color: #64748b;
                    font-weight: 600;
                    font-size: 1.1rem;
                }

                .assignment-stack {
                    display: grid;
                    gap: 1.5rem;
                }

                .assignment-card-premium {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 32px;
                    padding: 2.25rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 2rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }

                .assignment-card-premium:hover {
                    border-color: #1a4d3e;
                    transform: translateY(-4px) scale(1.01);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
                }

                .card-left {
                    display: flex;
                    gap: 1.5rem;
                    align-items: flex-start;
                    flex: 1;
                }

                .icon-container {
                    width: 64px;
                    height: 64px;
                    border-radius: 20px;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #1a4d3e;
                    flex-shrink: 0;
                }

                .title-section {
                    flex: 1;
                }

                .cohort-label {
                    font-size: 0.75rem;
                    font-weight: 900;
                    color: #1a4d3e;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    margin-bottom: 0.5rem;
                    display: block;
                }

                .title-text {
                    font-size: 1.35rem;
                    font-weight: 900;
                    color: #0f172a;
                    margin: 0 0 0.75rem 0;
                    letter-spacing: -0.02em;
                }

                .meta-tags {
                    display: flex;
                    gap: 1.25rem;
                    flex-wrap: wrap;
                }

                .meta-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #64748b;
                    font-size: 0.9rem;
                    font-weight: 700;
                }

                .status-badge {
                    padding: 8px 16px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .submitted { background: #f0fdf4; color: #166534; }
                .pending { background: #fffbeb; color: #92400e; }
                .overdue { background: #fef2f2; color: #b91c1c; }

                .card-right {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 1rem;
                }

                .btn-submit-premium {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #1a4d3e;
                    color: white;
                    padding: 0.85rem 1.75rem;
                    border-radius: 16px;
                    text-decoration: none;
                    font-weight: 900;
                    transition: all 0.25s;
                    box-shadow: 0 4px 6px -1px rgba(26, 77, 62, 0.2);
                }

                .btn-submit-premium:hover {
                    box-shadow: 0 10px 15px -3px rgba(26, 77, 62, 0.4);
                    transform: translateY(-2px);
                }

                .download-resource {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: #475569;
                    font-size: 0.8rem;
                    font-weight: 800;
                    text-decoration: none;
                    transition: color 0.2s;
                }

                .download-resource:hover {
                    color: #1a4d3e;
                }

                @media (max-width: 768px) {
                    .assignment-card-premium {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .card-right {
                        align-items: flex-start;
                        width: 100%;
                    }
                }
            `}</style>

            <div className="page-header">
                <h1>Active Assignments</h1>
                <p>Coursework tasks and deliverables for your active cohorts.</p>
            </div>

            {loading ? (
                <div style={{ padding: '10rem 0', textAlign: 'center' }}>
                    <Loader2 className="animate-spin" size={60} color="#1a4d3e" style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: '2rem', fontWeight: 800, color: '#64748b', fontSize: '1.2rem' }}>Acquiring assignment data...</p>
                </div>
            ) : error ? (
                <div style={{ padding: '4rem', background: '#fff1f2', borderRadius: '40px', textAlign: 'center', border: '1px solid #ffe4e6' }}>
                    <AlertCircle size={56} color="#e11d48" style={{ margin: '0 auto 1.5rem' }} />
                    <h2 style={{ margin: 0, fontWeight: 900, color: '#0f172a', fontSize: '1.8rem' }}>Navigation Error</h2>
                    <p style={{ color: '#64748b', fontWeight: 600, margin: '1rem 0 2.5rem' }}>{error}</p>
                    <button onClick={fetchAssignments} className="btn-submit-premium" style={{ margin: '0 auto' }}>Reconnect</button>
                </div>
            ) : assignments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '10rem 2rem', background: 'white', border: '2px dashed #e2e8f0', borderRadius: '40px' }}>
                    <ClipboardList size={80} color="#cbd5e1" style={{ marginBottom: '2rem' }} />
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: '0 0 1rem 0' }}>All clear!</h2>
                    <p style={{ color: '#64748b', fontWeight: 600, fontSize: '1.1rem' }}>You don't have any assignments pending at this moment.</p>
                </div>
            ) : (
                <div className="assignment-stack">
                    {assignments.map(a => {
                        const hasSubmitted = !!a.my_submission;
                        const overdue = !hasSubmitted && isOverdue(a.due_date);

                        return (
                            <div key={a.id} className="assignment-card-premium shadow-sm">
                                <div className="card-left">
                                    <div className="icon-container">
                                        <FileText size={28} />
                                    </div>
                                    <div className="title-section">
                                        <span className="cohort-label">{a.cohort?.name}</span>
                                        <h3 className="title-text">{a.title}</h3>
                                        <div className="meta-tags">
                                            <div className="meta-badge">
                                                <Calendar size={18} />
                                                Due {new Date(a.due_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <div className="meta-badge">
                                                <Clock size={18} />
                                                {new Date(a.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            {hasSubmitted ? (
                                                <span className="status-badge submitted">Turned In</span>
                                            ) : overdue ? (
                                                <span className="status-badge overdue">Missing</span>
                                            ) : (
                                                <span className="status-badge pending">Assigned</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="card-right">
                                    {a.assignment_file && (
                                        <button
                                            type="button"
                                            onClick={(e) => handleViewResource(e, a.title, a.assignment_file_url, a.assignment_file)}
                                            className="download-resource"
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                        >
                                            <Eye size={16} /> View Instructions
                                        </button>
                                    )}

                                    {hasSubmitted ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 900, fontSize: '1rem', background: '#f0fdf4', padding: '0.85rem 1.5rem', borderRadius: '14px' }}>
                                            <CheckCircle size={20} /> Completed
                                        </div>
                                    ) : (
                                        <Link to={`/student/assignments/${a.id}/submit`} className="btn-submit-premium shadow-premium">
                                            {overdue ? 'Submit Late' : 'Open Assignment'} <ArrowRight size={20} />
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
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    background: 'white',
                }}>
                    <div style={{
                        background: 'white',
                        overflow: 'hidden',
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        <div style={{
                            padding: '1.25rem 2rem',
                            borderBottom: '1.5px solid #f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#fcfdfe'
                        }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{ padding: '10px', borderRadius: '14px', background: '#f0fdf4' }}>
                                    <FileText size={22} color="#1a4d3e" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontWeight: 950, color: '#0f172a', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {viewingPdf.title}
                                        {viewingPdf.type === 'office' && (
                                            <span style={{ fontSize: '0.7rem', background: '#1a4d3e', color: 'white', padding: '2px 8px', borderRadius: '8px', fontWeight: 800 }}>Use Keyboard Arrows to skip slides </span>
                                        )}
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Secure {viewingPdf.type === 'office' ? 'Document' : 'PDF'} Viewer • Click anywhere on the slide to advance</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {viewingPdf.type === 'pdf' && (
                                    <button 
                                        onClick={() => setShowAiInteraction(true)}
                                        style={{ 
                                            background: 'rgba(139, 92, 246, 0.1)', 
                                            border: '1.5px solid #8b5cf6',
                                            padding: '4px 12px',
                                            borderRadius: '100px',
                                            color: '#8b5cf6',
                                            fontSize: '0.7rem',
                                            fontWeight: 800,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <Sparkles size={14} /> Virtual Tutor
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setViewingPdf(null);
                                        setIframeLoading(true);
                                    }}
                                    style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer' }}
                                >
                                    <X size={22} />
                                </button>
                            </div>
                        </div>
                         <div
                            style={{ flex: 1, background: '#f8fafc', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onContextMenu={(e) => e.preventDefault()}
                        >
                            {(iframeLoading) && (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', zIndex: 10 }}>
                                    <div style={{ position: 'relative', marginBottom: '2rem' }}>
                                        <div style={{ width: '80px', height: '80px', borderRadius: '24px', border: '4px solid #f1f5f9', borderTopColor: '#1a4d3e', animation: 'spin 1s linear infinite' }}></div>
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FileText size={32} color="#1a4d3e" opacity={0.3} />
                                        </div>
                                    </div>
                                    <h4 style={{ margin: 0, fontWeight: 900, color: '#0f172a', fontSize: '1.25rem' }}>
                                        Architecting Secure View...
                                    </h4>
                                    <p style={{ marginTop: '0.75rem', fontWeight: 600, color: '#64748b', fontSize: '0.9rem' }}>
                                        Preparing high-fidelity instructional workspace
                                    </p>
                                    <style>{`
                                        @keyframes spin { to { transform: rotate(360deg); } }
                                    `}</style>
                                </div>
                            )}
                            {viewingPdf.url && (
                                <iframe
                                    src={viewingPdf.type === 'office' ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(viewingPdf.url)}` : `${viewingPdf.url}#toolbar=0&navpanes=0`}
                                    style={{ width: '100%', height: '100%', border: 'none', opacity: iframeLoading ? 0 : 1, transition: 'opacity 0.4s ease' }}
                                    title="Secure Document Viewer"
                                    onLoad={() => setIframeLoading(false)}
                                    allow="fullscreen"
                                />
                            )}
                            {/* Overlay to catch clicks on any remaining toolbar elements if browser injects them */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40px', background: 'transparent', zIndex: 5, pointerEvents: 'none' }}></div>
                        </div>


                        <div style={{ padding: '0.75rem 2rem', background: '#fcfdfe', borderTop: '1.5px solid #f1f5f9', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Protected by Layos Group Security Protocol</p>
                        </div>
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
