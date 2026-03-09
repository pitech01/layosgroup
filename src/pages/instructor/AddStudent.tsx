import { useState, useEffect } from 'react';
import {
    UserPlus,
    ArrowLeft,
    Mail,
    Layers,
    ShieldCheck,
    CheckCircle,
    Info,
    AlertCircle
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AddStudent() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const cohortIdFromUrl = searchParams.get('cohortId');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        cohorts: cohortIdFromUrl ? [cohortIdFromUrl] : [] as string[],
        sendWelcomeEmail: true
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [cohorts, setCohorts] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

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
            console.error('Failed to load academic sessions.');
        }
    };

    useEffect(() => {
        fetchCohorts();
    }, []);

    const toggleCohort = (id: string) => {
        setFormData(prev => {
            const selected = prev.cohorts.includes(id)
                ? prev.cohorts.filter(c => c !== id)
                : [...prev.cohorts, id];
            return { ...prev, cohorts: selected };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/students`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    cohorts: formData.cohorts,
                    password: formData.password || undefined // Use default if empty
                })
            });

            const data = await response.json();

            if (response.ok) {
                setIsSuccess(true);
                setTimeout(() => {
                    navigate('/instructor/students');
                }, 2000);
            } else {
                throw new Error(data.message || 'Enrollment rejected by central registry.');
            }
        } catch (err: any) {
            setError(err.message);
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="add-student-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <div style={{ textAlign: 'center', animation: 'scaleIn 0.5s ease-out' }}>
                    <div style={{ width: '100px', height: '100px', background: '#f0fdf4', borderRadius: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem', color: '#1a4d3e' }}>
                        <CheckCircle size={50} />
                    </div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 950, color: '#0f172a', margin: '0 0 1rem 0' }}>Student Enrolled</h2>
                    <p style={{ color: '#64748b', fontSize: '1.2rem', fontWeight: 600 }}>The registration process is complete. Assigning student to the selected cohorts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="add-student-container">
            <style>{`
                .add-student-container {
                    max-width: 1000px;
                    margin: 0 auto;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                }

                .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: #64748b;
                    text-decoration: none;
                    font-weight: 800;
                    font-size: 0.9rem;
                    margin-bottom: 2.5rem;
                    transition: color 0.3s;
                }

                .back-link:hover {
                    color: #0f172a;
                }

                .registration-layout {
                    display: grid;
                    grid-template-columns: 1.2fr 0.8fr;
                    gap: 3rem;
                }

                .form-card-premium {
                    background: white;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 32px;
                    padding: 3rem;
                    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02);
                }

                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 2.5rem;
                }

                .icon-box {
                    background: #f8fafc;
                    padding: 10px;
                    border-radius: 12px;
                    color: #0f172a;
                }

                .section-title h2 {
                    margin: 0;
                    font-size: 1.5rem;
                    font-weight: 950;
                    color: #0f172a;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-group.full-width {
                    grid-column: 1 / -1;
                }

                .form-group label {
                    font-weight: 850;
                    color: #0f172a;
                    font-size: 0.9rem;
                    letter-spacing: -0.01em;
                }

                .input-wrapper {
                    position: relative;
                }

                .input-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                }

                .premium-input {
                    width: 100%;
                    padding: 0.85rem 1.25rem 0.85rem 3rem;
                    background: #fcfdfe;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 16px;
                    font-family: inherit;
                    font-size: 0.95rem;
                    font-weight: 600;
                    transition: all 0.3s;
                    color: #0f172a;
                }

                .premium-input:focus {
                    outline: none;
                    border-color: #1a4d3e;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(26, 77, 62, 0.05);
                }

                .cohort-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 0.75rem;
                }

                .cohort-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 1rem;
                    background: #fcfdfe;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .cohort-item:hover {
                    border-color: #1a4d3e;
                    background: #f8fafc;
                }

                .cohort-item.selected {
                    background: #f0fdf4;
                    border-color: #1a4d3e;
                }

                .cohort-checkbox {
                    width: 20px;
                    height: 20px;
                    accent-color: #1a4d3e;
                }

                .cohort-info {
                    display: flex;
                    flex-direction: column;
                }

                .cohort-name {
                    font-weight: 850;
                    color: #0f172a;
                    font-size: 0.9rem;
                }

                .cohort-course {
                    font-size: 0.75rem;
                    color: #64748b;
                    font-weight: 600;
                }

                .sidebar-info {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .info-card {
                    background: #f8fafc;
                    border-radius: 24px;
                    padding: 1.75rem;
                    border: 1px solid #f1f5f9;
                }

                .info-card h4 {
                    margin: 0 0 1rem 0;
                    font-size: 1rem;
                    font-weight: 900;
                    color: #0f172a;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .info-item {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 1rem;
                }

                .info-item-text {
                    font-size: 0.85rem;
                    color: #64748b;
                    font-weight: 600;
                    line-height: 1.5;
                }

                .btn-submit {
                    background: #1a4d3e;
                    color: white;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 18px;
                    font-weight: 950;
                    font-size: 1rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    transition: all 0.3s;
                    width: 100%;
                    margin-top: 1rem;
                }

                .btn-submit:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px -5px rgba(26, 77, 62, 0.3);
                }

                .btn-submit:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }

                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>

            <button onClick={() => navigate(-1)} className="back-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <ArrowLeft size={18} /> Back to Students
            </button>

            {error && (
                <div style={{ padding: '1.25rem', background: '#fff1f2', border: '1.5px solid #ffe4e6', borderRadius: '18px', color: '#e11d48', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <div className="registration-layout">
                <div className="form-card-premium shadow-premium">
                    <form onSubmit={handleSubmit}>
                        <div className="section-title">
                            <div className="icon-box"><UserPlus size={22} /></div>
                            <h2>Student Information</h2>
                        </div>

                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Full Name</label>
                                <div className="input-wrapper">
                                    <UserPlus className="input-icon" size={18} />
                                    <input
                                        type="text"
                                        className="premium-input"
                                        placeholder="e.g. John Doe"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <div className="input-wrapper">
                                    <Mail className="input-icon" size={18} />
                                    <input
                                        type="email"
                                        className="premium-input"
                                        placeholder="student@example.com"
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Password (Optional)</label>
                                <div className="input-wrapper">
                                    <ShieldCheck className="input-icon" size={18} />
                                    <input
                                        type="password"
                                        className="premium-input"
                                        placeholder="Auto-generated if empty"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="section-title" style={{ marginTop: '1rem' }}>
                            <div className="icon-box"><Layers size={22} /></div>
                            <h2>Assign Cohorts</h2>
                        </div>

                        <div className="cohort-grid" style={{ marginBottom: '2rem' }}>
                            {cohorts.length > 0 ? (
                                cohorts.map(c => (
                                    <div
                                        key={c.id}
                                        className={`cohort-item ${formData.cohorts.includes(c.id) ? 'selected' : ''}`}
                                        onClick={() => toggleCohort(c.id)}
                                    >
                                        <input
                                            type="checkbox"
                                            className="cohort-checkbox"
                                            checked={formData.cohorts.includes(c.id)}
                                            onChange={() => { }} // Handled by div onClick
                                        />
                                        <div className="cohort-info">
                                            <span className="cohort-name">{c.name}</span>
                                            <span className="cohort-course">{c.course?.title || 'No Course Attached'}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No cohorts available.</p>
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '1.25rem', borderRadius: '18px', marginBottom: '2.5rem' }}>
                            <input
                                type="checkbox"
                                id="welcomeEmail"
                                checked={formData.sendWelcomeEmail}
                                onChange={e => setFormData({ ...formData, sendWelcomeEmail: e.target.checked })}
                                style={{ width: '20px', height: '20px', accentColor: '#1a4d3e' }}
                            />
                            <label htmlFor="welcomeEmail" style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>
                                Send welcome email with login credentials.
                            </label>
                        </div>

                        <button type="submit" className="btn-submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Adding Student...' : 'Create Student Profile'}
                        </button>
                    </form>
                </div>

                <div className="sidebar-info">
                    <div className="info-card shadow-premium">
                        <h4><ShieldCheck size={18} color="#1a4d3e" /> Privacy & Security</h4>
                        <div className="info-item">
                            <div className="info-item-text">
                                Student data is handled securely. Access to course materials is granted immediately upon successful enrollment.
                            </div>
                        </div>
                    </div>

                    <div className="info-card shadow-premium">
                        <h4><Info size={18} color="#0f172a" /> Enrollment Info</h4>
                        <div className="info-item">
                            <CheckCircle size={16} color="#1a4d3e" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div className="info-item-text">Students can start learning as soon as they receive their credentials.</div>
                        </div>
                        <div className="info-item" style={{ marginBottom: 0 }}>
                            <CheckCircle size={16} color="#1a4d3e" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div className="info-item-text">A unique Student ID will be assigned to their profile.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
