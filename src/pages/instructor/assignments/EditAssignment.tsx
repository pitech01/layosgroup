import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Clock,
    CheckCircle,
    Loader2,
    BookOpen,
    Upload,
    FileText,
    X,
    Info,
    RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function EditAssignment() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [cohorts, setCohorts] = useState<any[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [existingAssignment, setExistingAssignment] = useState<any>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        cohort_id: '',
        due_date: '',
        due_time: '23:59'
    });

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const fetchData = async () => {
        try {
            // Fetch cohorts
            const cohortsResponse = await fetch(`${API_URL}/cohorts`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const cohortsData = await cohortsResponse.json();
            if (cohortsResponse.ok) {
                setCohorts(cohortsData);
            }

            // Fetch assignment details
            const assignmentResponse = await fetch(`${API_URL}/instructor/assignments/${id}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const assignmentData = await assignmentResponse.json();
            if (assignmentResponse.ok) {
                setExistingAssignment(assignmentData);

                // Parse due date and time from the stored datetime (e.g. YYYY-MM-DD HH:MM:SS or ISO format)
                let dateStr = '';
                let timeStr = '23:59';
                if (assignmentData.due_date) {
                    const parts = assignmentData.due_date.split(/[ T]/);
                    if (parts.length >= 1) {
                        dateStr = parts[0];
                    }
                    if (parts.length >= 2) {
                        timeStr = parts[1].substring(0, 5);
                    }
                }

                setFormData({
                    title: assignmentData.title || '',
                    description: assignmentData.description || '',
                    cohort_id: assignmentData.cohort_id || '',
                    due_date: dateStr,
                    due_time: timeStr
                });
            } else {
                toast.error("Failed to load assignment details.");
                navigate('/instructor/assignments');
            }
        } catch (err) {
            console.error("Error loading edit assignment page data:", err);
            toast.error("An error occurred while loading data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

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

            // We use POST even for updates because Laravel has issues with PUT and multipart/form-data
            const response = await fetch(`${API_URL}/instructor/assignments/${id}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: data
            });

            if (response.ok) {
                toast.success("Assignment updated successfully!");
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

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
                <Loader2 className="animate-spin" size={48} color="var(--index-primary-color)" />
            </div>
        );
    }

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
                    color: var(--index-text-secondary);
                    text-decoration: none;
                    font-weight: 800;
                    font-size: 0.9rem;
                    margin-bottom: 2rem;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                }

                .back-link:hover {
                    color: var(--index-text-heading);
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
                    border: 1px solid var(--index-border-color);
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
                    background: var(--index-hover-bg);
                    padding: 12px;
                    border-radius: 12px;
                    color: var(--index-primary-color);
                }

                .section-title h2 {
                    margin: 0;
                    font-size: 1.75rem;
                    font-weight: 900;
                    color: var(--index-text-heading);
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
                    color: var(--index-text-secondary);
                    font-size: 0.95rem;
                }

                .staff-scope .premium-input {
                    width: 100%;
                    padding: 1rem 1.25rem;
                    background: var(--index-hover-bg);
                    border: 2px solid var(--index-hover-bg);
                    border-radius: 16px;
                    font-family: inherit;
                    font-size: 1rem;
                    font-weight: 600;
                    transition: all 0.2s;
                    color: var(--index-text-heading);
                }

                .staff-scope .premium-input:focus {
                    outline: none;
                    border-color: var(--index-primary-color);
                    background: white;
                    box-shadow: 0 0 0 4px color-mix(in srgb, var(--index-primary-color) 5%, transparent);
                }

                .staff-scope .premium-textarea {
                    min-height: 180px;
                    resize: vertical;
                }

                .staff-scope .file-upload-zone {
                    border: 2px dashed var(--index-border-color);
                    border-radius: 20px;
                    padding: 2.5rem;
                    text-align: center;
                    transition: all 0.3s;
                    background: var(--index-hover-bg);
                    cursor: pointer;
                    position: relative;
                }

                .staff-scope .file-upload-zone:hover {
                    border-color: var(--index-primary-color);
                    background: var(--index-accent-soft-bg);
                }

                .staff-scope .file-selected-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: white;
                    padding: 1rem 1.5rem;
                    border-radius: 16px;
                    border: 1px solid var(--index-border-color);
                    margin-top: 1rem;
                }

                .staff-scope .existing-file-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: var(--index-hover-bg);
                    padding: 1rem 1.5rem;
                    border-radius: 16px;
                    border: 1px solid var(--index-border-color);
                    margin-top: 0.5rem;
                    margin-bottom: 1rem;
                }

                .staff-scope .remove-file {
                    margin-left: auto;
                    color: var(--lgl-error);
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 8px;
                    transition: background 0.2s;
                }

                .staff-scope .remove-file:hover {
                    background: var(--index-danger-bg-soft);
                }

                .staff-scope .btn-submit {
                    background: var(--index-primary-color);
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
                    box-shadow: 0 10px 15px -3px color-mix(in srgb, var(--index-primary-color) 30%, transparent);
                }

                .staff-scope .btn-submit:hover {
                    box-shadow: 0 20px 25px -5px color-mix(in srgb, var(--index-primary-color) 40%, transparent);
                    transform: translateY(-2px);
                }

                .staff-scope .btn-submit:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .staff-scope .info-sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .staff-scope .info-card {
                    background: white;
                    border-radius: 24px;
                    padding: 2rem;
                    border: 1px solid var(--index-border-color);
                }

                .staff-scope .info-card h4 {
                    margin: 0 0 1rem 0;
                    font-size: 1.1rem;
                    font-weight: 900;
                    color: var(--index-text-heading);
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

                .staff-scope .info-list li {
                    display: flex;
                    gap: 10px;
                    color: var(--index-text-secondary);
                    font-size: 0.9rem;
                    font-weight: 600;
                    line-height: 1.5;
                }
            `}</style>

            <button onClick={() => navigate('/instructor/assignments')} className="back-link">
                <ArrowLeft size={20} /> Back to Assignments
            </button>

            <div className="registration-layout">
                <main>
                    <div className="form-card-premium">
                        <form onSubmit={handleSubmit}>
                            <div className="section-title">
                                <div className="icon-box"><RefreshCw size={24} /></div>
                                <h2>Edit Assignment</h2>
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
                                <label>Assignment Resource (Leave empty to keep existing)</label>
                                {existingAssignment?.assignment_file && !selectedFile && (
                                    <div className="existing-file-card">
                                        <FileText size={20} color="var(--index-text-secondary)" />
                                        <div style={{ fontSize: '0.85rem', color: 'var(--index-text-secondary)', fontWeight: 600 }}>
                                            Currently: <span style={{ fontWeight: 800 }}>{existingAssignment.assignment_file.split('/').pop()}</span>
                                        </div>
                                    </div>
                                )}
                                {!selectedFile ? (
                                    <div className="file-upload-zone" onClick={() => document.getElementById('file-input')?.click()}>
                                        <input
                                            type="file"
                                            id="file-input"
                                            hidden
                                            onChange={handleFileChange}
                                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"
                                        />
                                        <Upload size={32} color="var(--index-primary-color)" style={{ marginBottom: '1rem' }} />
                                        <div style={{ fontWeight: 800, color: 'var(--index-text-heading)' }}>Click to upload new instruction file</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--index-text-secondary)', marginTop: '0.5rem' }}>
                                            PDF, DOCX, PPT, Excel or ZIP (Max 50MB)
                                        </div>
                                    </div>
                                ) : (
                                    <div className="file-selected-card">
                                        <FileText size={20} color="var(--index-primary-color)" />
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedFile.name} (Ready to upload)</div>
                                        <div className="remove-file" onClick={() => setSelectedFile(null)}>
                                            <X size={18} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--index-hover-bg)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--index-border-color)' }}>
                                <Info size={18} color="var(--index-text-secondary)" />
                                <span style={{ fontSize: '0.8rem', color: 'var(--index-text-secondary)', fontWeight: 600 }}>Updates will be stored on Bunny.net. Old files will be automatically replaced.</span>
                            </div>

                            <button className="btn-submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <><Loader2 className="animate-spin" size={20} /> Processing...</>
                                ) : (
                                    <CheckCircle size={20} />
                                )} Save Changes
                            </button>
                        </form>
                    </div>
                </main>

                <aside className="info-sidebar">
                    <div className="info-card">
                        <h4><BookOpen size={20} color="var(--index-primary-color)" /> Guidelines</h4>
                        <ul className="info-list">
                            <li>
                                <div style={{ height: '6px', width: '6px', borderRadius: '50%', background: 'var(--index-primary-color)', marginTop: '7px', flexShrink: 0 }} />
                                Edited changes are visible to students immediately.
                            </li>
                            <li>
                                <div style={{ height: '6px', width: '6px', borderRadius: '50%', background: 'var(--index-primary-color)', marginTop: '7px', flexShrink: 0 }} />
                                Re-uploading a file replaces the old attachment on Bunny.net storage automatically.
                            </li>
                        </ul>
                    </div>

                    <div className="info-card">
                        <h4><Clock size={20} color="var(--index-text-heading)" /> Deadlines</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--index-text-secondary)', fontWeight: 600, margin: 0 }}>
                            Updating the due date will change the remaining time displayed to students. Any past submissions will remain but status might be re-evaluated against the new due date.
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}
