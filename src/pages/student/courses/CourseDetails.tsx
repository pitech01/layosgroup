import { Link } from 'react-router-dom';
import { PlayCircle, FileText, CheckCircle, ChevronLeft, Clock, Download } from 'lucide-react';

const MOCK_COURSE_DETAILS = {
    id: 1,
    title: 'Advanced React Development',
    instructor: 'Sarah Wilson',
    description: 'Master modern React concepts including Hooks, Context, Reducers, and Performance Optimization. Build real-world applications with best practices.',
    progress: 45,
    modules: [
        {
            id: 1,
            title: 'Modern React Fundamentals',
            lessons: [
                { id: 101, title: 'Introduction to Hooks', duration: '15:20', type: 'video', isCompleted: true },
                { id: 102, title: 'useEffect Deep Dive', duration: '22:15', type: 'video', isCompleted: true },
                { id: 103, title: 'Custom Hooks', duration: '18:40', type: 'video', isCompleted: false },
            ]
        },
        {
            id: 2,
            title: 'State Management',
            lessons: [
                { id: 201, title: 'Context API vs Redux', duration: '25:00', type: 'video', isCompleted: false },
                { id: 202, title: 'Zustand Implementation', duration: '19:30', type: 'video', isCompleted: false },
            ]
        }
    ],
    resources: [
        { id: 1, title: 'Course Syllabus.pdf', size: '2.5 MB' },
        { id: 2, title: 'Project Starter Code.zip', size: '15 MB' }
    ]
};

const CourseDetails = () => {
    // const { courseId } = useParams();
    const course = MOCK_COURSE_DETAILS;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <Link to="/student/courses" style={{ display: 'inline-flex', alignItems: 'center', color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', textDecoration: 'none' }}>
                <ChevronLeft size={16} style={{ marginRight: '0.25rem' }} /> Back to Courses
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }}>
                {/* Main Content - Course Info & Curriculum */}
                <div>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>{course.title}</h1>
                        <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '1rem' }}>Instructor: <span style={{ color: '#0f172a', fontWeight: 600 }}>{course.instructor}</span></p>
                        <p style={{ color: '#475569', lineHeight: 1.6 }}>{course.description}</p>
                    </div>

                    {/* Progress */}
                    <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '1.25rem', marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ fontWeight: 600, color: '#1e40af' }}>Your Progress</span>
                            <span style={{ fontWeight: 700, color: '#1d4ed8' }}>{course.progress}%</span>
                        </div>
                        <div style={{ width: '100%', background: '#bfdbfe', height: '8px', borderRadius: '4px' }}>
                            <div style={{ width: `${course.progress}%`, background: '#2563eb', height: '100%', borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
                        </div>
                    </div>

                    {/* Modules Accordion */}
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>Course Curriculum</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {course.modules.map((module) => (
                                <div key={module.id} className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
                                    <div style={{ background: '#f8fafc', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 600, color: '#334155' }}>{module.title}</span>
                                        <span style={{ fontSize: '0.75rem', background: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0', color: '#64748b' }}>{module.lessons.length} Lessons</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        {module.lessons.map((lesson, idx) => (
                                            <Link
                                                key={lesson.id}
                                                to={`/student/lesson/${lesson.id}`}
                                                style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none', borderBottom: idx !== module.lessons.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background-color 0.2s', backgroundColor: 'white' }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    {lesson.isCompleted ? (
                                                        <CheckCircle size={20} color="#22c55e" />
                                                    ) : (
                                                        <PlayCircle size={20} color="#94a3b8" />
                                                    )}
                                                    <span style={{ fontSize: '0.9rem', color: lesson.isCompleted ? '#94a3b8' : '#334155', textDecoration: lesson.isCompleted ? 'line-through' : 'none', fontWeight: 500 }}>
                                                        {lesson.title}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <Clock size={14} />
                                                    {lesson.duration}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar - Resources & Actions */}
                <div>
                    <div className="section-card" style={{ position: 'sticky', top: '100px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>Course Resources</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {course.resources.map((resource) => (
                                <a
                                    key={resource.id}
                                    href="#"
                                    style={{ display: 'flex', alignItems: 'center', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', textDecoration: 'none', transition: 'all 0.2s', backgroundColor: 'white' }}
                                >
                                    <FileText size={20} style={{ color: '#94a3b8', marginRight: '0.75rem' }} />
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{resource.title}</p>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>{resource.size}</p>
                                    </div>
                                    <Download size={16} style={{ color: '#cbd5e1' }} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetails;
