import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    ClipboardList,
    Clock,
    CheckCircle,
    Loader2,
    BookOpen,
    Upload,
    FileText,
    X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CreateAssignment() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cohorts, setCohorts] = useState<any[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        cohort_id: '',
        due_date: '',
        due_time: '23:59'
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

        if (!formData.cohort_id) {
            toast.error("Please select a cohort.");
            return;
        }

        setIsSubmitting(true);
        try {
            const combinedDateTime = `${formData.due_date}T${formData.due_time}:00`;

            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('cohort_id', formData.cohort_id);
            data.append('due_date', combinedDateTime);
            if (selectedFile) {
                data.append('assignment_file', selectedFile);
            }

            const response = await fetch(`${API_URL}/instructor/assignments`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: data
            });

            if (response.ok) {
                toast.success("Assignment published successfully!");
                navigate('/instructor/assignments');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Operation failed.');
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="create-assignment-container">
            <style>{`
                .staff-scope .create-assignment-container {
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

                .staff-scope .registration-layout {
                    display: grid;
                    grid-template-columns: 1fr 320px;
                    gap: 3rem;
                }

                @media (max-width: 968px) {
                    .staff-scope .registration-layout {
                        grid-template-columns: 1fr;
                    }
                }

                .staff-scope .form-card-premium {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 32px;
                    padding: 3rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }

                .staff-scope .section-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 2.5rem;
                }

                .staff-scope .icon-box {
                    background: #f1f5f9;
                    padding: 12px;
                    border-radius: 12px;
                    color: #1a4d3e;
                }

                .section-title h2 {
                    margin: 0;
                    font-size: 1.75rem;
                    font-weight: 900;
                    color: #0f172a;
                    letter-spacing: -0.04em;
                }

                .staff-scope .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-bottom: 2rem;
                }

                .form-group label {
                    font-weight: 800;
                    color: #334155;
                    font-size: 0.95rem;
                }

                .staff-scope .premium-input {
                    width: 100%;
                    padding: 1rem 1.25rem;
                    background: #f8fafc;
                    border: 2px solid #f1f5f9;
                    border-radius: 16px;
                    font-family: inherit;
                    font-size: 1rem;
                    font-weight: 600;
                    transition: all 0.2s;
                    color: #0f172a;
                }

                .staff-scope .premium-input:focus {
                    outline: none;
                    border-color: #1a4d3e;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(26, 77, 62, 0.05);
                }

                .staff-scope .premium-textarea {
                    min-height: 180px;
                    resize: vertical;
                }

                .staff-scope .file-upload-zone {
                    border: 2px dashed #e2e8f0;
                    border-radius: 20px;
                    padding: 2.5rem;
                    text-align: center;
                    transition: all 0.3s;
                    background: #f8fafc;
                    cursor: pointer;
                    position: relative;
                }

                .staff-scope .file-upload-zone:hover {
                    border-color: #1a4d3e;
                    background: #f0f7f4;
                }

                .staff-scope .file-selected-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: white;
                    padding: 1rem 1.5rem;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    margin-top: 1rem;
                }

                .staff-scope .remove-file {
                    margin-left: auto;
                    color: #ef4444;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 8px;
                    transition: background 0.2s;
                }

                .staff-scope .remove-file:hover {
                    background: #fee2e2;
                }

                .staff-scope .btn-submit {
                    background: #1a4d3e;
                    color: white;
                    border: none;
                    padding: 1.25rem;
                    border-radius: 20px;
                    font-weight: 900;
                    font-size: 1.1rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    transition: all 0.3s;
                    width: 100%;
                    margin-top: 1rem;
                    box-shadow: 0 10px 15px -3px rgba(26, 77, 62, 0.3);
                }

                .staff-scope .btn-submit:hover {
                    box-shadow: 0 20px 25px -5px rgba(26, 77, 62, 0.4);
                    transform: translateY(-2px);
                }

                .staff-scope .btn-submit:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

               .staff-scope  .staff-scope .info-sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .staff-scope .info-card {
                    background: white;
                    border-radius: 24px;
                    padding: 2rem;
                    border: 1px solid #e2e8f0;
                }

                .staff-scope .info-card h4 {
                    margin: 0 0 1rem 0;
                    font-size: 1.1rem;
                    font-weight: 900;
                    color: #0f172a;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .staff-scope .info-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

               .staff-scope  .info-list li {
                    display: flex;
                    gap: 10px;
                    color: #64748b;
                    font-size: 0.9rem;
                    font-weight: 600;
                    line-height: 1.5;
                }
            `}</style>

            <button onClick={() => navigate(-1)} className="back-link">
                <ArrowLeft size={20} /> Back to Assignments
            </button>

            <div className="registration-layout">
                <main>
                    <div className="form-card-premium">
                        <form onSubmit={handleSubmit}>
                            <div className="section-title">
                                <div className="icon-box"><ClipboardList size={24} /></div>
                                <h2>Create Assignment</h2>
                            </div>

                            <div className="form-group">
                                <label>Assignment Title</label>
                                <input
                                    className="premium-input"
                                    placeholder="e.g. Q1 Technical Performance Analysis"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Target Cohort</label>
                                <select
                                    className="premium-input"
                                    required
                                    value={formData.cohort_id}
                                    onChange={(e) => setFormData({ ...formData, cohort_id: e.target.value })}
                                >
                                    <option value="">Select recipient cohort...</option>
                                    {cohorts.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Instructions & Description</label>
                                <textarea
                                    className="premium-input premium-textarea"
                                    placeholder="Paste your assignment requirements and expectations here..."
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label>Due Date</label>
                                    <input
                                        type="date"
                                        className="premium-input"
                                        required
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Due Time</label>
                                    <input
                                        type="time"
                                        className="premium-input"
                                        required
                                        value={formData.due_time}
                                        onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Assignment Resource (Optional)</label>
                                {!selectedFile ? (
                                    <div className="file-upload-zone" onClick={() => document.getElementById('file-input')?.click()}>
                                        <input
                                            type="file"
                                            id="file-input"
                                            hidden
                                            onChange={handleFileChange}
                                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"
                                        />
                                        <Upload size={32} color="#1a4d3e" style={{ marginBottom: '1rem' }} />
                                        <div style={{ fontWeight: 800, color: '#0f172a' }}>Click to upload instruction file</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                                            PDF, DOCX, PPT, Excel or ZIP (Max 50MB)
                                        </div>
                                    </div>
                                ) : (
                                    <div className="file-selected-card">
                                        <FileText size={20} color="#1a4d3e" />
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{selectedFile.name}</div>
                                        <div className="remove-file" onClick={() => setSelectedFile(null)}>
                                            <X size={18} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button className="btn-submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <><Loader2 className="animate-spin" size={20} /> Processing...</>
                                ) : (
                                    <CheckCircle size={20} />
                                )} Publish Assignment
                            </button>
                        </form>
                    </div>
                </main>

                <aside className="info-sidebar">
                    <div className="info-card">
                        <h4><BookOpen size={20} color="#1a4d3e" /> Guidelines</h4>
                        <ul className="info-list">
                            <li>
                                <div style={{ height: '6px', width: '6px', borderRadius: '50%', background: '#1a4d3e', marginTop: '7px', flexShrink: 0 }} />
                                Assignments are visible to students immediately upon publication.
                            </li>
                            <li>
                                <div style={{ height: '6px', width: '6px', borderRadius: '50%', background: '#1a4d3e', marginTop: '7px', flexShrink: 0 }} />
                                You can upload a reference document (PDF, DOCX, ZIP etc.) as part of the instructions.
                            </li>
                        </ul>
                    </div>

                    <div className="info-card">
                        <h4><Clock size={20} color="#0f172a" /> Deadlines</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, margin: 0 }}>
                            Students will see the remaining time relative to the due date provided. Late submissions are marked accordingly in your review panel.
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}
