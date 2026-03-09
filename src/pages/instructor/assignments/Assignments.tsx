import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    FileText
} from 'lucide-react';

export default function InstructorAssignments() {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const fetchAssignments = async () => {
        try {
            // We use the same Store/Index logic. I'll need to make sure backend has index if not there.
            // Wait, I only added store, submissions, studentAssignments. I need instructorIndex.
            const response = await fetch(`${API_URL}/instructor/assignments`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setAssignments(data);
            } else {
                // If 404/invalid, maybe I missed adding instructorIndex to controller.
                throw new Error(data.message || 'Failed to fetch assignments.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, []);

    const filteredAssignments = assignments.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.cohort?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="assignments-container">
            <style>{`
                .assignments-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    font-family: 'Inter', sans-serif;
                    padding: 2rem;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 3rem;
                }

                .header-content h1 {
                    font-size: 2.5rem;
                    font-weight: 900;
                    color: #0f172a;
                    margin: 0 0 0.5rem 0;
                    letter-spacing: -0.04em;
                }

                .header-content p {
                    color: #64748b;
                    font-weight: 600;
                    margin: 0;
                    font-size: 1.1rem;
                }

                .btn-create {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: #1a4d3e;
                    color: white;
                    padding: 1rem 2rem;
                    border-radius: 16px;
                    text-decoration: none;
                    font-weight: 900;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 10px 15px -3px rgba(26, 77, 62, 0.3);
                }

                .btn-create:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 20px 25px -5px rgba(26, 77, 62, 0.4);
                }

                .search-bar {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 20px;
                    padding: 1.25rem;
                    margin-bottom: 2.5rem;
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                .search-input-group {
                    flex: 1;
                    position: relative;
                }

                .search-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                }

                .search-input {
                    width: 100%;
                    padding: 0.85rem 1rem 0.85rem 3rem;
                    border: 1px solid #f1f5f9;
                    border-radius: 14px;
                    font-size: 1rem;
                    font-weight: 600;
                    background: #f8fafc;
                    transition: all 0.2s;
                    color: #0f172a;
                }

                .search-input:focus {
                    outline: none;
                    border-color: #1a4d3e;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(26, 77, 62, 0.05);
                }

                .assignment-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
                    gap: 2rem;
                }

                .assignment-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 28px;
                    padding: 2rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                }

                .assignment-card:hover {
                    border-color: #1a4d3e;
                    transform: translateY(-6px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08);
                }

                .cohort-badge {
                    display: inline-flex;
                    padding: 6px 14px;
                    background: #f0fdf4;
                    color: #166534;
                    border-radius: 10px;
                    font-size: 0.75rem;
                    font-weight: 900;
                    margin-bottom: 1.25rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    width: fit-content;
                }

                .assignment-title {
                    font-size: 1.4rem;
                    font-weight: 900;
                    color: #0f172a;
                    margin: 0 0 1rem 0;
                    line-height: 1.3;
                    letter-spacing: -0.02em;
                }

                .assignment-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }

                .meta-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #64748b;
                    font-size: 0.9rem;
                    font-weight: 600;
                }

                .card-footer {
                    margin-top: auto;
                    padding-top: 1.5rem;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .submission-info {
                    display: flex;
                    flex-direction: column;
                }

                .submission-count {
                    font-size: 1.25rem;
                    font-weight: 900;
                    color: #0f172a;
                }

                .submission-label {
                    font-size: 0.75rem;
                    color: #94a3b8;
                    font-weight: 800;
                    text-transform: uppercase;
                }

                .btn-submissions {
                    background: #f8fafc;
                    width: 48px;
                    height: 48px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #1a4d3e;
                    transition: all 0.2s;
                    border: 1px solid #f1f5f9;
                }

                .btn-submissions:hover {
                    background: #1a4d3e;
                    color: white;
                    transform: scale(1.05);
                }

                .file-indicator {
                    position: absolute;
                    top: 2rem;
                    right: 2rem;
                    color: #cbd5e1;
                }
            `}</style>

            <div className="page-header">
                <div className="header-content">
                    <h1>Assignments</h1>
                    <p>Manage coursework and review student submissions.</p>
                </div>
                <Link to="/instructor/assignments/create" className="btn-create shadow-premium">
                    <Plus size={20} /> New Assignment
                </Link>
            </div>

            <div className="search-bar">
                <div className="search-input-group">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by title or cohort name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn-standard" style={{ padding: '0.85rem 1.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', fontWeight: 800, color: '#475569' }}>
                    <Filter size={18} /> Filters
                </button>
            </div>

            {loading ? (
                <div style={{ padding: '10rem 0', textAlign: 'center' }}>
                    <Loader2 className="animate-spin" size={48} color="#1a4d3e" style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: '2rem', fontWeight: 800, color: '#64748b', fontSize: '1.1rem' }}>Sychronizing assignment data...</p>
                </div>
            ) : error ? (
                <div style={{ padding: '4rem', background: '#fff1f2', borderRadius: '32px', textAlign: 'center', border: '1px solid #ffe4e6' }}>
                    <AlertCircle size={48} color="#e11d48" style={{ margin: '0 auto 1.5rem' }} />
                    <h3 style={{ margin: 0, fontWeight: 900, color: '#0f172a', fontSize: '1.5rem' }}>Connection Interrupted</h3>
                    <p style={{ color: '#64748b', fontWeight: 600, margin: '1rem 0 2.5rem' }}>{error}</p>
                    <button onClick={fetchAssignments} className="btn-create" style={{ margin: '0 auto' }}>Retry Sync</button>
                </div>
            ) : filteredAssignments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '8rem 2rem', background: 'white', border: '2px dashed #e2e8f0', borderRadius: '40px' }}>
                    <ClipboardList size={80} color="#cbd5e1" style={{ marginBottom: '2rem' }} />
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: '0 0 1rem 0' }}>No assignments yet</h2>
                    <p style={{ color: '#64748b', fontWeight: 600, marginBottom: '3rem', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 3rem auto' }}>
                        Start creating your first assignment to share resources and track student progress.
                    </p>
                    <Link to="/instructor/assignments/create" className="btn-create" style={{ display: 'inline-flex', margin: '0 auto' }}>
                        Create First Assignment
                    </Link>
                </div>
            ) : (
                <div className="assignment-grid">
                    {filteredAssignments.map(assignment => (
                        <div key={assignment.id} className="assignment-card shadow-sm">
                            {assignment.assignment_file && (
                                <div className="file-indicator" title="Has resource file">
                                    <FileText size={20} />
                                </div>
                            )}
                            <div className="cohort-badge">{assignment.cohort?.name}</div>
                            <h3 className="assignment-title">{assignment.title}</h3>

                            <div className="assignment-meta">
                                <div className="meta-row">
                                    <Calendar size={18} color="#1a4d3e" />
                                    <span>Due: {new Date(assignment.due_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <div className="meta-row">
                                    <Clock size={18} color="#64748b" />
                                    <span>Time: {new Date(assignment.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>

                            <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 2rem 0', lineBreak: 'anywhere', height: '3.6rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {assignment.description}
                            </p>

                            <div className="card-footer">
                                <div className="submission-info">
                                    <div className="submission-count">{assignment.submissions_count || 0}</div>
                                    <div className="submission-label">Submissions</div>
                                </div>
                                <Link to={`/instructor/assignments/${assignment.id}/submissions`} className="btn-submissions" title="Review Submissions">
                                    <ChevronRight size={24} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
