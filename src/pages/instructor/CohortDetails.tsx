import { useState, useEffect } from 'react';
import {
    Settings,
    PlusCircle,
    ArrowLeft,
    Loader2,
    AlertCircle,
    Layers,
    ShieldBan,
    User,
    CheckCircle2,
    X
} from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';

interface Student {
    id: string;
    name: string;
    email: string;
    pivot: {
        status: string;
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
    }, [id]);

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


    if (loading) {
        return (
            <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                <Loader2 className="animate-spin" size={48} color="#1a4d3e" />
                <p style={{ fontWeight: 800, color: '#64748b', fontSize: '1.1rem' }}>Loading Cohort...</p>
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
              .staff-scope   .cohort-header-premium {
                    background: white;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 32px;
                    padding: 2.5rem;
                    margin-bottom: 2.5rem;
                    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02);
                }

              .staff-scope   .badge-premium {
                    padding: 6px 14px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 950;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
             .staff-scope    .status-active { background: #f0fdf4; color: #1a4d3e; border: 1px solid #1a4d3e20; }

               .staff-scope  .stat-box-strip {
                    display: flex;
                    gap: 1.5rem;
                    margin-top: 2rem;
                }

              .staff-scope   .stat-box-mini {
                    padding: 1rem 1.5rem;
                    background: #fcfdfe;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 18px;
                    min-width: 160px;
                }

              .staff-scope   .management-tabs-premium {
                    display: flex;
                    gap: 3rem;
                    border-bottom: 2px solid #f1f5f9;
                    margin-bottom: 3rem;
                }

              .staff-scope   .tab-premium {
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

              .staff-scope   .tab-premium.active { color: #1a4d3e; }
              .staff-scope   .tab-premium.active::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    width: 100%;
                    height: 3.5px;
                    background: #1a4d3e;
                    border-radius: 4px;
                }

              .staff-scope   .empty-payload-card {
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

              .staff-scope   .empty-icon-shell {
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

             .staff-scope    .btn-primary-forest {
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

              .staff-scope   .btn-secondary-outline {
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

             .staff-scope    .btn-secondary-outline:hover {
                    background: #fcfdfe;
                    border-color: #cbd5e1;
                }

             .staff-scope    .student-table {
                    width: 100%;
                    border-collapse: collapse;
                }

              .staff-scope   .student-table th {
                    text-align: left;
                    padding: 1rem 1.5rem;
                    color: #64748b;
                    font-size: 0.8rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    border-bottom: 1.5px solid #f1f5f9;
                }

             .staff-scope    .student-table td {
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid #f8fafc;
                }

             .staff-scope    .module-card-premium {
                    background: white;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 24px;
                    margin-bottom: 2rem;
                    overflow: hidden;
                }

             .staff-scope    .module-header-premium {
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

                @media (max-width: 1024px) {
                .staff-scope     .cohort-header-premium {
                        padding: 1.5rem;
                    }
                 .staff-scope    .cohort-header-premium h1 {
                        font-size: 2rem !important;
                    }
                }

                @media (max-width: 768px) {
                  .staff-scope   .cohort-header-premium > div {
                        flex-direction: column;
                        gap: 2rem;
                    }
                  .staff-scope   .cohort-header-premium h1 {
                        font-size: 1.75rem !important;
                    }
                  .staff-scope   .stat-box-strip {
                        flex-wrap: wrap;
                        gap: 1rem;
                    }
                   .staff-scope  .stat-box-mini {
                        flex: 1;
                        min-width: 140px;
                        padding: 0.75rem 1rem;
                    }
                  .staff-scope   .management-tabs-premium {
                        gap: 1.5rem;
                        overflow-x: auto;
                        scrollbar-width: none;
                        -ms-overflow-style: none;
                        margin-bottom: 2rem;
                    }
                  .staff-scope   .management-tabs-premium::-webkit-scrollbar {
                        display: none;
                    }
                 .staff-scope    .tab-premium {
                        white-space: nowrap;
                        font-size: 0.9rem;
                    }
                  .staff-scope   .module-header-premium {
                        padding: 1rem 1.5rem;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }
                  .staff-scope   .module-header-premium h4 {
                        font-size: 1rem;
                    }

                 .staff-scope    .student-table thead {
                        display: none;
                    }
                 .staff-scope .student-table, .student-table tbody, .student-table tr, .student-table td {
                        display: block;
                        width: 100%;
                    }
                 .staff-scope    .student-table tr {
                        padding: 1rem;
                        border-bottom: 2px solid #f8fafc;
                    }
                 .staff-scope    .student-table td {
                        padding: 0.5rem 0;
                        border: none;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                  .staff-scope   .student-table td::before {
                        content: attr(data-label);
                        font-weight: 800;
                        color: #64748b;
                        font-size: 0.75rem;
                        text-transform: uppercase;
                    }
                 .staff-scope    .student-table td:last-child {
                        border-top: 1px solid #f8fafc;
                        margin-top: 0.5rem;
                        padding-top: 1rem;
                        justify-content: center;
                    }
                 .staff-scope    .student-table td:first-child {
                        justify-content: flex-start;
                    }
                .staff-scope     .student-table td:first-child::before {
                        display: none;
                    }
                }

                @media (max-width: 480px) {
                  .staff-scope   .cohort-header-premium h1 {
                        font-size: 1.5rem !important;
                    }
                 .staff-scope    .btn-secondary-outline, .btn-primary-forest {
                        width: 100%;
                        justify-content: center;
                    }
                 .staff-scope    .cohort-header-premium > div > div:last-child {
                        width: 100%;
                    }
                }
            `}</style>

            <Link to="/instructor/cohorts" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontWeight: 800, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                <ArrowLeft size={16} /> Back to My Cohorts
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
                            <span className="badge-premium status-active">Active Session</span>
                            <span style={{ fontSize: '0.9rem', color: '#1a4d3e', fontWeight: 950, background: '#f0fdf4', padding: '4px 12px', borderRadius: '8px' }}>{cohort.id}</span>
                        </div>
                        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.04em' }}>{cohort.name}</h1>
                        <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '1.1rem', fontWeight: 600 }}>
                            {new Date(cohort.start_date).toLocaleDateString()} — {new Date(cohort.end_date).toLocaleDateString()}
                        </p>

                        <div className="stat-box-strip">
                            <div className="stat-box-mini">
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 900, textTransform: 'uppercase' }}>Total Students</div>
                                <div style={{ fontWeight: 950, fontSize: '1.25rem', color: '#0f172a' }}>{cohort.students?.length || 0}</div>
                            </div>

                            <div className="stat-box-mini">
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 900, textTransform: 'uppercase' }}>Status</div>
                                <div style={{ fontWeight: 950, fontSize: '1.1rem', color: '#1a4d3e' }}>MANAGED</div>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn-secondary-outline" onClick={() => navigate(`/instructor/cohorts/${cohort.id}/edit`)}>
                            <Settings size={18} /> Edit Settings
                        </button>
                    </div>
                </div>
            </div>

            <div className="management-tabs-premium">
                <div
                    className={`tab-premium ${activeTab === 'curriculum' ? 'active' : ''}`}
                    onClick={() => setActiveTab('curriculum')}
                >
                    <Layers size={18} /> Curriculum
                </div>
                <div
                    className={`tab-premium ${activeTab === 'students' ? 'active' : ''}`}
                    onClick={() => setActiveTab('students')}
                >
                    <User size={18} /> Enrolled Students
                </div>
            </div>

            {activeTab === 'curriculum' ? (
                cohort.course === null ? (
                    <div className="empty-payload-card">
                        <div className="empty-icon-shell shadow-premium">
                            <Layers size={48} />
                        </div>
                        <h2>No Course Linked</h2>
                        <p>Link a course to this cohort to provide curriculum and lessons to your students.</p>

                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <button className="btn-primary-forest" onClick={() => navigate(`/instructor/cohorts/${cohort.id}/attach-course`)}>
                                <PlusCircle size={20} /> Attach Course
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="attached-payload-view animate-fade-in-up">
                        <div style={{ marginBottom: '3rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 950, color: '#0f172a', margin: 0 }}>{cohort.course!.title}</h3>
                                    <p style={{ color: '#64748b', fontWeight: 600 }}>Active curriculum for this cohort session.</p>
                                </div>
                                <button className="btn-secondary-outline" onClick={() => navigate(`/instructor/courses/${cohort.course!.id}/edit`)}>View Master Course</button>
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
                                    <th>Student Details</th>
                                    <th>Status</th>
                                    <th>Joining Date</th>
                                    <th style={{ textAlign: 'right' }}>Management</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cohort.students?.length > 0 ? cohort.students.map((student: Student) => (
                                    <tr key={student.id}>
                                        <td data-label="Student Details">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#1a4d3e' }}>
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{student.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{student.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td data-label="Status">
                                            <span className="badge-premium" style={{
                                                background: student.pivot.status === 'dropped' ? '#fff1f2' : '#f8fafc',
                                                color: student.pivot.status === 'dropped' ? '#e11d48' : '#64748b'
                                            }}>
                                                {student.pivot.status}
                                            </span>
                                        </td>
                                        <td data-label="Joining Date" style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
                                            {new Date(student.pivot.created_at).toLocaleDateString()}
                                        </td>
                                        <td data-label="Management" style={{ textAlign: 'right' }}>
                                            {student.pivot.status !== 'dropped' ? (
                                                <button
                                                    onClick={() => handleBlockAccess(student.id)}
                                                    className="btn-secondary-outline"
                                                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderColor: '#fee2e2', color: '#ef4444', background: '#fef2f2' }}
                                                    disabled={isUpdating}
                                                >
                                                    <ShieldBan size={14} /> Block Student
                                                </button>
                                            ) : (
                                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ef4444' }}>ACCESS REVOKED</span>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                                            No students have been enrolled in this cohort yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
