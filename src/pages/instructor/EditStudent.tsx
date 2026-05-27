import { useState, useEffect } from 'react';
import {
    UserCircle,
    ArrowLeft,
    Mail,
    Layers,
    ShieldCheck,
    CheckCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditStudent() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        cohorts: [] as string[]
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);

    const [cohorts, setCohorts] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                // Fetch Cohorts
                const cohortsRes = await fetch(`${API_URL}/cohorts`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (cohortsRes.ok) {
                    const cohortsData = await cohortsRes.json();
                    setCohorts(cohortsData);
                }

                // Fetch Student Data
                const studentRes = await fetch(`${API_URL}/students/${id}`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (!studentRes.ok) {
                    throw new Error('Failed to load student details.');
                }
                
                const studentData = await studentRes.json();
                setFormData({
                    name: studentData.name || '',
                    email: studentData.email || '',
                    password: '',
                    cohorts: studentData.cohorts?.map((c: any) => c.id) || []
                });
                setPaymentStatus(studentData.payment_status || null);
            } catch (err: any) {
                setError(err.message || 'An error occurred while loading data.');
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [id]);

    const toggleCohort = (cohortId: string) => {
        if (paymentStatus === 'rejected') {
            setError("Cohort assignments are locked because this student's payment has been declined/rejected.");
            return;
        }
        setFormData(prev => {
            const selected = prev.cohorts.includes(cohortId)
                ? prev.cohorts.filter(c => c !== cohortId)
                : [...prev.cohorts, cohortId];
            return { ...prev, cohorts: selected };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/students/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setIsSuccess(true);
                setTimeout(() => {
                    navigate('/instructor/students');
                }, 2000);
            } else {
                throw new Error(data.message || 'Failed to update student profile.');
            }
        } catch (err: any) {
            setError(err.message);
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <Loader2 className="animate-spin" size={48} color="#1a4d3e" style={{ margin: '0 auto' }} />
                <p style={{ marginTop: '1.5rem', fontWeight: 800, color: '#64748b' }}>Loading student data...</p>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="add-student-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <div style={{ textAlign: 'center', animation: 'scaleIn 0.5s ease-out' }}>
                    <div style={{ width: '100px', height: '100px', background: '#f0fdf4', borderRadius: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem', color: '#1a4d3e' }}>
                        <CheckCircle size={50} />
                    </div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 950, color: '#0f172a', margin: '0 0 1rem 0' }}>Profile Updated</h2>
                    <p style={{ color: '#64748b', fontSize: '1.2rem', fontWeight: 600 }}>The student record has been successfully updated.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="add-student-container">
            <style>{`
                .staff-scope .add-student-container {
                    max-width: 900px;
                    margin: 0 auto;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                }

                .staff-scope .back-link {
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

                .staff-scope .form-card-premium {
                    background: white;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 32px;
                    padding: 3rem;
                    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02);
                }

                .staff-scope .section-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 2.5rem;
                }

                .staff-scope .icon-box {
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

                .staff-scope .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .staff-scope .form-group {
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

                .staff-scope .input-wrapper {
                    position: relative;
                }

                .staff-scope .input-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                }

                .staff-scope .premium-input {
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

                .staff-scope .cohort-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                @media (max-width: 768px) {
                    .staff-scope .cohort-grid {
                        grid-template-columns: 1fr;
                    }
                    .staff-scope .form-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .staff-scope .cohort-item {
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

                .staff-scope .cohort-checkbox {
                    width: 20px;
                    height: 20px;
                    accent-color: #1a4d3e;
                }

                .staff-scope .cohort-info {
                    display: flex;
                    flex-direction: column;
                }

                .staff-scope .cohort-name {
                    font-weight: 850;
                    color: #0f172a;
                    font-size: 0.9rem;
                }

                .staff-scope .cohort-course {
                    font-size: 0.75rem;
                    color: #64748b;
                    font-weight: 600;
                }

                .staff-scope .btn-submit {
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

            <button onClick={() => navigate('/instructor/students')} className="back-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <ArrowLeft size={18} /> Back to Students
            </button>

            {error && (
                <div style={{ padding: '1.25rem', background: '#fff1f2', border: '1.5px solid #ffe4e6', borderRadius: '18px', color: '#e11d48', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <div className="form-card-premium">
                <form onSubmit={handleSubmit}>
                    <div className="section-title">
                        <div className="icon-box"><UserCircle size={22} color="#0f172a" /></div>
                        <h2>Edit Student Profile</h2>
                    </div>

                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Full Name</label>
                            <div className="input-wrapper">
                                <UserCircle className="input-icon" size={18} />
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
                            <label>New Password (Optional)</label>
                            <div className="input-wrapper">
                                <ShieldCheck className="input-icon" size={18} />
                                <input
                                    type="password"
                                    className="premium-input"
                                    placeholder="Current password active"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="section-title" style={{ marginTop: '2rem' }}>
                        <div className="icon-box"><Layers size={22} color="#0f172a" /></div>
                        <h2>Assigned Cohorts</h2>
                    </div>

                    {paymentStatus === 'rejected' && (
                        <div style={{
                            padding: '1rem 1.25rem',
                            background: '#fffbeb',
                            border: '1.5px solid #fde68a',
                            borderRadius: '16px',
                            color: '#b45309',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <AlertCircle size={18} />
                            <span>Payment Declined: Cohort assignments are currently locked for this student. You must verify and approve their payment first.</span>
                        </div>
                    )}
 
                    <div className="cohort-grid" style={{ marginBottom: '2.5rem' }}>
                        {cohorts.length > 0 ? (
                            cohorts.map(c => (
                                <div
                                    key={c.id}
                                    className={`cohort-item ${formData.cohorts.includes(c.id) ? 'selected' : ''}`}
                                    onClick={() => toggleCohort(c.id)}
                                    style={paymentStatus === 'rejected' ? { opacity: 0.6, cursor: 'not-allowed', background: '#f8fafc' } : {}}
                                >
                                    <input
                                        type="checkbox"
                                        className="cohort-checkbox"
                                        checked={formData.cohorts.includes(c.id)}
                                        disabled={paymentStatus === 'rejected'}
                                        readOnly
                                    />
                                    <div className="cohort-info">
                                        <span className="cohort-name">{c.name}</span>
                                        <span className="cohort-course">{c.course?.title || 'No Course Attached'}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: '#64748b', fontSize: '0.9rem', gridColumn: '1 / -1' }}>No cohorts available.</p>
                        )}
                    </div>

                    <button type="submit" className="btn-submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Applying Changes...
                            </>
                        ) : 'Save Modifications'}
                    </button>
                </form>
            </div>
        </div>
    );
}
