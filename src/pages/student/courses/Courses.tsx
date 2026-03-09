import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Users, BookOpen, ArrowLeft, Layers, Loader2 } from 'lucide-react';

const Courses = () => {
    const [cohorts, setCohorts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCohort, setSelectedCohort] = useState<any | null>(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/my-enrollments`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    const mappedEnrolled = data.cohorts.map((c: any) => ({
                        id: c.id,
                        name: c.name,
                        isEnrolled: true,
                        courses: c.course ? [{
                            id: c.course.id,
                            title: c.course.title,
                            instructor: c.instructor?.name || 'Assigned Instructor',
                            thumbnail: c.course.thumbnail || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                            progress: c.pivot.progress || 0,
                            totalLessons: c.course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0,
                            completedLessons: 0,
                        }] : []
                    }));
                    setCohorts(mappedEnrolled);
                }
            } catch (err) {
                console.error("Fetch Data Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [API_URL, token]);

    if (loading) {
        return (
            <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                <Loader2 className="animate-spin" size={40} color="#1a4d3e" />
                <p style={{ fontWeight: 800, color: '#64748b' }}>Accessing Student Records...</p>
            </div>
        );
    }

    if (!selectedCohort) {
        return (
            <div className="animate-fade-in-up">
                <style>{`
                    .cohort-selection-grid, .course-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                        gap: 2rem;
                        margin-top: 2rem;
                    }

                    .cohort-select-card, .course-card {
                        background: white;
                        border: 1.5px solid #f1f5f9;
                        border-radius: 24px;
                        padding: 2rem;
                        cursor: pointer;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        display: flex;
                        flex-direction: column;
                        gap: 1.5rem;
                        height: 100%;
                    }

                    .course-card {
                        padding: 0;
                        overflow: hidden;
                        border-radius: 28px;
                    }

                    .cohort-select-card:hover, .course-card:hover {
                        transform: translateY(-8px);
                        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
                        border-color: #1a4d3e40;
                    }

                    .cohort-icon-box {
                        width: 56px;
                        height: 56px;
                        background: #f0fdf4;
                        color: #1a4d3e;
                        border-radius: 16px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .cohort-select-card h3 {
                        font-size: 1.25rem;
                        font-weight: 800;
                        color: #0f172a;
                        margin: 0;
                        line-height: 1.4;
                    }

                    .cohort-meta {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        color: #64748b;
                        font-size: 0.9rem;
                        font-weight: 600;
                    }

                    .back-btn-modern {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        background: none;
                        border: none;
                        color: #64748b;
                        font-weight: 700;
                        cursor: pointer;
                        margin-bottom: 2rem;
                        padding: 0;
                        transition: all 0.2s;
                    }

                    .back-btn-modern:hover {
                        color: #1a4d3e;
                    }

                    .selected-cohort-header {
                        margin-bottom: 3.5rem;
                    }

                    .selected-cohort-meta {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        color: #1a4d3e;
                        margin-bottom: 0.75rem;
                    }

                    .cohort-id-badge {
                        font-size: 0.9rem;
                        font-weight: 900;
                        text-transform: uppercase;
                        letter-spacing: 0.1em;
                        background: #f0fdf4;
                        padding: 4px 12px;
                        border-radius: 8px;
                    }

                    .selected-cohort-title {
                        font-size: 2.25rem;
                        font-weight: 950;
                        color: #0f172a;
                        letter-spacing: -0.04em;
                        margin: 0;
                    }

                    .course-progress-labels {
                        display: flex; 
                        justify-content: space-between; 
                        font-size: 0.85rem; 
                        color: #64748b; 
                        margin-bottom: 0.75rem;
                        font-weight: 700;
                    }

                    .course-progress-track {
                        width: 100%; 
                        background: #f1f5f9; 
                        height: 8px; 
                        border-radius: 4px;
                        overflow: hidden;
                    }

                    .course-progress-bar {
                        background: #1a4d3e; 
                        height: 100%; 
                        border-radius: 4px; 
                        transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                    }

                    .course-access-link {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #0f172a;
                        color: white;
                        text-decoration: none;
                        padding: 1rem;
                        border-radius: 16px;
                        font-weight: 800;
                        font-size: 0.95rem;
                        gap: 8px;
                        transition: all 0.2s;
                        margin-top: auto;
                    }

                    .course-access-link:hover {
                        background: #1a4d3e;
                        transform: translateY(-2px);
                    }

                    .empty-state-container {
                        grid-column: 1/-1; 
                        text-align: center; 
                        padding: 5rem 2rem; 
                        background: #f8fafc; 
                        border-radius: 32px; 
                        border: 2px dashed #e2e8f0;
                        transition: all 0.3s ease;
                    }

                    @media (max-width: 1024px) {
                        .cohort-selection-grid, .course-grid {
                            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                            gap: 1.5rem;
                        }
                    }

                    @media (max-width: 768px) {
                        .section-header-courses h1 {
                            font-size: 1.75rem !important;
                        }
                        .cohort-selection-grid, .course-grid {
                            grid-template-columns: 1fr;
                        }
                        .selected-cohort-header {
                            margin-bottom: 2rem;
                        }
                        .selected-cohort-title {
                            font-size: 1.75rem;
                        }
                    }
                `}</style>

                <div className="section-header-compact section-header-courses" style={{ marginBottom: '2.5rem' }}>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.04em', margin: 0 }}>
                        My Curriculum
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 600, marginTop: '0.5rem' }}>
                        Select a cohort to access your active courses.
                    </p>
                </div>

                <div className="cohort-selection-grid">
                    {cohorts.length > 0 ? (
                        cohorts.map(cohort => (
                            <div key={cohort.id} className="cohort-select-card shadow-sm" onClick={() => setSelectedCohort(cohort)}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div className="cohort-icon-box">
                                        <Users size={28} />
                                    </div>
                                    <div style={{
                                        padding: '6px 12px',
                                        borderRadius: '10px',
                                        fontSize: '0.75rem',
                                        fontWeight: 900,
                                        background: '#f0fdf4',
                                        color: '#166534',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        Active Enrollment
                                    </div>
                                </div>
                                <div>
                                    <div className="cohort-meta">
                                        <span style={{ color: '#1a4d3e', letterSpacing: '0.05em', fontSize: '0.75rem', fontWeight: 800 }}>ID: {cohort.id}</span>
                                    </div>
                                    <h3>{cohort.name}</h3>
                                </div>
                                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>
                                        <BookOpen size={16} /> {cohort.courses.length} Courses
                                    </div>
                                    <div style={{ color: '#1a4d3e', fontWeight: 800, fontSize: '0.9rem' }}>
                                        View Lessons <ChevronRight size={18} />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state-container">
                            <div style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                                <Layers size={48} style={{ opacity: 0.5 }} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>
                                No Active Programs
                            </h3>
                            <p style={{ color: '#64748b', fontWeight: 600 }}>
                                You haven't been assigned to any cohorts yet. Please contact your instructor.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up">
            <button
                onClick={() => setSelectedCohort(null)}
                className="back-btn-modern"
            >
                <ArrowLeft size={18} /> Back to Cohorts
            </button>

            <div className="selected-cohort-header">
                <div className="selected-cohort-meta">
                    <Layers size={20} strokeWidth={2.5} />
                    <span className="cohort-id-badge">{selectedCohort.id}</span>
                </div>
                <h1 className="selected-cohort-title">{selectedCohort.name}</h1>
            </div>

            <div className="course-grid">
                {selectedCohort.courses.map((course: any) => (
                    <div key={course.id} className="course-card shadow-premium">
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
                            <img
                                src={course.thumbnail}
                                alt={course.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', userSelect: 'none', pointerEvents: 'none' }}
                                onContextMenu={(e: any) => e.preventDefault()}
                            />
                            <div style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                padding: '6px 14px',
                                borderRadius: '10px',
                                fontSize: '0.75rem',
                                fontWeight: 900,
                                background: course.progress === 100 ? '#f0fdf4' : '#eff6ff',
                                color: course.progress === 100 ? '#166534' : '#1e40af',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                                {course.progress === 100 ? 'Completed' : course.progress > 0 ? 'In Progress' : 'Ready to Start'}
                            </div>
                        </div>

                        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1a4d3e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                Instructor: {course.instructor}
                            </div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '0 0 1.5rem 0', lineHeight: 1.3 }}>{course.title}</h3>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div className="course-progress-labels">
                                    <span>{course.progress}% Complete</span>
                                    <span>{course.completedLessons}/{course.totalLessons} Lessons</span>
                                </div>
                                <div className="course-progress-track">
                                    <div
                                        className="course-progress-bar"
                                        style={{ width: `${course.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            <Link
                                to={`/student/courses/${course.id}?cohortId=${selectedCohort.id}`}
                                className="course-access-link"
                            >
                                {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                                <ChevronRight size={16} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Courses;
