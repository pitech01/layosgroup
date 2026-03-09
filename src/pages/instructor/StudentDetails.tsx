import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    ShieldCheck,
    BookOpen,
    Clock,
    TrendingUp,
    Award,
    Activity,
    MapPin,
    Loader2,
    AlertCircle,
    User
} from 'lucide-react';

export default function StudentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const fetchStudentData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/students/${id}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setStudent(data);
            } else {
                throw new Error(data.message || 'Failed to retrieve student profile.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentData();
    }, [id]);

    return (
        <div className="student-details-container">
            <style>{`
                .student-details-container {
                    max-width: 1200px;
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

                .profile-header-premium {
                    background: white;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 32px;
                    padding: 3rem;
                    display: flex;
                    gap: 3rem;
                    align-items: center;
                    margin-bottom: 2.5rem;
                    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02);
                }

                .avatar-massive {
                    width: 140px;
                    height: 140px;
                    background: linear-gradient(135deg, #1a4d3e, #2d5a4c);
                    border-radius: 45px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 3.5rem;
                    font-weight: 950;
                    box-shadow: 0 20px 40px -10px rgba(26, 77, 62, 0.3);
                }

                .profile-info h1 {
                    margin: 0 0 0.5rem 0;
                    font-size: 2.5rem;
                    font-weight: 950;
                    color: #0f172a;
                    letter-spacing: -0.04em;
                }

                .status-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 16px;
                    background: #f0fdf4;
                    color: #1a4d3e;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: 950;
                    margin-bottom: 1.5rem;
                }

                .contact-grid-mini {
                    display: flex;
                    gap: 2rem;
                    flex-wrap: wrap;
                }

                .contact-item-mini {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #64748b;
                    font-size: 0.95rem;
                    font-weight: 600;
                }

                .details-layout {
                    display: grid;
                    grid-template-columns: 1fr 0.4fr;
                    gap: 2.5rem;
                }

                .card-premium-records {
                    background: white;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 28px;
                    padding: 2.5rem;
                    margin-bottom: 2.5rem;
                }

                .card-title-records {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 2rem;
                }

                .card-title-records h3 {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 950;
                    color: #0f172a;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .enrollment-row {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    padding: 1.5rem;
                    background: #fcfdfe;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 20px;
                    margin-bottom: 1rem;
                    transition: all 0.3s;
                }

                .enrollment-row:hover {
                    border-color: #1a4d3e;
                    background: white;
                    transform: translateY(-2px);
                }

                .progress-ring-mini {
                    width: 50px;
                    height: 50px;
                    border-radius: 14px;
                    background: #f0fdf4;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #1a4d3e;
                    font-weight: 950;
                    font-size: 0.9rem;
                }

                .activity-item {
                    display: flex;
                    gap: 16px;
                    padding-bottom: 1.5rem;
                    border-left: 2px solid #f1f5f9;
                    margin-left: 10px;
                    padding-left: 20px;
                    position: relative;
                }

                .activity-item::before {
                    content: '';
                    position: absolute;
                    left: -7px;
                    top: 0;
                    width: 12px;
                    height: 12px;
                    background: white;
                    border: 2px solid #1a4d3e;
                    border-radius: 50%;
                }

                .activity-content div {
                    font-weight: 850;
                    color: #0f172a;
                    font-size: 0.95rem;
                }

                .activity-content span {
                    color: #94a3b8;
                    font-size: 0.8rem;
                    font-weight: 700;
                }

                .btn-secondary-outline {
                    background: transparent;
                    color: #475569;
                    border: 1.5px solid #f1f5f9;
                    padding: 0.6rem 1.2rem;
                    border-radius: 12px;
                    font-weight: 800;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s;
                    font-size: 0.85rem;
                }

                .btn-secondary-outline:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                }
            `}</style>

            <button onClick={() => navigate(-1)} className="back-link">
                <ArrowLeft size={18} /> Back to Students
            </button>

            {loading ? (
                <div style={{ padding: '8rem 0', textAlign: 'center' }}>
                    <Loader2 className="animate-spin" size={48} color="#1a4d3e" style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: '1.5rem', fontWeight: 800, color: '#64748b' }}>Loading Profile...</p>
                </div>
            ) : error || !student ? (
                <div style={{ padding: '4rem', background: '#fff1f2', borderRadius: '32px', border: '1.5px solid #ffe4e6', textAlign: 'center' }}>
                    <AlertCircle size={40} color="#e11d48" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ margin: 0, color: '#0f172a', fontWeight: 950 }}>Student Not Found</h3>
                    <p style={{ color: '#64748b', fontWeight: 600, margin: '8px 0 2rem' }}>{error || 'Unable to load student details.'}</p>
                    <button onClick={fetchStudentData} className="back-link" style={{ margin: '0 auto' }}>Try Again</button>
                </div>
            ) : (
                <>
                    <div className="profile-header-premium shadow-premium">
                        <div className="avatar-massive">
                            {student.name.charAt(0)}
                        </div>
                        <div className="profile-info">
                            <div className="status-pill">
                                <ShieldCheck size={16} /> Verified Student
                            </div>
                            <h1>{student.name}</h1>
                            <div className="contact-grid-mini">
                                <div className="contact-item-mini"><Mail size={18} /> {student.email}</div>
                                {student.phone && <div className="contact-item-mini"><Phone size={18} /> {student.phone}</div>}
                                <div className="contact-item-mini"><Calendar size={18} /> Member since {new Date(student.created_at).toLocaleDateString()}</div>
                                <div className="contact-item-mini"><MapPin size={18} /> Student Access</div>
                            </div>
                        </div>
                    </div>

                    <div className="details-layout">
                        <div className="main-records">
                            <div className="card-premium-records shadow-premium">
                                <div className="card-title-records">
                                    <h3><BookOpen size={20} color="#1a4d3e" /> Academic Enrollments</h3>
                                </div>

                                {student.cohorts && student.cohorts.length > 0 ? student.cohorts.map((cohort: any) => (
                                    <div key={cohort.id} className="enrollment-row">
                                        <div className="progress-ring-mini">{Math.round(cohort.pivot?.progress || 0)}%</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 950, color: '#0f172a', fontSize: '1.1rem' }}>{cohort.name}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
                                                {cohort.course?.title || 'General Curriculum'} • Joined {new Date(cohort.pivot?.created_at).toLocaleDateString()}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 850, color: '#10b981', background: '#f0fdf4', padding: '2px 8px', borderRadius: '4px' }}>
                                                    {cohort.pivot?.status?.toUpperCase() || 'ENROLLED'}
                                                </div>
                                            </div>
                                        </div>
                                        <button className="btn-secondary-outline" onClick={() => navigate(`/instructor/cohorts/${cohort.id}`)}>Manage Access</button>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                                        <BookOpen size={32} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                                        <p style={{ color: '#64748b', fontWeight: 600 }}>No course enrollments found for this student.</p>
                                    </div>
                                )}
                            </div>

                            <div className="card-premium-records shadow-premium">
                                <div className="card-title-records">
                                    <h3><Award size={20} color="#1a4d3e" /> Learning Metrics</h3>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                                    <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '20px', textAlign: 'center' }}>
                                        <TrendingUp size={24} color="#1a4d3e" style={{ marginBottom: '0.5rem' }} />
                                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>Avg. Completion</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 950, color: '#0f172a' }}>
                                            {student.cohorts?.length > 0 ?
                                                Math.round(student.cohorts.reduce((acc: number, c: any) => acc + (c.pivot?.progress || 0), 0) / student.cohorts.length)
                                                : 0}%
                                        </div>
                                    </div>
                                    <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '20px', textAlign: 'center' }}>
                                        <Clock size={24} color="#1a4d3e" style={{ marginBottom: '0.5rem' }} />
                                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>Total Cohorts</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 950, color: '#0f172a' }}>{student.cohorts?.length || 0}</div>
                                    </div>
                                    <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '20px', textAlign: 'center' }}>
                                        <Activity size={24} color="#1a4d3e" style={{ marginBottom: '0.5rem' }} />
                                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>Engagement</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 950, color: '#0f172a' }}>{student.cohorts?.length > 0 ? 'Normal' : 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sidebar-records">
                            <div className="card-premium-records shadow-premium" style={{ padding: '2rem' }}>
                                <div className="card-title-records">
                                    <h3><User size={20} color="#1a4d3e" /> Profile Note</h3>
                                </div>
                                <p style={{ margin: 0, color: '#64748b', fontWeight: 600, lineHeight: 1.6 }}>
                                    Standard student account with access to enrolled cohorts and assignments.
                                </p>
                            </div>

                            <div className="card-premium-records shadow-premium" style={{ padding: '2rem' }}>
                                <div className="card-title-records">
                                    <h3><Activity size={20} color="#1a4d3e" /> History Log</h3>
                                </div>
                                <div style={{ marginTop: '1.5rem' }}>
                                    <div className="activity-item">
                                        <div className="activity-content">
                                            <div>Account Activated</div>
                                            <span>{new Date(student.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    {student.cohorts?.slice(0, 3).map((c: any) => (
                                        <div key={c.id} className="activity-item">
                                            <div className="activity-content">
                                                <div>Joined {c.name}</div>
                                                <span>{new Date(c.pivot?.created_at).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
