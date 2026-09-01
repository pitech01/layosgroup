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
    X,
    GraduationCap,
    Plus,
    Trash2,
    Check,
    Award
} from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';

interface ExamQuestion {
    id: string;
    question: string;
    options: string[];
    correct_answer: number;
}

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
    exam_enabled?: boolean;
    exam_opens_at?: string | null;
    exam_closes_at?: string | null;
    final_exam_data?: { pass_mark?: number; questions?: ExamQuestion[] } | null;
}

export default function CohortDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [cohort, setCohort] = useState<Cohort | null>(null);
    const [activeTab, setActiveTab] = useState<'curriculum' | 'students' | 'exam'>('curriculum');
    const [isUpdating, setIsUpdating] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Final Exam tab state
    const [examEnabled, setExamEnabled] = useState(false);
    const [examOpensAt, setExamOpensAt] = useState('');
    const [examClosesAt, setExamClosesAt] = useState('');
    const [examPassMark, setExamPassMark] = useState(80);
    const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);
    const [savingExam, setSavingExam] = useState(false);

    const toDatetimeLocal = (value?: string | null) => {
        if (!value) return '';
        const d = new Date(value);
        if (isNaN(d.getTime())) return '';
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

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

    useEffect(() => {
        if (cohort) {
            setExamEnabled(!!cohort.exam_enabled);
            setExamOpensAt(toDatetimeLocal(cohort.exam_opens_at));
            setExamClosesAt(toDatetimeLocal(cohort.exam_closes_at));
            setExamPassMark(cohort.final_exam_data?.pass_mark || 80);
            setExamQuestions(cohort.final_exam_data?.questions || []);
        }
    }, [cohort]);

    const handleSaveExam = async () => {
        setSavingExam(true);
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        try {
            const response = await fetch(`${API_URL}/cohorts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    exam_enabled: examEnabled,
                    exam_opens_at: examOpensAt || null,
                    exam_closes_at: examClosesAt || null,
                    final_exam_data: { pass_mark: examPassMark, questions: examQuestions }
                })
            });
            const data = await response.json();
            if (response.ok) {
                setCohort(data);
                setNotification({ type: 'success', message: 'Final exam settings saved.' });
                setTimeout(() => setNotification(null), 4000);
            } else {
                throw new Error(data.message || 'Failed to save exam settings.');
            }
        } catch (err) {
            setNotification({ type: 'error', message: (err as Error).message });
        } finally {
            setSavingExam(false);
        }
    };

    const addQuestion = () => {
        setExamQuestions([...examQuestions, { id: 'q' + Date.now(), question: '', options: ['', ''], correct_answer: 0 }]);
    };

    const updateQuestion = (idx: number, updates: Partial<ExamQuestion>) => {
        const updated = [...examQuestions];
        updated[idx] = { ...updated[idx], ...updates };
        setExamQuestions(updated);
    };

    const removeQuestion = (idx: number) => {
        setExamQuestions(examQuestions.filter((_, i) => i !== idx));
    };

    const addOption = (qIdx: number) => {
        const updated = [...examQuestions];
        updated[qIdx] = { ...updated[qIdx], options: [...updated[qIdx].options, ''] };
        setExamQuestions(updated);
    };

    const updateOption = (qIdx: number, oIdx: number, value: string) => {
        const updated = [...examQuestions];
        const options = [...updated[qIdx].options];
        options[oIdx] = value;
        updated[qIdx] = { ...updated[qIdx], options };
        setExamQuestions(updated);
    };

    const removeOption = (qIdx: number, oIdx: number) => {
        const updated = [...examQuestions];
        const options = updated[qIdx].options.filter((_, i) => i !== oIdx);
        let correct = updated[qIdx].correct_answer;
        if (correct >= options.length) correct = 0;
        updated[qIdx] = { ...updated[qIdx], options, correct_answer: correct };
        setExamQuestions(updated);
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


    if (loading) {
        return (
            <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                <Loader2 className="animate-spin" size={48} color="var(--index-primary-color)" />
                <p style={{ fontWeight: 800, color: 'var(--index-text-secondary)', fontSize: '1.1rem' }}>Loading Cohort...</p>
            </div>
        );
    }

    if (error || !cohort) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <div style={{ maxWidth: '500px', margin: '0 auto', background: 'var(--index-danger-bg-soft)', border: '1px solid var(--index-danger-bg-soft)', borderRadius: '24px', padding: '3rem' }}>
                    <AlertCircle size={48} color="var(--lgl-error)" style={{ marginBottom: '1.5rem' }} />
                    <h2 style={{ color: 'var(--index-text-heading)', fontWeight: 900, marginBottom: '1rem' }}>Cohort Not Found</h2>
                    <p style={{ color: 'var(--index-text-secondary)', fontWeight: 600, marginBottom: '2rem' }}>{error || 'The requested cohort record could not be found.'}</p>
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
                    border: 1.5px solid var(--index-hover-bg);
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
             .staff-scope    .status-active { background: var(--index-accent-soft-bg); color: var(--index-primary-color); border: 1px solid var(--index-primary-color)20; }

               .staff-scope  .stat-box-strip {
                    display: flex;
                    gap: 1.5rem;
                    margin-top: 2rem;
                }

              .staff-scope   .stat-box-mini {
                    padding: 1rem 1.5rem;
                    background: var(--index-card-bg);
                    border: 1.5px solid var(--index-hover-bg);
                    border-radius: 18px;
                    min-width: 160px;
                }

              .staff-scope   .management-tabs-premium {
                    display: flex;
                    gap: 3rem;
                    border-bottom: 2px solid var(--index-hover-bg);
                    margin-bottom: 3rem;
                }

              .staff-scope   .tab-premium {
                    padding: 1.25rem 0;
                    font-weight: 850;
                    color: var(--index-text-faint);
                    cursor: pointer;
                    position: relative;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

              .staff-scope   .tab-premium.active { color: var(--index-primary-color); }
              .staff-scope   .tab-premium.active::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    width: 100%;
                    height: 3.5px;
                    background: var(--index-primary-color);
                    border-radius: 4px;
                }

              .staff-scope   .empty-payload-card {
                    background: white;
                    border: 2px dashed var(--index-hover-bg);
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
                    background: var(--index-hover-bg);
                    border-radius: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 2rem;
                    color: var(--index-border-subtle);
                }

             .staff-scope    .btn-primary-forest {
                    background: var(--index-primary-color);
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
                    color: var(--index-text-secondary);
                    border: 1.5px solid var(--index-hover-bg);
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
                    background: var(--index-card-bg);
                    border-color: var(--index-border-subtle);
                }

             .staff-scope    .student-table {
                    width: 100%;
                    border-collapse: collapse;
                }

              .staff-scope   .student-table th {
                    text-align: left;
                    padding: 1rem 1.5rem;
                    color: var(--index-text-secondary);
                    font-size: 0.8rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    border-bottom: 1.5px solid var(--index-hover-bg);
                }

             .staff-scope    .student-table td {
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid var(--index-hover-bg);
                }

             .staff-scope    .module-card-premium {
                    background: white;
                    border: 1.5px solid var(--index-hover-bg);
                    border-radius: 24px;
                    margin-bottom: 2rem;
                    overflow: hidden;
                }

             .staff-scope    .module-header-premium {
                    padding: 1.5rem 2.5rem;
                    background: var(--index-hover-bg);
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
                        border-bottom: 2px solid var(--index-hover-bg);
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
                        color: var(--index-text-secondary);
                        font-size: 0.75rem;
                        text-transform: uppercase;
                    }
                 .staff-scope    .student-table td:last-child {
                        border-top: 1px solid var(--index-hover-bg);
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

            <Link to="/instructor/cohorts" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--index-text-secondary)', textDecoration: 'none', fontWeight: 800, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                <ArrowLeft size={16} /> Back to My Cohorts
            </Link>

            {notification && (
                <div className="animate-slide-in" style={{
                    position: 'fixed',
                    top: '2rem',
                    right: '2rem',
                    zIndex: 1000,
                    padding: '1rem 1.5rem',
                    background: notification.type === 'success' ? 'var(--index-accent-soft-bg)' : 'var(--index-danger-bg-soft)',
                    border: `1px solid ${notification.type === 'success' ? 'color-mix(in srgb, var(--lgl-success) 20%, transparent)' : 'var(--index-danger-bg-soft)'}`,
                    color: notification.type === 'success' ? 'var(--lgl-success)' : 'var(--lgl-error)',
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
                        <X size={16} color={notification.type === 'success' ? 'var(--lgl-success)' : 'var(--lgl-error)'} />
                    </button>
                </div>
            )}

            <div className="cohort-header-premium shadow-premium">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1rem' }}>
                            <span className="badge-premium status-active">Active Session</span>
                            <span style={{ fontSize: '0.9rem', color: 'var(--index-primary-color)', fontWeight: 950, background: 'var(--index-accent-soft-bg)', padding: '4px 12px', borderRadius: '8px' }}>{cohort.id}</span>
                        </div>
                        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 950, color: 'var(--index-text-heading)', letterSpacing: '-0.04em' }}>{cohort.name}</h1>
                        <p style={{ margin: '0.5rem 0 0 0', color: 'var(--index-text-secondary)', fontSize: '1.1rem', fontWeight: 600 }}>
                            {new Date(cohort.start_date).toLocaleDateString()} — {new Date(cohort.end_date).toLocaleDateString()}
                        </p>

                        <div className="stat-box-strip">
                            <div className="stat-box-mini">
                                <div style={{ fontSize: '0.7rem', color: 'var(--index-text-faint)', fontWeight: 900, textTransform: 'uppercase' }}>Total Students</div>
                                <div style={{ fontWeight: 950, fontSize: '1.25rem', color: 'var(--index-text-heading)' }}>{cohort.students?.length || 0}</div>
                            </div>

                            <div className="stat-box-mini">
                                <div style={{ fontSize: '0.7rem', color: 'var(--index-text-faint)', fontWeight: 900, textTransform: 'uppercase' }}>Status</div>
                                <div style={{ fontWeight: 950, fontSize: '1.1rem', color: 'var(--index-primary-color)' }}>MANAGED</div>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn-secondary-outline" onClick={() => navigate(`/instructor/cohorts/${cohort.id}/certificate-design`)}>
                            <Award size={18} /> Design Certificate
                        </button>
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
                <div
                    className={`tab-premium ${activeTab === 'exam' ? 'active' : ''}`}
                    onClick={() => setActiveTab('exam')}
                >
                    <GraduationCap size={18} /> Final Exam
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
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--index-text-heading)', margin: 0 }}>{cohort.course!.title}</h3>
                                    <p style={{ color: 'var(--index-text-secondary)', fontWeight: 600 }}>Active curriculum for this cohort session.</p>
                                </div>
                                <button className="btn-secondary-outline" onClick={() => navigate(`/instructor/courses/${cohort.course!.id}/edit`)}>View Master Course</button>
                            </div>

                            {cohort.course.modules?.map((module, idx) => (
                                <div key={module.id} className="module-card-premium shadow-sm">
                                    <div className="module-header-premium">
                                        <h4 style={{ margin: 0, fontWeight: 850 }}>Module {idx + 1}: {module.title}</h4>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--index-text-secondary)', fontWeight: 700 }}>{module.lessons?.length || 0} Lessons</span>
                                    </div>
                                    <div style={{ padding: '1rem 2.5rem' }}>
                                        {module.lessons?.map((lesson) => (
                                            <div key={lesson.id} style={{ padding: '1rem 0', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--index-hover-bg)' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--index-border-subtle)' }}></div>
                                                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--index-text-heading)' }}>{lesson.title}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            ) : activeTab === 'students' ? (
                <div className="students-management-view animate-fade-in-up">
                    <div className="section-card shadow-sm" style={{ padding: 0, overflow: 'hidden', background: 'var(--index-card-bg)', borderRadius: '24px', border: '1.5px solid var(--index-border-subtle)' }}>
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
                                                <div style={{ width: '40px', height: '40px', background: 'var(--index-hover-bg)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'var(--index-primary-color)' }}>
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, color: 'var(--index-text-heading)' }}>{student.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--index-text-secondary)' }}>{student.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td data-label="Status">
                                            <span className="badge-premium" style={{
                                                background: student.pivot.status === 'dropped' ? 'var(--index-danger-bg-soft)' : 'var(--index-hover-bg)',
                                                color: student.pivot.status === 'dropped' ? 'var(--lgl-error)' : 'var(--index-text-secondary)'
                                            }}>
                                                {student.pivot.status}
                                            </span>
                                        </td>
                                        <td data-label="Joining Date" style={{ fontSize: '0.9rem', color: 'var(--index-text-secondary)', fontWeight: 600 }}>
                                            {new Date(student.pivot.created_at).toLocaleDateString()}
                                        </td>
                                        <td data-label="Management" style={{ textAlign: 'right' }}>
                                            {student.pivot.status !== 'dropped' ? (
                                                <button
                                                    onClick={() => handleBlockAccess(student.id)}
                                                    className="btn-secondary-outline"
                                                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderColor: 'var(--index-danger-bg-soft)', color: 'var(--lgl-error)', background: 'var(--index-danger-bg-soft)' }}
                                                    disabled={isUpdating}
                                                >
                                                    <ShieldBan size={14} /> Block Student
                                                </button>
                                            ) : (
                                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--lgl-error)' }}>ACCESS REVOKED</span>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} style={{ padding: '4rem', textAlign: 'center', color: 'var(--index-text-faint)' }}>
                                            No students have been enrolled in this cohort yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="exam-management-view animate-fade-in-up">
                    <div className="section-card shadow-sm" style={{ padding: '2.5rem', background: 'var(--index-card-bg)', borderRadius: '24px', border: '1.5px solid var(--index-border-subtle)', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 950, color: 'var(--index-text-heading)' }}>Enable Final Exam</h3>
                                <p style={{ margin: '0.35rem 0 0 0', color: 'var(--index-text-secondary)', fontWeight: 600, maxWidth: '520px' }}>
                                    Once enabled, every student in this cohort will see the exam on their dashboard during the window below. Students must reach 100% course progress before they can start it.
                                </p>
                            </div>
                            <button
                                onClick={() => setExamEnabled(!examEnabled)}
                                style={{
                                    width: '56px',
                                    height: '32px',
                                    borderRadius: '999px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: examEnabled ? 'var(--index-primary-color)' : 'var(--index-hover-bg)',
                                    position: 'relative',
                                    transition: 'background 0.3s',
                                    flexShrink: 0
                                }}
                            >
                                <span style={{
                                    position: 'absolute',
                                    top: '3px',
                                    left: examEnabled ? '27px' : '3px',
                                    width: '26px',
                                    height: '26px',
                                    borderRadius: '50%',
                                    background: 'white',
                                    transition: 'left 0.3s',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                                }} />
                            </button>
                        </div>

                        {examEnabled && (
                            <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 900, color: 'var(--index-text-heading)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Opens At</label>
                                    <input
                                        type="datetime-local"
                                        value={examOpensAt}
                                        onChange={(e) => setExamOpensAt(e.target.value)}
                                        style={{ width: '100%', height: '52px', background: 'var(--index-hover-bg)', border: '2px solid var(--index-hover-bg)', borderRadius: '14px', padding: '0 1rem', fontSize: '0.95rem', fontWeight: 600, color: 'var(--index-text-heading)', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 900, color: 'var(--index-text-heading)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Closes At</label>
                                    <input
                                        type="datetime-local"
                                        value={examClosesAt}
                                        onChange={(e) => setExamClosesAt(e.target.value)}
                                        style={{ width: '100%', height: '52px', background: 'var(--index-hover-bg)', border: '2px solid var(--index-hover-bg)', borderRadius: '14px', padding: '0 1rem', fontSize: '0.95rem', fontWeight: 600, color: 'var(--index-text-heading)', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>
                        )}

                        {!examEnabled && (
                            <button
                                className="btn-primary-forest"
                                onClick={handleSaveExam}
                                disabled={savingExam}
                                style={{ marginTop: '2rem' }}
                            >
                                {savingExam ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                {savingExam ? 'Saving...' : 'Save'}
                            </button>
                        )}
                    </div>

                    {examEnabled && (
                        <div className="section-card shadow-sm" style={{ padding: '2.5rem', background: 'var(--index-card-bg)', borderRadius: '24px', border: '1.5px solid var(--index-border-subtle)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 950, color: 'var(--index-text-heading)' }}>Exam Questions</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--index-text-secondary)', textTransform: 'uppercase' }}>Pass Mark</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={examPassMark}
                                        onChange={(e) => setExamPassMark(Number(e.target.value))}
                                        style={{ width: '80px', height: '44px', background: 'var(--index-hover-bg)', border: '2px solid var(--index-hover-bg)', borderRadius: '12px', padding: '0 0.75rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--index-text-heading)' }}
                                    />
                                    <span style={{ fontWeight: 800, color: 'var(--index-text-secondary)' }}>%</span>
                                </div>
                            </div>

                            {examQuestions.length === 0 ? (
                                <div className="empty-payload-card" style={{ padding: '3rem 2rem' }}>
                                    <div className="empty-icon-shell shadow-premium">
                                        <GraduationCap size={40} />
                                    </div>
                                    <h2 style={{ fontSize: '1.15rem' }}>No Questions Yet</h2>
                                    <p>Add the questions students will answer in this cohort's final exam.</p>
                                    <button className="btn-primary-forest" onClick={addQuestion}>
                                        <Plus size={18} /> Add Question
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {examQuestions.map((q, qIdx) => (
                                        <div key={q.id} style={{ background: 'white', border: '1.5px solid var(--index-hover-bg)', borderRadius: '20px', padding: '1.75rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
                                                <span style={{ fontWeight: 950, color: 'var(--index-primary-color)', fontSize: '0.85rem', flexShrink: 0, marginTop: '0.85rem' }}>Q{qIdx + 1}</span>
                                                <input
                                                    type="text"
                                                    placeholder="Enter question text..."
                                                    value={q.question}
                                                    onChange={(e) => updateQuestion(qIdx, { question: e.target.value })}
                                                    style={{ flex: 1, height: '48px', background: 'var(--index-hover-bg)', border: '2px solid var(--index-hover-bg)', borderRadius: '12px', padding: '0 1rem', fontSize: '0.95rem', fontWeight: 600, color: 'var(--index-text-heading)' }}
                                                />
                                                <button
                                                    onClick={() => removeQuestion(qIdx)}
                                                    style={{ background: 'var(--index-danger-bg-soft)', border: 'none', width: '48px', height: '48px', borderRadius: '12px', cursor: 'pointer', color: 'var(--lgl-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '2.25rem' }}>
                                                {q.options.map((opt, oIdx) => {
                                                    const isCorrect = q.correct_answer === oIdx;
                                                    return (
                                                        <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                            <button
                                                                onClick={() => updateQuestion(qIdx, { correct_answer: oIdx })}
                                                                title="Mark as correct answer"
                                                                style={{
                                                                    width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0, cursor: 'pointer',
                                                                    border: isCorrect ? '2px solid var(--index-primary-color)' : '2px solid var(--index-hover-bg)',
                                                                    background: isCorrect ? 'var(--index-primary-color)' : 'transparent',
                                                                    color: isCorrect ? 'white' : 'var(--index-text-faint)',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                                }}
                                                            >
                                                                {isCorrect ? <Check size={16} /> : String.fromCharCode(65 + oIdx)}
                                                            </button>
                                                            <input
                                                                type="text"
                                                                placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                                                value={opt}
                                                                onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                                                                style={{ flex: 1, height: '44px', background: 'var(--index-hover-bg)', border: '2px solid var(--index-hover-bg)', borderRadius: '10px', padding: '0 0.85rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--index-text-heading)' }}
                                                            />
                                                            {q.options.length > 2 && (
                                                                <button
                                                                    onClick={() => removeOption(qIdx, oIdx)}
                                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--index-text-faint)', display: 'flex', flexShrink: 0 }}
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                <button
                                                    onClick={() => addOption(qIdx)}
                                                    style={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--index-primary-color)', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', padding: '0.5rem 0' }}
                                                >
                                                    <Plus size={14} /> Add Option
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <button className="btn-secondary-outline" onClick={addQuestion} style={{ alignSelf: 'flex-start' }}>
                                        <Plus size={18} /> Add Another Question
                                    </button>
                                </div>
                            )}

                            <button
                                className="btn-primary-forest"
                                onClick={handleSaveExam}
                                disabled={savingExam}
                                style={{ marginTop: '2.5rem', width: '100%', justifyContent: 'center', padding: '1rem' }}
                            >
                                {savingExam ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                {savingExam ? 'Saving...' : 'Save Exam Settings'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
