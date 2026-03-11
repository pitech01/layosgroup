import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Upload,
    FileText,
    CheckCircle,
    Loader2,
    Info,
    Download,
    X,
    FolderSync
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SubmitAssignment() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [answerText, setAnswerText] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

        if (!selectedFile && !assignment.my_submission) {
            toast.error("Please upload your assignment file.");
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


    const handleDownload = async (e: React.MouseEvent, id: string, fileName: string) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/assignments/${id}/download`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Download failed');
                }
                throw new Error(`Server Error (${response.status}): The download route was not found on this server.`);
            }

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName || 'assignment-instructions';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error: any) {
            console.error('Download error:', error);
            toast.error(error.message || "Failed to download file. Please try again.");
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <Loader2 className="animate-spin" size={48} color="#1a4d3e" />
            </div>
        );
    }

    return (
        <div className="submit-assignment-container">
            <style>{`
                .submit-assignment-container {
                    max-width: 900px;
                    margin: 2rem auto;
                    padding: 0 1.5rem;
                    font-family: 'Inter', sans-serif;
                }

                .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: #64748b;
                    text-decoration: none;
                    font-weight: 800;
                    font-size: 0.95rem;
                    margin-bottom: 2.5rem;
                    transition: all 0.3s;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                }

                .back-link:hover {
                    color: #0f172a;
                    transform: translateX(-4px);
                }

                .assignment-overview-premium {
                    background: #1a4d3e;
                    border-radius: 40px;
                    padding: 3.5rem;
                    color: white;
                    margin-bottom: 3rem;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(26, 77, 62, 0.25);
                }

                .assignment-overview-premium::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 300px;
                    height: 300px;
                    background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%);
                    pointer-events: none;
                }

                .badge-group {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 1.5rem;
                }

                .glass-badge {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(8px);
                    padding: 6px 14px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .assignment-title-main {
                    font-size: 2.25rem;
                    font-weight: 950;
                    margin: 0 0 1.5rem 0;
                    letter-spacing: -0.04em;
                    line-height: 1.2;
                }

                .instruction-text {
                    font-size: 1.05rem;
                    line-height: 1.7;
                    opacity: 0.9;
                    font-weight: 500;
                    margin-bottom: 2.5rem;
                    max-width: 700px;
                }

                .resource-download-btn {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(255, 255, 255, 0.15);
                    width: fit-content;
                    padding: 1rem 1.5rem;
                    border-radius: 20px;
                    color: white;
                    text-decoration: none;
                    font-weight: 900;
                    font-size: 0.9rem;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    transition: all 0.3s;
                }

                .resource-download-btn:hover {
                    background: white;
                    color: #1a4d3e;
                    transform: translateY(-2px);
                }

                .submission-panel-premium {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 40px;
                    padding: 4rem;
                }

                .form-section-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 2rem;
                }

                .form-section-title h2 {
                    margin: 0;
                    font-size: 1.5rem;
                    font-weight: 900;
                    color: #0f172a;
                    letter-spacing: -0.02em;
                }

                .premium-textarea {
                    width: 100%;
                    min-height: 200px;
                    padding: 1.5rem;
                    background: #f8fafc;
                    border: 2px solid #f1f5f9;
                    border-radius: 24px;
                    font-family: inherit;
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #0f172a;
                    transition: all 0.3s;
                    line-height: 1.6;
                    margin-bottom: 3rem;
                }

                .premium-textarea:focus {
                    outline: none;
                    border-color: #1a4d3e;
                    background: white;
                    box-shadow: 0 0 0 6px rgba(26, 77, 62, 0.05);
                }

                .upload-anchor {
                    border: 3px dashed #e2e8f0;
                    border-radius: 32px;
                    padding: 4rem 2rem;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s;
                    background: #fcfdfe;
                    display: block;
                    margin-bottom: 3rem;
                }

                .upload-anchor:hover {
                    border-color: #1a4d3e;
                    background: #f0f7f4;
                }

                .file-stack-premium {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 24px;
                    padding: 1.5rem 2rem;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    margin-bottom: 3rem;
                }

                .remove-file-btn {
                    margin-left: auto;
                    color: #ef4444;
                    background: #fee2e2;
                    padding: 8px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .remove-file-btn:hover {
                    background: #ef4444;
                    color: white;
                }

                .submit-btn-premium {
                    width: 100%;
                    padding: 1.35rem;
                    background: #1a4d3e;
                    color: white;
                    border: none;
                    border-radius: 24px;
                    font-weight: 900;
                    font-size: 1.25rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 14px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 15px 30px -5px rgba(26, 77, 62, 0.3);
                }

                .submit-btn-premium:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 25px 40px -10px rgba(26, 77, 62, 0.4);
                }

                .submit-btn-premium:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .hint-box {
                    display: flex;
                    gap: 16px;
                    background: #f8fafc;
                    padding: 1.5rem;
                    border-radius: 24px;
                    margin-bottom: 3rem;
                }

                .hint-box p {
                    margin: 0;
                    font-size: 0.9rem;
                    color: #64748b;
                    font-weight: 600;
                    line-height: 1.5;
                }
            `}</style>

            <button onClick={() => navigate(-1)} className="back-link">
                <ArrowLeft size={20} /> Back to Assignments
            </button>

            <div className="assignment-overview-premium">
                <div className="badge-group">
                    <span className="glass-badge">{assignment.cohort?.name}</span>
                    <span className="glass-badge">Due {new Date(assignment.due_date).toLocaleDateString()}</span>
                </div>
                <h1 className="assignment-title-main">{assignment.title}</h1>
                <p className="instruction-text">{assignment.description}</p>

                {assignment.assignment_file && (
                    <button
                        onClick={(e) => handleDownload(e, assignment.id, `${assignment.title.replace(/\s+/g, '-').toLowerCase()}-instructions`)}
                        className="resource-download-btn"
                        style={{ border: '1.5px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}
                    >
                        <Download size={20} /> Download Instructions
                    </button>
                )}
            </div>

            <div className="submission-panel-premium shadow-premium">
                <form onSubmit={handleSubmit}>
                    <div className="form-section-title">
                        <FileText size={24} color="#1a4d3e" />
                        <h2>Notes or Written Answer</h2>
                    </div>

                    <textarea
                        className="premium-textarea"
                        placeholder="Type your optional response or notes for the instructor here..."
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                    />

                    <div className="form-section-title">
                        <Upload size={24} color="#1a4d3e" />
                        <h2>Attach Deliverable</h2>
                    </div>

                    {!selectedFile ? (
                        <label className="upload-anchor">
                            <input
                                type="file"
                                hidden
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
                            />
                            <FolderSync size={48} color="#cbd5e1" style={{ marginBottom: '1.5rem' }} />
                            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>Choose your file</div>
                            <p style={{ color: '#94a3b8', fontWeight: 600, marginTop: '8px' }}>
                                PDF, DOCX, ZIP or Images (Max 50MB)
                            </p>
                        </label>
                    ) : (
                        <div className="file-stack-premium">
                            <div style={{ background: '#1a4d3e', padding: '12px', borderRadius: '12px', color: 'white' }}>
                                <FileText size={20} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 900, color: '#0f172a' }}>{selectedFile.name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 800 }}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for turn-in</div>
                            </div>
                            <div className="remove-file-btn" onClick={() => setSelectedFile(null)}>
                                <X size={20} />
                            </div>
                        </div>
                    )}

                    {assignment.my_submission && !selectedFile && (
                        <div className="hint-box" style={{ background: '#f0fdf4', border: '1px solid #dcfce7' }}>
                            <CheckCircle size={24} color="#166534" style={{ flexShrink: 0 }} />
                            <p style={{ color: '#166534' }}>
                                You have already submitted a file: <strong>{assignment.my_submission.submission_file.split('/').pop()}</strong>.
                                Uploading a new file will replace your previous submission.
                            </p>
                        </div>
                    )}

                    <div className="hint-box">
                        <Info size={24} color="#64748b" style={{ flexShrink: 0 }} />
                        <p>
                            Ensure all requirements mentioned in the instructions are met before turning in.
                            If you're uploading multiple files, please package them into a single ZIP archive.
                        </p>
                    </div>

                    <button className="submit-btn-premium shadow-premium" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <><Loader2 className="animate-spin" size={24} /> Transmitting Data...</>
                        ) : (
                            <><CheckCircle size={24} /> Turn In Assignment</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
