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
                .staff-scope .submissions-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    font-family: 'Inter', sans-serif;
                    padding: 2rem;
                }

                .staff-scope .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--index-text-secondary);
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

                .staff-scope .back-link:hover {
                    color: var(--index-text-heading);
                    transform: translateX(-4px);
                }

                .staff-scope .assignment-header-premium {
                    background: white;
                    border: 1px solid var(--index-border-color);
                    border-radius: 32px;
                    padding: 3rem;
                    margin-bottom: 3rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                .staff-scope .header-main-info {
                    flex: 1;
                }

                .staff-scope .header-main-info h1 {
                    font-size: 2.5rem;
                    font-weight: 900;
                    color: var(--index-text-heading);
                    margin: 0 0 1rem 0;
                    letter-spacing: -0.04em;
                }

                .staff-scope .cohort-label {
                    display: inline-flex;
                    padding: 6px 14px;
                    background: var(--index-hover-bg);
                    color: var(--index-text-secondary);
                    border-radius: 10px;
                    font-size: 0.8rem;
                    font-weight: 800;
                    margin-bottom: 1rem;
                    text-transform: uppercase;
                }

                .staff-scope .header-meta-group {
                    display: flex;
                    gap: 2rem;
                    color: var(--index-text-secondary);
                    font-size: 1rem;
                    font-weight: 600;
                }

                .staff-scope .meta-badge {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .staff-scope .stats-box-premium {
                    padding: 1.5rem 2.5rem;
                    background: var(--index-hover-bg);
                    border-radius: 24px;
                    text-align: center;
                    border: 1px solid var(--index-hover-bg);
                    min-width: 180px;
                }

                .stats-box-premium .value {
                    font-size: 2rem;
                    font-weight: 950;
                    color: var(--index-primary-color);
                    line-height: 1.2;
                }

                .stats-box-premium .label {
                    font-size: 0.75rem;
                    color: var(--index-text-faint);
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    margin-top: 4px;
                }

                .staff-scope .submissions-card {
                    background: white;
                    border: 1px solid var(--index-border-color);
                    border-radius: 32px;
                    padding: 3rem;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04);
                }

                .staff-scope .search-container {
                    position: relative;
                    margin-bottom: 2.5rem;
                }

                .staff-scope .search-icon-fixed {
                    position: absolute;
                    left: 1.25rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--index-text-faint);
                }

                .staff-scope .premium-search-input {
                    width: 100%;
                    padding: 1rem 1.25rem 1rem 3.5rem;
                    background: var(--index-hover-bg);
                    border: 2px solid var(--index-hover-bg);
                    border-radius: 18px;
                    font-weight: 600;
                    font-size: 1rem;
                    transition: all 0.3s;
                    color: var(--index-text-heading);
                }

                .staff-scope .premium-search-input:focus {
                    outline: none;
                    border-color: var(--index-primary-color);
                    background: white;
                    box-shadow: 0 0 0 5px color-mix(in srgb, var(--index-primary-color) 5%, transparent);
                }

                .staff-scope .submissions-table-header {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr 1.5fr 120px;
                    padding: 1rem 1.5rem;
                    background: var(--index-hover-bg);
                    border-radius: 14px;
                    margin-bottom: 1rem;
                    font-weight: 900;
                    font-size: 0.75rem;
                    color: var(--index-text-faint);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .staff-scope .submission-item-row {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr 1.5fr 120px;
                    align-items: center;
                    padding: 1.5rem;
                    background: white;
                    border: 1px solid var(--index-hover-bg);
                    border-radius: 20px;
                    margin-bottom: 1rem;
                    gap: 1.5rem;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .staff-scope .submission-item-row:hover {
                    border-color: var(--index-primary-color);
                    background: var(--index-card-bg);
                    transform: scale(1.01);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
                }

                .staff-scope .student-info-group {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .staff-scope .student-avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 16px;
                    background: var(--index-hover-bg);
                    color: var(--index-primary-color);
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
                    color: var(--index-text-heading);
                }

                .staff-scope .student-text p {
                    margin: 0;
                    font-size: 0.8rem;
                    color: var(--index-text-faint);
                    font-weight: 600;
                }

                .staff-scope .timestamp-cell {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--index-text-secondary);
                    font-size: 0.9rem;
                    font-weight: 700;
                }

                .staff-scope .answer-cell {
                    color: var(--index-text-secondary);
                    font-size: 0.85rem;
                    font-weight: 600;
                    line-height: 1.5;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .staff-scope .action-cell {
                    display: flex;
                    justify-content: center;
                }

                .staff-scope .download-btn-premium {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    background: color-mix(in srgb, var(--lgl-success) 15%, transparent);
                    color: var(--index-primary-color);
                    padding: 10px 18px;
                    border-radius: 12px;
                    text-decoration: none;
                    font-size: 0.8rem;
                    font-weight: 900;
                    transition: all 0.2s;
                    border: 1px solid transparent;
                }

                .staff-scope .download-btn-premium:hover {
                    background: var(--index-primary-color);
                    color: white;
                    border-color: var(--index-primary-color);
                }
            `}</style>

            <button onClick={() => navigate(-1)} className="back-link">
                <ArrowLeft size={20} /> Back to Assignments
            </button>

            {loading ? (
                <div style={{ padding: '10rem 0', textAlign: 'center' }}>
                    <Loader2 className="animate-spin" size={60} color="var(--index-primary-color)" style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: '2rem', fontWeight: 800, color: 'var(--index-text-secondary)', fontSize: '1.2rem' }}>Processing submission records...</p>
                </div>
            ) : error ? (
                <div style={{ padding: '4rem', background: 'var(--index-danger-bg-soft)', borderRadius: '40px', textAlign: 'center', border: '1px solid var(--index-danger-bg-soft)' }}>
                    <AlertCircle size={56} color="var(--lgl-error)" style={{ margin: '0 auto 1.5rem' }} />
                    <h2 style={{ margin: 0, fontWeight: 900, color: 'var(--index-text-heading)', fontSize: '1.8rem' }}>Operation Aborted</h2>
                    <p style={{ color: 'var(--index-text-secondary)', fontWeight: 600, margin: '1rem 0 2.5rem' }}>{error}</p>
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
                                    <Calendar size={20} color="var(--index-primary-color)" />
                                    <span>Due {new Date(data.assignment?.due_date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                                </div>
                                <div className="meta-badge">
                                    <CheckCircle2 size={20} color="var(--index-primary-color)" />
                                    <span>{data.submissions?.length || 0} Responses received</span>
                                </div>
                                {data.assignment?.assignment_file && (
                                    <a
                                        href={getFileUrl(data.assignment.assignment_file)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="meta-badge"
                                        style={{ color: 'var(--index-primary-color)', textDecoration: 'underline' }}
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
                                <User size={64} color="var(--index-text-faint)" style={{ marginBottom: '1.5rem' }} />
                                <h3 style={{ margin: 0, fontWeight: 900, color: 'var(--index-text-heading)', fontSize: '1.4rem' }}>No student records matched</h3>
                                <p style={{ color: 'var(--index-text-secondary)', fontWeight: 600 }}>Try adjusting your search query for "{searchTerm}"</p>
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
                                                <span style={{ fontSize: '0.7rem', fontWeight: 950, color: 'var(--index-text-faint)' }}>N/A</span>
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
