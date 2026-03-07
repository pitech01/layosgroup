import React, { useState, useEffect } from 'react';
import {
    Settings,
    PlusCircle,
    Copy,
    ChevronRight,
    ArrowLeft,
    Loader2,
    AlertCircle,
    Layers,
    ShieldBan
} from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    CheckCircle2,
    X
} from 'lucide-react';

interface Student {
    id: string;
    name: string;
    email: string;
    pivot: {
        status: string;
        payment_status: string;
        receipt_path: string | null;
        created_at: string;
    };
}

interface Course {
    id: string;
    title: string;
    modules: Array<{
        id: string;
        title: string;
        lessons: Array<{
            id: string;
            title: string;
        }>;
    }>;
}

interface Cohort {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    pricing: string | number;
    payment_model: string;
    seat_limit: number;
    visibility: string;
    course: Course | null;
    students: Student[];
}

export default function CohortDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [cohort, setCohort] = useState<Cohort | null>(null);
    const [activeTab, setActiveTab] = useState<'curriculum' | 'students'>('curriculum');
    const [verifyingStudent, setVerifyingStudent] = useState<Student | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const fetchCohort = async () => {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        try {
            const response = await fetch(`${API_URL}/cohorts/${id}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setCohort(data);
            } else {
                throw new Error(data.message || 'Failed to fetch cohort data.');
            }
        } catch (err) {
            const errorInstance = err as Error;
            console.error("Fetch Cohort Error:", errorInstance);
            setError(errorInstance.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCohort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);



    const handleUpdatePayment = async (studentId: string, status: string) => {
        setIsUpdating(true);
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        try {
            const response = await fetch(`${API_URL}/cohorts/${id}/students/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ payment_status: status })
            });

            if (response.ok) {
                setNotification({ type: 'success', message: 'Student activation successful!' });
                setVerifyingStudent(null);
                fetchCohort();
                setTimeout(() => setNotification(null), 4000);
            } else {
                setNotification({ type: 'error', message: 'Failed to update student status.' });
            }
        } catch (err) {
            console.error("Update Payment Error:", err);
            alert('An error occurred.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleBlockAccess = async (studentId: string) => {
        if (!confirm('Are you sure you want to block this student? They will lose access to the cohort immediately.')) return;
        setIsUpdating(true);
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        try {
            const response = await fetch(`${API_URL}/cohorts/${id}/students/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status: 'dropped' })
            });

            if (response.ok) {
                setNotification({ type: 'success', message: 'Student access has been blocked.' });
                fetchCohort();
                setTimeout(() => setNotification(null), 4000);
            } else {
                setNotification({ type: 'error', message: 'Failed to block student access.' });
            }
        } catch (err) {
            console.error("Block Student Error:", err);
            alert('An error occurred while blocking.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAttachCourse = () => {
        navigate(`/instructor/cohorts/${id}/attach-course`);
    };

    if (loading) {
        return (
            <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                <Loader2 className="animate-spin" size={48} color="#1a4d3e" />
                <p style={{ fontWeight: 800, color: '#64748b', fontSize: '1.1rem' }}>Loading Cohort Management...</p>
            </div>
        );
    }

    if (error || !cohort) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <div style={{ maxWidth: '500px', margin: '0 auto', background: '#fff1f2', border: '1px solid #ffe4e6', borderRadius: '24px', padding: '3rem' }}>
                    <AlertCircle size={48} color="#e11d48" style={{ marginBottom: '1.5rem' }} />
                    <h2 style={{ color: '#0f172a', fontWeight: 900, marginBottom: '1rem' }}>Cohort Not Found</h2>
                    <p style={{ color: '#64748b', fontWeight: 600, marginBottom: '2rem' }}>{error || 'The requested cohort record could not be found.'}</p>
                    <button onClick={() => navigate('/instructor/cohorts')} className="btn-primary-forest" style={{ margin: '0 auto' }}>
                        <ArrowLeft size={18} /> Back to Cohorts
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="cohort-details-page">
            <style>{`
                .cohort-header-premium {
                    background: white;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 32px;
                    padding: 2.5rem;
                    margin-bottom: 2.5rem;
                    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02);
                }

                .badge-premium {
                    padding: 6px 14px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 950;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .status-active { background: #f0fdf4; color: #1a4d3e; border: 1px solid #1a4d3e20; }

                .stat-box-strip {
                    display: flex;
                    gap: 1.5rem;
                    margin-top: 2rem;
                }

                .stat-box-mini {
                    padding: 1rem 1.5rem;
                    background: #fcfdfe;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 18px;
                    min-width: 140px;
                }

                .management-tabs-premium {
                    display: flex;
                    gap: 3rem;
                    border-bottom: 2px solid #f1f5f9;
                    margin-bottom: 3rem;
                }

                .tab-premium {
                    padding: 1.25rem 0;
                    font-weight: 850;
                    color: #94a3b8;
                    cursor: pointer;
                    position: relative;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .tab-premium.active { color: #1a4d3e; }
                .tab-premium.active::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    width: 100%;
                    height: 3.5px;
                    background: #1a4d3e;
                    border-radius: 4px;
                }

                /* Empty State Styles */
                .empty-payload-card {
                    background: white;
                    border: 2px dashed #f1f5f9;
                    border-radius: 32px;
                    padding: 5rem 3rem;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    animation: fadeInUp 0.6s ease-out;
                }

                .empty-icon-shell {
                    width: 90px;
                    height: 90px;
                    background: #f8fafc;
                    border-radius: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 2rem;
                    color: #cbd5e1;
                }

                .empty-payload-card h2 {
                    font-size: 2rem;
                    font-weight: 950;
                    color: #0f172a;
                    margin: 0 0 0.5rem 0;
                }

                .empty-payload-card p {
                    color: #64748b;
                    font-size: 1.1rem;
                    font-weight: 600;
                    max-width: 480px;
                    margin: 0 0 3rem 0;
                }

                .option-cluster {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                    width: 100%;
                    max-width: 700px;
                }

                .option-card {
                    background: #fcfdfe;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 24px;
                    padding: 2rem;
                    text-align: left;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                .option-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05);
                    border-color: #1a4d3e40;
                }

                .option-card h4 {
                    margin: 1.5rem 0 0.5rem 0;
                    font-size: 1.1rem;
                    font-weight: 900;
                    color: #0f172a;
                }

                .option-description {
                    font-size: 0.9rem;
                    color: #64748b;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                }

                .btn-primary-forest {
                    background: #1a4d3e;
                    color: white;
                    border: none;
                    padding: 0.85rem 1.75rem;
                    border-radius: 16px;
                    font-weight: 950;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.3s;
                }

                .btn-secondary-outline {
                    background: transparent;
                    color: #475569;
                    border: 1.5px solid #f1f5f9;
                    padding: 0.85rem 1.75rem;
                    border-radius: 16px;
                    font-weight: 950;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.3s;
                }

                .btn-secondary-outline:hover {
                    background: #fcfdfe;
                    border-color: #cbd5e1;
                }

                .btn-secondary-outline:hover {
                    background: #fcfdfe;
                    border-color: #cbd5e1;
                }

                /* Students List Styles */
                .student-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .student-table th {
                    text-align: left;
                    padding: 1rem 1.5rem;
                    color: #64748b;
                    font-size: 0.8rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    border-bottom: 1.5px solid #f1f5f9;
                }

                .student-table td {
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid #f8fafc;
                }

                .student-avatar {
                    width: 40px;
                    height: 40px;
                    background: #f1f5f9;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 900;
                    color: #1a4d3e;
                    font-size: 0.9rem;
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.3s ease;
                }

                .modal-content {
                    background: white;
                    width: 100%;
                    max-width: 500px;
                    border-radius: 28px;
                    padding: 2.5rem;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    position: relative;
                    animation: scaleIn 0.3s ease;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-group label {
                    display: block;
                    font-weight: 800;
                    color: #0f172a;
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                }

                .form-input {
                    width: 100%;
                    padding: 0.85rem 1.25rem;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 14px;
                    font-family: inherit;
                    font-size: 1rem;
                    transition: all 0.3s;
                    color: #0f172a;
                    font-weight: 600;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #1a4d3e;
                    box-shadow: 0 0 0 4px rgba(26, 77, 62, 0.1);
                }

                .form-input::placeholder {
                    color: #94a3b8;
                }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

                /* Curriculum Attached Styles */
                .module-card-premium {
                    background: white;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 24px;
                    margin-bottom: 2rem;
                    overflow: hidden;
                }

                .module-header-premium {
                    padding: 1.5rem 2.5rem;
                    background: #f8fafc;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <Link to="/instructor/cohorts" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontWeight: 800, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                <ArrowLeft size={16} /> Back to Cohorts
            </Link>

            {notification && (
                <div className="animate-slide-in" style={{
                    position: 'fixed',
                    top: '2rem',
                    right: '2rem',
                    zIndex: 1000,
                    padding: '1rem 1.5rem',
                    background: notification.type === 'success' ? '#f0fdf4' : '#fff1f2',
                    border: `1px solid ${notification.type === 'success' ? '#bbf7d0' : '#ffe4e6'}`,
                    color: notification.type === 'success' ? '#166534' : '#e11d48',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                    fontWeight: 700
                }}>
                    {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span>{notification.message}</span>
                    <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                        <X size={16} color={notification.type === 'success' ? '#166534' : '#e11d48'} />
                    </button>
                </div>
            )}

            <div className="cohort-header-premium shadow-premium">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1rem' }}>
                            <span className="badge-premium status-active">Active Cohort Session</span>
                            <span style={{ fontSize: '0.9rem', color: '#1a4d3e', fontWeight: 950, background: '#f0fdf4', padding: '4px 12px', borderRadius: '8px' }}>{cohort.id}</span>
                        </div>
                        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.04em' }}>{cohort.name}</h1>
                        <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '1.1rem', fontWeight: 600 }}>Cohort Timeline: {new Date(cohort.start_date).toLocaleDateString()} — {new Date(cohort.end_date).toLocaleDateString()}</p>

                        <div className="stat-box-strip">
                            <div className="stat-box-mini">
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 900, textTransform: 'uppercase' }}>Active Students</div>
                                <div style={{ fontWeight: 950, fontSize: '1.25rem', color: '#0f172a' }}>{cohort.students?.length || 0}</div>
                            </div>
                            <div className="stat-box-mini">
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 900, textTransform: 'uppercase' }}>Course Assignment</div>
                                <div style={{ fontWeight: 950, fontSize: '1.1rem', color: cohort.course ? '#1a4d3e' : '#ef4444' }}>{cohort.course ? 'Course Linked' : 'Unassigned'}</div>
                            </div>
                            <div className="stat-box-mini">
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 900, textTransform: 'uppercase' }}>Course Price</div>
                                <div style={{ fontWeight: 950, fontSize: '1.25rem', color: '#0f172a' }}>${parseFloat(cohort.pricing.toString()).toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn-secondary-outline" onClick={() => navigate(`/instructor/cohorts/${cohort.id}/edit`)}>
                            <Settings size={18} /> Settings
                        </button>
                    </div>
                </div>
            </div>



            <div className="management-tabs-premium">
                <div
                    className={`tab-premium ${activeTab === 'curriculum' ? 'active' : ''}`}
                    onClick={() => setActiveTab('curriculum')}
                >
                    <Layers size={18} /> Curriculum Design
                </div>
                <div
                    className={`tab-premium ${activeTab === 'students' ? 'active' : ''}`}
                    onClick={() => setActiveTab('students')}
                >
                    <PlusCircle size={18} /> Student Management
                    {cohort.students?.filter((s) => s.pivot.payment_status === 'pending_verification').length > 0 && (
                        <span style={{ background: '#ef4444', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px' }}>
                            {cohort.students.filter((s) => s.pivot.payment_status === 'pending_verification').length}
                        </span>
                    )}
                </div>
            </div>

            {activeTab === 'curriculum' ? (
                cohort.course === null ? (
                    <div className="empty-payload-card">
                        <div className="empty-icon-shell shadow-premium">
                            <Layers size={48} />
                        </div>
                        <h2>Course Assignment Required</h2>
                        <p>This cohort session has been created, but does not yet have an active course curriculum assigned.</p>

                        <div className="option-cluster">
                            <div className="option-card shadow-premium" onClick={() => navigate(`/instructor/cohorts/${cohort.id}/attach-course`)}>
                                <div>
                                    <PlusCircle size={32} color="#1a4d3e" />
                                    <h4>Create New Course</h4>
                                    <p className="option-description">Build a unique curriculum specifically for this cohort session.</p>
                                </div>
                                <ChevronRight size={20} color="#cbd5e1" style={{ alignSelf: 'flex-end' }} />
                            </div>

                            <div className="option-card shadow-premium" onClick={handleAttachCourse}>
                                <div>
                                    <Copy size={32} color="#1a4d3e" />
                                    <h4>Use Course Template</h4>
                                    <p className="option-description">Select an existing course from your library to link to this cohort.</p>
                                </div>
                                <ChevronRight size={20} color="#cbd5e1" style={{ alignSelf: 'flex-end' }} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="attached-payload-view animate-fade-in-up">
                        {/* Course syllabus/modules list */}
                        <div style={{ marginBottom: '3rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 950, color: '#0f172a', margin: 0 }}>{cohort.course!.title}</h3>
                                    <p style={{ color: '#64748b', fontWeight: 600 }}>Curriculum structure being delivered to this cohort.</p>
                                </div>
                                <button className="btn-secondary-outline" onClick={() => navigate(`/instructor/courses/${cohort.course!.id}/edit`)}>Edit Master Course</button>
                            </div>

                            {cohort.course.modules?.map((module, idx) => (
                                <div key={module.id} className="module-card-premium shadow-sm">
                                    <div className="module-header-premium">
                                        <h4 style={{ margin: 0, fontWeight: 850 }}>Module {idx + 1}: {module.title}</h4>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>{module.lessons?.length || 0} Lessons</span>
                                    </div>
                                    <div style={{ padding: '1rem 2.5rem' }}>
                                        {module.lessons?.map((lesson) => (
                                            <div key={lesson.id} style={{ padding: '1rem 0', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #f8fafc' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#cbd5e1' }}></div>
                                                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>{lesson.title}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            ) : (
                <div className="students-management-view animate-fade-in-up">
                    <div className="section-card shadow-sm" style={{ padding: 0, overflow: 'hidden', background: 'white', borderRadius: '24px', border: '1.5px solid #f1f5f9' }}>
                        <table className="student-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Status</th>
                                    <th>Payment Status</th>
                                    <th>Enrollment Date</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cohort.students?.length > 0 ? cohort.students.map((student: Student) => (
                                    <tr key={student.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div className="student-avatar">{student.name.charAt(0)}</div>
                                                <div>
                                                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{student.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{student.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge-premium" style={{ background: '#f8fafc', color: '#64748b' }}>{student.pivot.status}</span>
                                        </td>
                                        <td>
                                            <span className={`status-badge-premium status-${student.pivot.payment_status}`} style={{ display: 'inline-block' }}>
                                                {student.pivot.payment_status === 'full' ? 'Paid Full' :
                                                    student.pivot.payment_status === 'partial' ? 'Partial' :
                                                        student.pivot.payment_status === 'pending_verification' ? 'Pending' : 'Unpaid'}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
                                            {new Date(student.pivot.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                            {student.pivot.status !== 'dropped' ? (
                                                <button
                                                    onClick={() => handleBlockAccess(student.id)}
                                                    className="btn-secondary-outline"
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderColor: '#fee2e2', color: '#ef4444', background: '#fef2f2' }}
                                                    title="Revoke Access"
                                                    disabled={isUpdating}
                                                >
                                                    <ShieldBan size={14} /> Block
                                                </button>
                                            ) : (
                                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ef4444', padding: '0.4rem 0.8rem', background: '#fee2e2', borderRadius: '8px' }}>BLOCKED</span>
                                            )}

                                            {student.pivot.payment_status === 'pending_verification' ? (
                                                <button
                                                    onClick={() => setVerifyingStudent(student)}
                                                    className="btn-primary-forest"
                                                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', marginLeft: 'auto' }}
                                                >
                                                    Verify Payment
                                                </button>
                                            ) : (
                                                <button className="btn-secondary-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', marginLeft: 'auto' }}>
                                                    View Profile
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                                            No students enrolled in this cohort yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Verification Modal */}
            {verifyingStudent && (
                <div className="modal-overlay" onClick={() => setVerifyingStudent(null)}>
                    <div className="modal-content" onClick={(e: React.MouseEvent) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 950, color: '#0f172a', margin: '0 0 0.5rem 0' }}>Verify Student Payment</h3>
                            <p style={{ color: '#64748b', fontWeight: 600 }}>Uploaded receipt from <strong>{verifyingStudent.name}</strong></p>
                        </div>

                        <div style={{ background: '#f8fafc', borderRadius: '20px', padding: '1rem', marginBottom: '2rem', textAlign: 'center' }}>
                            <img
                                src={verifyingStudent.pivot.receipt_path?.startsWith('http') ? verifyingStudent.pivot.receipt_path : `http://localhost:8000/storage/${verifyingStudent.pivot.receipt_path}`}
                                alt="Payment Receipt"
                                style={{ maxWidth: '100%', borderRadius: '12px', border: '1px solid #e2e8f0', maxHeight: '400px', objectFit: 'contain' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <button
                                disabled={isUpdating}
                                onClick={() => handleUpdatePayment(verifyingStudent.id, 'full')}
                                className="btn-primary-forest"
                                style={{ width: '100%', justifyContent: 'center', gridColumn: cohort.payment_model !== 'split-50' ? '1 / span 2' : 'auto' }}
                            >
                                {isUpdating ? 'Updating...' : 'Approve Full Access'}
                            </button>
                            {cohort.payment_model === 'split-50' && (
                                <button
                                    disabled={isUpdating}
                                    onClick={() => handleUpdatePayment(verifyingStudent.id, 'partial')}
                                    className="btn-secondary-outline"
                                    style={{ width: '100%', justifyContent: 'center', color: '#1e40af', borderColor: '#bfdbfe' }}
                                >
                                    Approve Partial (50%)
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

