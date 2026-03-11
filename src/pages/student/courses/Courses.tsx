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
                        grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
                        gap: 2.5rem;
                        margin-top: 2rem;
                    }

                    .cohort-select-card, .course-card {
                        background: rgba(255, 255, 255, 0.8);
                        backdrop-filter: blur(12px);
                        border: 1px solid rgba(241, 245, 249, 0.8);
                        border-radius: 32px;
                        padding: 2.5rem;
                        cursor: pointer;
                        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                        display: flex;
                        flex-direction: column;
                        gap: 1.5rem;
                        height: 100%;
                        position: relative;
                        overflow: hidden;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
                    }

                    .cohort-select-card::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 6px;
                        background: linear-gradient(90deg, #1a4d3e, #4ade80);
                        opacity: 0;
                        transition: opacity 0.3s;
                    }

                    .course-card {
                        padding: 0;
                        border-radius: 32px;
                    }

                    .cohort-select-card:hover, .course-card:hover {
                        transform: translateY(-12px) scale(1.02);
                        box-shadow: 0 30px 60px -12px rgba(26, 77, 62, 0.12);
                        border-color: rgba(26, 77, 62, 0.2);
                    }

                    .cohort-select-card:hover::before {
                        opacity: 1;
                    }

                    .cohort-icon-box {
                        width: 64px;
                        height: 64px;
                        background: linear-gradient(135deg, #f0fdf4, #dcfce7);
                        color: #1a4d3e;
                        border-radius: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
                        transition: transform 0.3s ease;
                    }

                    .cohort-select-card:hover .cohort-icon-box {
                        transform: rotate(5deg) scale(1.1);
                    }

                    .cohort-select-card h3 {
                        font-size: 1.5rem;
                        font-weight: 900;
                        color: #0f172a;
                        margin: 0;
                        line-height: 1.2;
                        letter-spacing: -0.02em;
                    }

                    .cohort-meta {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        color: #64748b;
                        font-size: 0.8rem;
                        font-weight: 800;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                    }

                    .back-btn-modern {
                        display: inline-flex;
                        align-items: center;
                        gap: 10px;
                        background: white;
                        border: 1.5px solid #f1f5f9;
                        border-radius: 14px;
                        color: #64748b;
                        font-weight: 800;
                        font-size: 0.9rem;
                        cursor: pointer;
                        margin-bottom: 2.5rem;
                        padding: 0.75rem 1.5rem;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
                    }

                    .back-btn-modern:hover {
                        color: #1a4d3e;
                        border-color: #1a4d3e;
                        transform: translateX(-5px);
                        box-shadow: 0 10px 15px -3px rgba(26, 77, 62, 0.1);
                    }

                    .selected-cohort-header {
                        margin-bottom: 4rem;
                        position: relative;
                    }

                    .selected-cohort-header::after {
                        content: '';
                        position: absolute;
                        bottom: -1.5rem;
                        left: 0;
                        width: 60px;
                        height: 4px;
                        background: #1a4d3e;
                        border-radius: 2px;
                    }

                    .selected-cohort-meta {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        color: #1a4d3e;
                        margin-bottom: 1rem;
                    }

                    .cohort-id-badge {
                        font-size: 0.8rem;
                        font-weight: 950;
                        text-transform: uppercase;
                        letter-spacing: 0.15em;
                        background: rgba(26, 77, 62, 0.08);
                        color: #1a4d3e;
                        padding: 6px 16px;
                        border-radius: 30px;
                    }

                    .selected-cohort-title {
                        font-size: 3rem;
                        font-weight: 950;
                        color: #0f172a;
                        letter-spacing: -0.05em;
                        margin: 0;
                        line-height: 1;
                    }

                    .course-progress-labels {
                        display: flex; 
                        justify-content: space-between; 
                        font-size: 0.8rem; 
                        color: #64748b; 
                        margin-bottom: 1rem;
                        font-weight: 800;
                        text-transform: uppercase;
                        letter-spacing: 0.025em;
                    }

                    .course-progress-track {
                        width: 100%; 
                        background: #f1f5f9; 
                        height: 12px; 
                        border-radius: 6px;
                        overflow: hidden;
                        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
                    }

                    .course-progress-bar {
                        background: linear-gradient(90deg, #1a4d3e, #4ade80);
                        height: 100%; 
                        border-radius: 6px; 
                        transition: width 1s cubic-bezier(0.19, 1, 0.22, 1);
                    }

                    .course-access-link {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #0f172a;
                        color: white;
                        text-decoration: none;
                        padding: 1.25rem;
                        border-radius: 20px;
                        font-weight: 900;
                        font-size: 1rem;
                        gap: 12px;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        margin-top: auto;
                        box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.2);
                    }

                    .course-access-link:hover {
                        background: #1a4d3e;
                        transform: translateY(-3px);
                        box-shadow: 0 20px 25px -5px rgba(26, 77, 62, 0.3);
                    }

                    .empty-state-container {
                        grid-column: 1/-1; 
                        text-align: center; 
                        padding: 8rem 2rem; 
                        background: white;
                        border-radius: 48px; 
                        border: 2px dashed #f1f5f9;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                    }

                    .animate-fade-in-up {
                        animation: fadeInUp 0.6s ease-out forwards;
                    }

                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }

                    @media (max-width: 1024px) {
                        .cohort-selection-grid, .course-grid {
                            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                            gap: 2rem;
                        }
                        .selected-cohort-title {
                            font-size: 2.5rem;
                        }
                    }

                    @media (max-width: 768px) {
                        .section-header-courses h1 {
                            font-size: 2rem !important;
                        }
                        .cohort-selection-grid, .course-grid {
                            grid-template-columns: 1fr;
                        }
                        .selected-cohort-header {
                            margin-bottom: 3rem;
                        }
                        .selected-cohort-title {
                            font-size: 2rem;
                        }
                    }
                `}</style>

                <div className="section-header-courses" style={{ marginBottom: '4rem' }}>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.06em', margin: 0 }}>
                        My Learning Journey
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1.25rem', fontWeight: 600, marginTop: '1rem', maxWidth: '600px', lineHeight: 1.6 }}>
                        Track your progress, access modules, and master your professional path through our curated curriculum.
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
                                        <div className="cohort-id-badge">Cohort {cohort.id}</div>
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

                        <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1a4d3e' }}></div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#1a4d3e', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Led by {course.instructor}
                                </div>
                            </div>
                            <h3 style={{ fontSize: '1.6rem', fontWeight: 950, color: '#0f172a', margin: '0 0 2rem 0', lineHeight: 1.2, letterSpacing: '-0.03em' }}>{course.title}</h3>

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
