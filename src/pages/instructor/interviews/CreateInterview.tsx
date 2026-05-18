import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Mic2,
    CheckCircle,
    Loader2,
    FileText,
    Video,
    X,
    Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CreateInterview() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cohorts, setCohorts] = useState<any[]>([]);
    
    const [docFile, setDocFile] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        cohort_id: ''
    });

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const fetchCohorts = async () => {
        try {
            const response = await fetch(`${API_URL}/cohorts`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setCohorts(data);
            }
        } catch (err) {
            console.error("Error fetching cohorts", err);
        }
    };

    useEffect(() => {
        fetchCohorts();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'doc' | 'video') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const maxSize = type === 'doc' ? 50 * 1024 * 1024 : 500 * 1024 * 1024;
            
            if (file.size > maxSize) {
                toast.error(`File size exceeds ${type === 'doc' ? '50MB' : '500MB'} limit.`);
                return;
            }

            if (type === 'doc') setDocFile(file);
            else setVideoFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            if (formData.cohort_id) data.append('cohort_id', formData.cohort_id);
            
            if (docFile) data.append('document', docFile);
            if (videoFile) data.append('video', videoFile);

            const response = await fetch(`${API_URL}/instructor/interviews`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: data
            });

            if (response.ok) {
                toast.success("Interview resource published!");
                navigate('/instructor/interview'); // Changed from /instructor/interviews to match App.tsx
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Upload failed.');
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="create-interview-container">
            <style>{`
                .staff-scope .create-interview-container {
                    max-width: 1000px;
                    margin: 0 auto;
                    font-family: 'Inter', sans-serif;
                    padding: 2rem;
                }
                .staff-scope .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: #64748b;
                    text-decoration: none;
                    font-weight: 800;
                    font-size: 0.9rem;
                    margin-bottom: 2rem;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                }
                .staff-scope .form-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 32px;
                    padding: 3rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .staff-scope .section-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 2.5rem;
                }
                .staff-scope .icon-box { background: #f1f5f9; padding: 12px; border-radius: 12px; color: #1a4d3e; }
                .staff-scope .form-group { display: flex; flex-direction: column; gap: 10px; margin-bottom: 2rem; }
                .form-group label { font-weight: 800; color: #334155; font-size: 0.95rem; }
                .staff-scope .premium-input {
                    width: 100%; padding: 1rem 1.25rem; background: #f8fafc;
                    border: 2px solid #f1f5f9; border-radius: 16px; font-weight: 600;
                    transition: all 0.2s;
                }
                .premium-input:focus { outline: none; border-color: #1a4d3e; background: white; }
                .staff-scope .upload-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
                .staff-scope .upload-box {
                    border: 2px dashed #e2e8f0; border-radius: 20px; padding: 2rem;
                    text-align: center; background: #f8fafc; cursor: pointer; transition: all 0.2s;
                }
                .upload-box:hover { border-color: #1a4d3e; background: #f0f7f4; }
                .staff-scope .selected-file {
                    display: flex; align-items: center; gap: 10px; background: white;
                    padding: 0.75rem 1rem; border-radius: 12px; border: 1px solid #e2e8f0; margin-top: 1rem;
                }
                .staff-scope .btn-submit {
                    background: #1a4d3e; color: white; border: none; padding: 1.25rem;
                    border-radius: 20px; font-weight: 900; font-size: 1.1rem; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; transition: all 0.3s;
                }
                @media (max-width: 768px) { .upload-grid { grid-template-columns: 1fr; } }
            `}</style>

            <button onClick={() => navigate('/instructor/interview')} className="back-link">
                <ArrowLeft size={20} /> Back to Interviews
            </button>

            <div className="form-card">
                <form onSubmit={handleSubmit}>
                    <div className="section-title">
                        <div className="icon-box"><Mic2 size={24} /></div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 900 }}>Create Interview Resource</h2>
                    </div>

                    <div className="form-group">
                        <label>Title</label>
                        <input
                            className="premium-input"
                            placeholder="e.g. Behavioral Interview Prep"
                            required
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <label>Target Cohort (Optional - Leave blank for all students)</label>
                        <select
                            className="premium-input"
                            value={formData.cohort_id}
                            onChange={e => setFormData({...formData, cohort_id: e.target.value})}
                        >
                            <option value="">All Cohorts / General</option>
                            {cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            className="premium-input"
                            style={{ minHeight: '120px' }}
                            placeholder="Add some context or instructions..."
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div className="upload-grid">
                        <div className="form-group">
                            <label>Document (PDF, DOCX)</label>
                            {!docFile ? (
                                <div className="upload-box" onClick={() => document.getElementById('doc-input')?.click()}>
                                    <input type="file" id="doc-input" hidden accept=".pdf,.doc,.docx" onChange={e => handleFileChange(e, 'doc')} />
                                    <FileText size={24} color="#1a4d3e" style={{ marginBottom: '10px' }} />
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Click to upload doc</div>
                                </div>
                            ) : (
                                <div className="selected-file">
                                    <FileText size={18} color="#1a4d3e" />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{docFile.name}</span>
                                    <X size={16} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => setDocFile(null)} />
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Video (MP4, MOV)</label>
                            {!videoFile ? (
                                <div className="upload-box" onClick={() => document.getElementById('video-input')?.click()}>
                                    <input type="file" id="video-input" hidden accept="video/*" onChange={e => handleFileChange(e, 'video')} />
                                    <Video size={24} color="#1a4d3e" style={{ marginBottom: '10px' }} />
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Click to upload video</div>
                                </div>
                            ) : (
                                <div className="selected-file">
                                    <Video size={18} color="#1a4d3e" />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{videoFile.name}</span>
                                    <X size={16} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => setVideoFile(null)} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                        <Info size={18} color="#64748b" />
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Files will be securely stored on Bunny.net. Max limits: 50MB for docs, 500MB for videos.</span>
                    </div>

                    <button className="btn-submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <><Loader2 className="animate-spin" size={20} /> Uploading to Bunny.net...</>
                        ) : (
                            <><CheckCircle size={20} /> Publish Interview Resource</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
