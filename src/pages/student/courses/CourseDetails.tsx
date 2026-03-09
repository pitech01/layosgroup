import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { PlayCircle, FileText, CheckCircle, ChevronLeft, Clock, Download, Loader2, Video, Calendar, ShieldCheck, BookOpen } from 'lucide-react';

const CourseDetails = () => {
    const { courseId } = useParams();
    const [searchParams] = useSearchParams();
    const cohortId = searchParams.get('cohortId');

    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/my-enrollments`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();

                if (response.ok) {
                    const enrolledCohort = data.cohorts.find((c: any) => c.id == cohortId);
                    if (enrolledCohort) {
                        setCourse({
                            id: enrolledCohort.course.id,
                            title: enrolledCohort.course.title,
                            instructor: enrolledCohort.instructor?.name || 'Assigned Instructor',
                            cohortName: enrolledCohort.name,
                            description: enrolledCohort.course.description,
                            progress: enrolledCohort.pivot.progress || 0,
                            modules: enrolledCohort.course.modules || [],
                            isEnrolled: true,
                            completedLessons: data.completed_lessons || []
                        });
                    }
                }
            } catch (err) {
                console.error("Fetch Course Details Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseData();
    }, [courseId, cohortId, API_URL]);

    if (loading) {
        return (
            <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                <Loader2 className="animate-spin" size={40} color="#1a4d3e" />
                <p style={{ fontWeight: 800, color: '#64748b' }}>Opening Learning Environment...</p>
            </div>
        );
    }

    if (!course) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <h2 style={{ fontWeight: 900, color: '#0f172a' }}>Course Access Error</h2>
                <p style={{ color: '#64748b', fontWeight: 600 }}>We couldn't verify your enrollment in this course.</p>
                <Link to="/student/courses" className="btn-primary-forest" style={{ display: 'inline-flex', marginTop: '2rem' }}>Back to Courses</Link>
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up">
            <style>{`
                .module-card {
                    background: white;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 24px;
                    margin-bottom: 2.5rem;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }

                .lesson-row {
                    padding: 1rem;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    transition: background 0.2s;
                }

                .lesson-row:hover {
                    background: #f8fafc;
                }

                .resource-card {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem;
                    background: white;
                    border: 1px solid #f1f5f9;
                    border-radius: 14px;
                    transition: all 0.2s;
                }

                .resource-card:hover {
                    border-color: #1a4d3e;
                    transform: translateX(4px);
                }
            `}</style>

            <div style={{ marginBottom: '3rem' }}>
                <Link to="/student/courses" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontWeight: 700, marginBottom: '2rem' }}>
                    <ChevronLeft size={18} /> Back to Courses
                </Link>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#1a4d3e', marginBottom: '0.75rem' }}>
                            <ShieldCheck size={20} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{course.cohortName}</span>
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.04em', margin: 0 }}>{course.title}</h1>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 600, marginTop: '0.75rem' }}>Instruction by <span style={{ color: '#0f172a' }}>{course.instructor}</span></p>
                    </div>

                    <div style={{ background: 'white', padding: '1.25rem 2rem', borderRadius: '24px', border: '1.5px solid #f1f5f9', minWidth: '240px' }} className="shadow-sm">
                        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, marginBottom: '0.75rem' }}>Learning Progress</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ flex: 1, background: '#f1f5f9', height: '10px', borderRadius: '5px' }}>
                                <div style={{ width: `${course.progress}%`, background: '#1a4d3e', height: '100%', borderRadius: '5px' }}></div>
                            </div>
                            <span style={{ fontWeight: 900, color: '#0f172a' }}>{course.progress}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem' }}>
                <div>
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '1rem' }}>Curriculum</h3>
                        <p style={{ color: '#64748b', fontWeight: 600 }}>Master the required skills through these modules.</p>
                    </div>

                    {course.modules.map((module: any, idx: number) => (
                        <div key={module.id} className="module-card shadow-sm">
                            <div style={{ padding: '1.5rem 2rem', background: '#f8fafc', borderBottom: '1.5px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h4 style={{ margin: 0, fontWeight: 850 }}>Module {idx + 1}: {module.title}</h4>
                                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>{module.lessons?.length || 0} Lessons</span>
                            </div>
                            <div style={{ padding: '1rem' }}>
                                {module.lessons?.map((lesson: any) => {
                                    const isCompleted = course.completedLessons?.some((cl: any) => cl.id === lesson.id);
                                    return (
                                        <div key={lesson.id} className="lesson-row">
                                            <div style={{ color: isCompleted ? '#10b981' : '#94a3b8' }}>
                                                {isCompleted ? <CheckCircle size={20} /> :
                                                    lesson.type === 'live' ? <Video size={20} /> :
                                                        lesson.type === 'material' ? <FileText size={20} /> :
                                                            <PlayCircle size={20} />
                                                }
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>{lesson.title}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                                    {lesson.type === 'live' ? (
                                                        <>
                                                            <Calendar size={12} /> {lesson.live_date || 'TBA'}
                                                            <span style={{ margin: '0 4px', opacity: 0.5 }}>•</span>
                                                            <Clock size={12} /> {lesson.live_time || 'TBA'}
                                                        </>
                                                    ) : lesson.type === 'material' ? (
                                                        <><FileText size={12} /> Resource Pack</>
                                                    ) : (
                                                        <><Clock size={12} /> {lesson.duration || 'Video Lesson'}</>
                                                    )}
                                                </div>
                                            </div>
                                            <Link
                                                to={`/student/courses/${courseId}/lesson/${lesson.id}?cohortId=${cohortId}`}
                                                className="btn-standard"
                                                style={{
                                                    padding: '0.5rem 1.25rem',
                                                    fontSize: '0.8rem',
                                                    background: isCompleted ? '#f1f5f9' : '#1a4d3e',
                                                    color: isCompleted ? '#64748b' : 'white',
                                                    textDecoration: 'none',
                                                    fontWeight: 800
                                                }}
                                            >
                                                {isCompleted ? 'Review' : 'Start'}
                                            </Link>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    <div className="shadow-premium" style={{ background: '#f8fafc', borderRadius: '32px', padding: '2.5rem', border: '1.5px solid #f1f5f9' }}>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 950, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <BookOpen size={22} color="#1a4d3e" /> Course Info
                        </h4>
                        <div style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, fontWeight: 600, marginBottom: '2rem' }}>
                            {course.description}
                        </div>

                        <div style={{ paddingTop: '1.5rem', borderTop: '1.5px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem' }}>Academic Materials</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div className="resource-card">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <FileText size={18} color="#64748b" />
                                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Syllabus.pdf</span>
                                    </div>
                                    <button style={{ background: 'none', border: 'none', color: '#1a4d3e', cursor: 'pointer' }}><Download size={16} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetails;
