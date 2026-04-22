import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
    Mic2,
    Plus,
    Search,
    Filter,
    Loader2,
    AlertCircle,
    FileText,
    Trash2,
    Play,
    X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function InstructorInterviews() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [interviews, setInterviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [previewAsset, setPreviewAsset] = useState<{ url: string; type: 'pdf' | 'video' } | null>(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const fetchInterviews = async () => {
        try {
            const response = await fetch(`${API_URL}/instructor/interviews`, {
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
                setInterviews(data);
            } else {
                throw new Error(data.message || 'Failed to fetch interviews.');
            }
        } catch (err: any) {
            console.error("Fetch Interviews Error:", err);
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
        if (!window.confirm('Are you sure you want to delete this interview resource?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/instructor/interviews/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                setInterviews(prev => prev.filter(i => i.id !== id));
                toast.success("Interview resource deleted.");
            } else {
                const data = await response.json();
                toast.error(data.message || 'Failed to delete.');
            }
        } catch (err: any) {
            toast.error('A network error occurred.');
        }
    };

    useEffect(() => {
        fetchInterviews();
    }, []);

    const filteredInterviews = interviews.filter(i =>
        i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.cohort?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="interviews-container">
            <style>{`
                .interviews-container {
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

                .interview-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
                    gap: 2rem;
                }

                .interview-card {
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

                .interview-card:hover {
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
                }

                .asset-pills {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 1.5rem;
                }

                .asset-pill {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border-radius: 100px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .pill-doc { background: #e0f2fe; color: #0369a1; }
                .pill-video { background: #fee2e2; color: #991b1b; }

                .pill-doc:hover { background: #bae6fd; }
                .pill-video:hover { background: #fecaca; }

                .card-footer {
                    margin-top: auto;
                    padding-top: 1.5rem;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .preview-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.85);
                    backdrop-filter: blur(10px);
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                }

                .preview-modal-content {
                    background: white;
                    width: 100%;
                    max-width: 1000px;
                    height: 80vh;
                    border-radius: 32px;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .preview-header {
                    padding: 1.5rem 2rem;
                    border-bottom: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
            `}</style>

            <div className="page-header">
                <div className="header-content">
                    <h1>Interview Resources</h1>
                    <p>Upload documents and videos for student preparation.</p>
                </div>
                <Link to="/instructor/interviews/create" className="btn-create shadow-premium">
                    <Plus size={20} /> Add New
                </Link>
            </div>

            <div className="search-bar">
                <div className="search-input-group">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by title or cohort..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button style={{ padding: '0.85rem 1.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', fontWeight: 800, color: '#475569' }}>
                    <Filter size={18} /> Filters
                </button>
            </div>

            {loading ? (
                <div style={{ padding: '10rem 0', textAlign: 'center' }}>
                    <Loader2 className="animate-spin" size={48} color="#1a4d3e" style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: '2rem', fontWeight: 800, color: '#64748b' }}>Fetching interview data...</p>
                </div>
            ) : error ? (
                <div style={{ padding: '4rem', background: '#fff1f2', borderRadius: '32px', textAlign: 'center', border: '1px solid #ffe4e6' }}>
                    <AlertCircle size={48} color="#e11d48" style={{ margin: '0 auto 1.5rem' }} />
                    <h3 style={{ margin: 0, fontWeight: 900, color: '#0f172a' }}>Error</h3>
                    <p style={{ color: '#64748b', fontWeight: 600 }}>{error}</p>
                    <button onClick={fetchInterviews} className="btn-create" style={{ margin: '2rem auto' }}>Retry</button>
                </div>
            ) : filteredInterviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '8rem 2rem', background: 'white', border: '2px dashed #e2e8f0', borderRadius: '40px' }}>
                    <Mic2 size={80} color="#cbd5e1" style={{ marginBottom: '2rem' }} />
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>No interview resources</h2>
                    <p style={{ color: '#64748b', fontWeight: 600, marginBottom: '3rem' }}>
                        Create your first interview resource to share materials with your students.
                    </p>
                    <Link to="/instructor/interviews/create" className="btn-create" style={{ display: 'inline-flex', margin: '0 auto' }}>
                        Create First Resource
                    </Link>
                </div>
            ) : (
                <div className="interview-grid">
                    {filteredInterviews.map(i => (
                        <div key={i.id} className="interview-card shadow-sm">
                            <div className="cohort-badge">{i.cohort?.name || 'General'}</div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '0 0 1rem 0' }}>{i.title}</h3>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem' }}>{i.description}</p>
                            
                            <div className="asset-pills">
                                {i.document_url && (
                                    <div className="asset-pill pill-doc" onClick={() => setPreviewAsset({ url: i.document_url, type: 'pdf' })}>
                                        <FileText size={14} /> Document
                                    </div>
                                )}
                                {i.video_url && (
                                    <div className="asset-pill pill-video" onClick={() => setPreviewAsset({ url: i.video_url, type: 'video' })}>
                                        <Play size={14} /> Video
                                    </div>
                                )}
                            </div>

                            <div className="card-footer">
                                <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800 }}>
                                    ADDED {new Date(i.created_at).toLocaleDateString()}
                                </div>
                                <button onClick={() => handleDelete(i.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {previewAsset && (
                <div className="preview-modal-overlay" onClick={() => setPreviewAsset(null)}>
                    <div className="preview-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="preview-header">
                            <h3 style={{ margin: 0, fontWeight: 900 }}>Preview Resource</h3>
                            <button onClick={() => setPreviewAsset(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ flex: 1, background: '#f8fafc' }}>
                            {previewAsset.type === 'pdf' ? (
                                <iframe src={`${previewAsset.url}#toolbar=0`} style={{ width: '100%', height: '100%', border: 'none' }} title="Doc Preview" />
                            ) : (
                                <video src={previewAsset.url} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
