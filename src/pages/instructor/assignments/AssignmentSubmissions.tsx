import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    User
} from 'lucide-react';

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
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const result = await response.json();
            if (response.ok) {
                setData(result);
            } else {
                throw new Error(result.message || 'Failed to fetch submissions.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, [id]);

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
        <div className="submissions-container">
            <style>{`
                .submissions-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    font-family: 'Inter', sans-serif;
                    padding: 2rem;
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

                .assignment-header-premium {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 32px;
                    padding: 3rem;
                    margin-bottom: 3rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                .header-main-info {
                    flex: 1;
                }

                .header-main-info h1 {
                    font-size: 2.5rem;
                    font-weight: 900;
                    color: #0f172a;
                    margin: 0 0 1rem 0;
                    letter-spacing: -0.04em;
                }

                .cohort-label {
                    display: inline-flex;
                    padding: 6px 14px;
                    background: #f1f5f9;
                    color: #475569;
                    border-radius: 10px;
                    font-size: 0.8rem;
                    font-weight: 800;
                    margin-bottom: 1rem;
                    text-transform: uppercase;
                }

                .header-meta-group {
                    display: flex;
                    gap: 2rem;
                    color: #64748b;
                    font-size: 1rem;
                    font-weight: 600;
                }

                .meta-badge {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .stats-box-premium {
                    padding: 1.5rem 2.5rem;
                    background: #f8fafc;
                    border-radius: 24px;
                    text-align: center;
                    border: 1px solid #f1f5f9;
                    min-width: 180px;
                }

                .stats-box-premium .value {
                    font-size: 2rem;
                    font-weight: 950;
                    color: #1a4d3e;
                    line-height: 1.2;
                }

                .stats-box-premium .label {
                    font-size: 0.75rem;
                    color: #94a3b8;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    margin-top: 4px;
                }

                .submissions-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 32px;
                    padding: 3rem;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04);
                }

                .search-container {
                    position: relative;
                    margin-bottom: 2.5rem;
                }

                .search-icon-fixed {
                    position: absolute;
                    left: 1.25rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                }

                .premium-search-input {
                    width: 100%;
                    padding: 1rem 1.25rem 1rem 3.5rem;
                    background: #f8fafc;
                    border: 2px solid #f1f5f9;
                    border-radius: 18px;
                    font-weight: 600;
                    font-size: 1rem;
                    transition: all 0.3s;
                    color: #0f172a;
                }

                .premium-search-input:focus {
                    outline: none;
                    border-color: #1a4d3e;
                    background: white;
                    box-shadow: 0 0 0 5px rgba(26, 77, 62, 0.05);
                }

                .submissions-table-header {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr 1.5fr 120px;
                    padding: 1rem 1.5rem;
                    background: #f8fafc;
                    border-radius: 14px;
                    margin-bottom: 1rem;
                    font-weight: 900;
                    font-size: 0.75rem;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .submission-item-row {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr 1.5fr 120px;
                    align-items: center;
                    padding: 1.5rem;
                    background: white;
                    border: 1px solid #f1f5f9;
                    border-radius: 20px;
                    margin-bottom: 1rem;
                    gap: 1.5rem;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .submission-item-row:hover {
                    border-color: #1a4d3e;
                    background: #fcfdfe;
                    transform: scale(1.01);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
                }

                .student-info-group {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .student-avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 16px;
                    background: #f1f5f9;
                    color: #1a4d3e;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 900;
                    font-size: 1.2rem;
                    flex-shrink: 0;
                }

                .student-text h3 {
                    margin: 0;
                    font-size: 1rem;
                    font-weight: 800;
                    color: #0f172a;
                }

                .student-text p {
                    margin: 0;
                    font-size: 0.8rem;
                    color: #94a3b8;
                    font-weight: 600;
                }

                .timestamp-cell {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #475569;
                    font-size: 0.9rem;
                    font-weight: 700;
                }

                .answer-cell {
                    color: #64748b;
                    font-size: 0.85rem;
                    font-weight: 600;
                    line-height: 1.5;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .action-cell {
                    display: flex;
                    justify-content: center;
                }

                .download-btn-premium {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    background: #f0fdf4;
                    color: #1a4d3e;
                    padding: 10px 18px;
                    border-radius: 12px;
                    text-decoration: none;
                    font-size: 0.8rem;
                    font-weight: 900;
                    transition: all 0.2s;
                    border: 1px solid transparent;
                }

                .download-btn-premium:hover {
                    background: #1a4d3e;
                    color: white;
                    border-color: #1a4d3e;
                }
            `}</style>

            <button onClick={() => navigate(-1)} className="back-link">
                <ArrowLeft size={20} /> Back to Assignments
            </button>

            {loading ? (
                <div style={{ padding: '10rem 0', textAlign: 'center' }}>
                    <Loader2 className="animate-spin" size={60} color="#1a4d3e" style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: '2rem', fontWeight: 800, color: '#64748b', fontSize: '1.2rem' }}>Processing submission records...</p>
                </div>
            ) : error ? (
                <div style={{ padding: '4rem', background: '#fff1f2', borderRadius: '40px', textAlign: 'center', border: '1px solid #ffe4e6' }}>
                    <AlertCircle size={56} color="#e11d48" style={{ margin: '0 auto 1.5rem' }} />
                    <h2 style={{ margin: 0, fontWeight: 900, color: '#0f172a', fontSize: '1.8rem' }}>Operation Aborted</h2>
                    <p style={{ color: '#64748b', fontWeight: 600, margin: '1rem 0 2.5rem' }}>{error}</p>
                    <button onClick={fetchSubmissions} className="btn-create" style={{ margin: '0 auto', width: 'auto', padding: '1rem 2rem' }}>Retry Sync</button>
                </div>
            ) : (
                <>
                    <div className="assignment-header-premium shadow-premium">
                        <div className="header-main-info">
                            <span className="cohort-label">{data.assignment?.cohort?.name}</span>
                            <h1>{data.assignment?.title}</h1>
                            <div className="header-meta-group">
                                <div className="meta-badge">
                                    <Calendar size={20} color="#1a4d3e" />
                                    <span>Due {new Date(data.assignment?.due_date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                                </div>
                                <div className="meta-badge">
                                    <CheckCircle2 size={20} color="#1a4d3e" />
                                    <span>{data.submissions?.length || 0} Responses received</span>
                                </div>
                                {data.assignment?.assignment_file && (
                                    <a
                                        href={getFileUrl(data.assignment.assignment_file)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="meta-badge"
                                        style={{ color: '#1a4d3e', textDecoration: 'underline' }}
                                    >
                                        <FileText size={20} />
                                        <span>Instructions File</span>
                                    </a>
                                )}
                            </div>
                        </div>
                        <div className="stats-box-premium shadow-sm">
                            <div className="value">
                                {data.submissions?.length || 0}
                            </div>
                            <div className="label">Total Submissions</div>
                        </div>
                    </div>

                    <div className="submissions-card shadow-premium">
                        <div className="search-container">
                            <Search className="search-icon-fixed" size={24} />
                            <input
                                type="text"
                                className="premium-search-input"
                                placeholder="Filter by student name or email identification..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="submissions-table-header">
                            <div>Student Information</div>
                            <div>Submitted At</div>
                            <div>Answer / Note</div>
                            <div style={{ textAlign: 'center' }}>Resource</div>
                        </div>

                        {filteredSubmissions.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '6rem 0' }}>
                                <User size={64} color="#cbd5e1" style={{ marginBottom: '1.5rem' }} />
                                <h3 style={{ margin: 0, fontWeight: 900, color: '#0f172a', fontSize: '1.4rem' }}>No student records matched</h3>
                                <p style={{ color: '#64748b', fontWeight: 600 }}>Try adjusting your search query for "{searchTerm}"</p>
                            </div>
                        ) : (
                            <div className="submissions-list">
                                {filteredSubmissions.map((submission: any) => (
                                    <div key={submission.id} className="submission-item-row">
                                        <div className="student-info-group">
                                            <div className="student-avatar">
                                                {submission.student?.name.charAt(0)}
                                            </div>
                                            <div className="student-text">
                                                <h3>{submission.student?.name}</h3>
                                                <p>{submission.student?.email}</p>
                                            </div>
                                        </div>

                                        <div className="timestamp-cell">
                                            <Clock size={16} />
                                            {new Date(submission.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>

                                        <div className="answer-cell">
                                            {submission.answer_text ? submission.answer_text : (
                                                <span style={{ fontStyle: 'italic', opacity: 0.6 }}>No accompanying text provided.</span>
                                            )}
                                        </div>

                                        <div className="action-cell">
                                            {submission.submission_file ? (
                                                <a
                                                    href={getFileUrl(submission.submission_file, submission.submission_file_url)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="download-btn-premium"
                                                >
                                                    <Download size={16} />
                                                    <span>REVIEW</span>
                                                </a>
                                            ) : (
                                                <span style={{ fontSize: '0.7rem', fontWeight: 950, color: '#94a3b8' }}>N/A</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
