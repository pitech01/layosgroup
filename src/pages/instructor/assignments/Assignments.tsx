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
    FileText,
    Trash2,
    Pencil
} from 'lucide-react';

import { toast } from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.status === 401) {
                logout();
                navigate('/instructor-login');
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
                    navigate('/instructor-login');
                }, 2000);
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/instructor/assignments/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                setAssignments(prev => prev.filter(a => a.id !== id));
                toast.success('Assignment deleted successfully.');
            } else {
                const data = await response.json();
                toast.error(data.message || 'Failed to delete assignment.');
            }
        } catch (err: any) {
            toast.error('A network error occurred.');
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, []);

    const filteredAssignments = assignments.filter(a =>
        a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.cohort?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="assignments-container">
            <style>{`
                .staff-scope .assignments-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    font-family: 'Inter', sans-serif;
                    padding: 2rem;
                }

                .staff-scope .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 3rem;
                }

                .staff-scope .header-content h1 {
                    font-size: 2.5rem;
                    font-weight: 900;
                    color: var(--index-text-heading);
                    margin: 0 0 0.5rem 0;
                    letter-spacing: -0.04em;
                }

                .header-content p {
                    color: var(--index-text-secondary);
                    font-weight: 600;
                    margin: 0;
                    font-size: 1.1rem;
                }

                .staff-scope .btn-create {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: var(--index-primary-color);
                    color: white;
                    padding: 1rem 2rem;
                    border-radius: 16px;
                    text-decoration: none;
                    font-weight: 900;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 10px 15px -3px color-mix(in srgb, var(--index-primary-color) 30%, transparent);
                }

                .btn-create:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 20px 25px -5px color-mix(in srgb, var(--index-primary-color) 40%, transparent);
                }

                .staff-scope .search-bar {
                    background: white;
                    border: 1px solid var(--index-border-color);
                    border-radius: 20px;
                    padding: 1.25rem;
                    margin-bottom: 2.5rem;
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                .staff-scope .search-input-group {
                    flex: 1;
                    position: relative;
                }

                .staff-scope .search-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--index-text-faint);
                }

                .staff-scope .search-input {
                    width: 100%;
                    padding: 0.85rem 1rem 0.85rem 3rem;
                    border: 1px solid var(--index-hover-bg);
                    border-radius: 14px;
                    font-size: 1rem;
                    font-weight: 600;
                    background: var(--index-hover-bg);
                    transition: all 0.2s;
                    color: var(--index-text-heading);
                }

                .staff-scope .search-input:focus {
                    outline: none;
                    border-color: var(--index-primary-color);
                    background: white;
                    box-shadow: 0 0 0 4px color-mix(in srgb, var(--index-primary-color) 5%, transparent);
                }

                .staff-scope .assignment-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
                    gap: 2rem;
                }

                .staff-scope .assignment-card {
                    background: white;
                    border: 1px solid var(--index-border-color);
                    border-radius: 28px;
                    padding: 2rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                }

                .staff-scope .assignment-card:hover {
                    border-color: var(--index-primary-color);
                    transform: translateY(-6px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08);
                }

                .staff-scope .cohort-badge {
                    display: inline-flex;
                    padding: 6px 14px;
                    background: color-mix(in srgb, var(--lgl-success) 15%, transparent);
                    color: var(--lgl-success);
                    border-radius: 10px;
                    font-size: 0.75rem;
                    font-weight: 900;
                    margin-bottom: 1.25rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    width: fit-content;
                }

                .staff-scope .assignment-title {
                    font-size: 1.4rem;
                    font-weight: 900;
                    color: var(--index-text-heading);
                    margin: 0 0 1rem 0;
                    line-height: 1.3;
                    letter-spacing: -0.02em;
                }

                .staff-scope .assignment-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }

                .staff-scope .meta-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: var(--index-text-secondary);
                    font-size: 0.9rem;
                    font-weight: 600;
                }

                .staff-scope .card-footer {
                    margin-top: auto;
                    padding-top: 1.5rem;
                    border-top: 1px solid var(--index-hover-bg);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .staff-scope .submission-info {
                    display: flex;
                    flex-direction: column;
                }

                .staff-scope .submission-count {
                    font-size: 1.25rem;
                    font-weight: 900;
                    color: var(--index-text-heading);
                }

                .staff-scope .submission-label {
                    font-size: 0.75rem;
                    color: var(--index-text-faint);
                    font-weight: 800;
                    text-transform: uppercase;
                }

                .staff-scope .btn-submissions {
                    background: var(--index-hover-bg);
                    width: 48px;
                    height: 48px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--index-primary-color);
                    transition: all 0.2s;
                    border: 1px solid var(--index-hover-bg);
                }

                .staff-scope .btn-submissions:hover {
                    background: var(--index-primary-color);
                    color: white;
                    transform: scale(1.05);
                }

                .staff-scope .file-indicator {
                    position: absolute;
                    top: 2rem;
                    right: 4.5rem;
                    color: var(--index-text-faint);
                }

                .staff-scope .btn-delete {
                    background: var(--index-danger-bg-soft);
                    width: 42px;
                    height: 42px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--lgl-error);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid color-mix(in srgb, var(--lgl-error) 30%, transparent);
                    cursor: pointer;
                    margin-left: 10px;
                    box-shadow: 0 2px 4px color-mix(in srgb, var(--lgl-error) 5%, transparent);
                }

                .staff-scope .btn-delete:hover {
                    background: var(--lgl-error);
                    color: white;
                    transform: scale(1.1);
                    box-shadow: 0 10px 15px -3px color-mix(in srgb, var(--lgl-error) 20%, transparent);
                    border-color: var(--lgl-error);
                }

                .staff-scope .btn-edit {
                    background: var(--index-hover-bg);
                    width: 42px;
                    height: 42px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--index-text-secondary);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid var(--index-border-color);
                    cursor: pointer;
                    margin-left: 10px;
                }

                .staff-scope .btn-edit:hover {
                    background: var(--index-border-color);
                    color: var(--index-text-heading);
                    transform: scale(1.1);
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
                <button className="btn-standard" style={{ padding: '0.85rem 1.5rem', background: 'var(--index-card-bg)', border: '1px solid var(--index-border-color)', borderRadius: '14px', fontWeight: 800, color: 'var(--index-text-secondary)' }}>
                    <Filter size={18} /> Filters
                </button>
            </div>

            {loading ? (
                <div style={{ padding: '10rem 0', textAlign: 'center' }}>
                    <Loader2 className="animate-spin" size={48} color="var(--index-primary-color)" style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: '2rem', fontWeight: 800, color: 'var(--index-text-secondary)', fontSize: '1.1rem' }}>Sychronizing assignment data...</p>
                </div>
            ) : error ? (
                <div style={{ padding: '4rem', background: 'var(--index-danger-bg-soft)', borderRadius: '32px', textAlign: 'center', border: '1px solid var(--index-danger-bg-soft)' }}>
                    <AlertCircle size={48} color="var(--lgl-error)" style={{ margin: '0 auto 1.5rem' }} />
                    <h3 style={{ margin: 0, fontWeight: 900, color: 'var(--index-text-heading)', fontSize: '1.5rem' }}>Connection Interrupted</h3>
                    <p style={{ color: 'var(--index-text-secondary)', fontWeight: 600, margin: '1rem 0 2.5rem' }}>{error}</p>
                    <button onClick={fetchAssignments} className="btn-create" style={{ margin: '0 auto' }}>Retry Sync</button>
                </div>
            ) : filteredAssignments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '8rem 2rem', background: 'var(--index-card-bg)', border: '2px dashed var(--index-border-color)', borderRadius: '40px' }}>
                    <ClipboardList size={80} color="var(--index-text-faint)" style={{ marginBottom: '2rem' }} />
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--index-text-heading)', margin: '0 0 1rem 0' }}>No assignments yet</h2>
                    <p style={{ color: 'var(--index-text-secondary)', fontWeight: 600, marginBottom: '3rem', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 3rem auto' }}>
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
                                    <Calendar size={18} color="var(--index-primary-color)" />
                                    <span>Due: {new Date(assignment.due_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <div className="meta-row">
                                    <Clock size={18} color="var(--index-text-secondary)" />
                                    <span>Time: {new Date(assignment.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>

                            <p style={{ color: 'var(--index-text-secondary)', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 2rem 0', lineBreak: 'anywhere', height: '3.6rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {assignment.description}
                            </p>

                            <div className="card-footer">
                                <div className="submission-info">
                                    <div className="submission-count">{assignment.submissions_count || 0}</div>
                                    <div className="submission-label">Submissions</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Link to={`/instructor/assignments/${assignment.id}/submissions`} className="btn-submissions" title="Review Submissions">
                                        <ChevronRight size={24} />
                                    </Link>
                                    <Link to={`/instructor/assignments/edit/${assignment.id}`} className="btn-edit" title="Edit Assignment">
                                        <Pencil size={20} />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(assignment.id)}
                                        className="btn-delete"
                                        title="Delete Assignment"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
