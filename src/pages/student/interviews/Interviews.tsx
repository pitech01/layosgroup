import { useState, useEffect } from 'react';
import {
    Mic2,
    Search,
    Loader2,
    AlertCircle,
    FileText,
    Play,
    X,
    LayoutDashboard,
    Eye
} from 'lucide-react';

export default function StudentInterviews() {
    const [interviews, setInterviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [previewAsset, setPreviewAsset] = useState<{ url: string; type: 'pdf' | 'video'; title: string } | null>(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const fetchInterviews = async () => {
        try {
            const response = await fetch(`${API_URL}/student/interviews`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setInterviews(data);
            } else {
                throw new Error(data.message || 'Failed to fetch interview materials.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInterviews();
    }, []);

    const filteredInterviews = interviews.filter(i =>
        i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="student-interviews-container">
            <style>{`
                .student-interviews-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    font-family: 'Inter', sans-serif;
                    padding: 2rem;
                }

                .page-header {
                    margin-bottom: 3rem;
                }

                .page-header h1 {
                    font-size: 2.5rem;
                    font-weight: 900;
                    color: #0f172a;
                    margin: 0 0 0.5rem 0;
                    letter-spacing: -0.04em;
                }

                .page-header p {
                    color: #64748b;
                    font-weight: 600;
                    margin: 0;
                    font-size: 1.1rem;
                }

                .search-bar {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 20px;
                    padding: 1rem 1.25rem;
                    margin-bottom: 3rem;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                .search-input {
                    flex: 1;
                    border: none;
                    background: none;
                    font-size: 1rem;
                    font-weight: 600;
                    color: #0f172a;
                    outline: none;
                }

                .interview-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
                    gap: 2.5rem;
                }

                .interview-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 32px;
                    padding: 2.5rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                    border-bottom-width: 4px;
                }

                .interview-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 30px 40px -15px rgba(0, 0, 0, 0.1);
                    border-color: #1a4d3e;
                }

                .resource-list {
                    margin-top: 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .resource-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 1rem;
                    background: #f8fafc;
                    border-radius: 16px;
                    border: 1px solid #f1f5f9;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .resource-item:hover {
                    background: #1a4d3e;
                    color: white;
                    transform: translateX(5px);
                }

                .resource-item:hover .icon-box {
                    background: rgba(255,255,255,0.1);
                    color: white;
                }

                .icon-box {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #1a4d3e;
                    transition: all 0.2s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                /* Modal */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.95);
                    backdrop-filter: blur(12px);
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                }

                .modal-content {
                    background: white;
                    width: 100%;
                    max-width: 1100px;
                    height: 85vh;
                    border-radius: 40px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 50px 100px -20px rgba(0,0,0,0.5);
                }

                .modal-header {
                    padding: 1.5rem 2.5rem;
                    border-bottom: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
            `}</style>

            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#1a4d3e', marginBottom: '1rem' }}>
                    <Mic2 size={24} />
                    <span style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem' }}>Career Preparation</span>
                </div>
                <h1>Interview Resources</h1>
                <p>Curated materials to help you excel in your technical and behavioral interviews.</p>
            </div>

            <div className="search-bar">
                <Search size={22} color="#94a3b8" />
                <input
                    className="search-input"
                    placeholder="Filter resources by topic..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div style={{ padding: '10rem 0', textAlign: 'center' }}>
                    <Loader2 className="animate-spin" size={48} color="#1a4d3e" style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: '2rem', fontWeight: 800, color: '#64748b' }}>Syncing learning materials...</p>
                </div>
            ) : error ? (
                <div style={{ padding: '4rem', background: '#fff1f2', borderRadius: '32px', textAlign: 'center' }}>
                    <AlertCircle size={48} color="#e11d48" style={{ margin: '0 auto 1.5rem' }} />
                    <h3 style={{ margin: 0, fontWeight: 900, color: '#0f172a' }}>Offline</h3>
                    <p style={{ color: '#64748b', fontWeight: 600 }}>{error}</p>
                    <button onClick={fetchInterviews} className="btn-primary-forest" style={{ marginTop: '1.5rem' }}>Retry</button>
                </div>
            ) : filteredInterviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '8rem 2rem', background: 'white', border: '2px dashed #e2e8f0', borderRadius: '40px' }}>
                    <LayoutDashboard size={80} color="#cbd5e1" style={{ marginBottom: '2rem' }} />
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>No resources available yet</h2>
                    <p style={{ color: '#64748b', fontWeight: 600, maxWidth: '500px', margin: '0 auto' }}>
                        Your instructors haven't uploaded any interview preparation materials for your cohort yet.
                    </p>
                </div>
            ) : (
                <div className="interview-grid">
                    {filteredInterviews.map(i => (
                        <div key={i.id} className="interview-card shadow-sm">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div style={{ background: '#f0fdf4', color: '#166534', padding: '6px 14px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>
                                    {i.cohort?.name || 'General Resource'}
                                </div>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 950, color: '#0f172a', margin: '0 0 1rem 0', lineHeight: 1.2 }}>{i.title}</h3>
                            <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.6, flex: 1 }}>{i.description}</p>
                            
                            <div className="resource-list">
                                {i.document_url && (
                                    <div className="resource-item" onClick={() => setPreviewAsset({ url: i.document_url, type: 'pdf', title: i.title })}>
                                        <div className="icon-box"><FileText size={20} /></div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Instructional Guide</div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>PDF Document</div>
                                        </div>
                                        <Eye size={18} />
                                    </div>
                                )}
                                {i.video_url && (
                                    <div className="resource-item" onClick={() => setPreviewAsset({ url: i.video_url, type: 'video', title: i.title })}>
                                        <div className="icon-box"><Play size={20} /></div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Video Presentation</div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>MP4 Stream</div>
                                        </div>
                                        <Play size={18} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {previewAsset ? (
                <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'white', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ 
                        padding: '1rem 2rem', 
                        borderBottom: '1px solid #e2e8f0', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        background: '#f8fafc' 
                    }}>
                        <div>
                            <h3 style={{ margin: 0, fontWeight: 950, fontSize: '1.25rem', color: '#0f172a' }}>{previewAsset.title}</h3>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Secure Learning Asset</p>
                        </div>
                        <button 
                            onClick={() => setPreviewAsset(null)} 
                            style={{ 
                                padding: '0.6rem 1.5rem', 
                                borderRadius: '12px', 
                                background: '#1a4d3e', 
                                color: 'white', 
                                border: 'none', 
                                cursor: 'pointer', 
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <X size={20} />
                            EXIT PREVIEW
                        </button>
                    </div>
                    <div style={{ flex: 1, background: '#020617' }} onContextMenu={e => e.preventDefault()}>
                        {previewAsset.type === 'pdf' ? (
                            <iframe 
                                src={`${previewAsset.url}#toolbar=0`} 
                                style={{ width: '100%', height: '100%', border: 'none' }} 
                                title="Material View" 
                            />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <video 
                                    src={previewAsset.url} 
                                    controls 
                                    controlsList="nodownload" 
                                    autoPlay 
                                    style={{ maxWidth: '100%', maxHeight: '100%', background: 'black' }} 
                                    onContextMenu={e => e.preventDefault()} 
                                />
                            </div>
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
