import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const MOCK_COURSES = [
    {
        id: 1,
        title: 'Advanced React Development',
        instructor: 'Sarah Wilson',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        progress: 45,
        totalLessons: 24,
        completedLessons: 11,
    },
    {
        id: 2,
        title: 'UI/UX Design Masterclass',
        instructor: 'Michael Chen',
        thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a5638d48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        progress: 10,
        totalLessons: 18,
        completedLessons: 2,
    },
    {
        id: 3,
        title: 'Full Stack Web Development',
        instructor: 'Emma Davis',
        thumbnail: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        progress: 0,
        totalLessons: 42,
        completedLessons: 0,
    }
];

const Courses = () => {
    return (
        <div className="animate-fade-in-up">
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem', color: '#0f172a' }}>My Enrolled Courses</h1>

            <div className="course-grid">
                {MOCK_COURSES.map((course) => (
                    <div key={course.id} className="course-card">
                        <div className="course-image-wrapper">
                            <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="course-image"
                            />
                            <div className="course-overlay">
                                {course.progress === 100 ? 'Completed' : course.progress > 0 ? 'In Progress' : 'Not Started'}
                            </div>
                        </div>

                        <div className="course-content">
                            <div className="course-instructor">Instructor: {course.instructor}</div>
                            <h3 className="course-title">{course.title}</h3>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                    <span>{course.progress}% Complete</span>
                                    <span>{course.completedLessons}/{course.totalLessons} Lessons</span>
                                </div>
                                <div style={{ width: '100%', background: '#f1f5f9', height: '6px', borderRadius: '3px' }}>
                                    <div
                                        style={{ width: `${course.progress}%`, background: '#3b82f6', height: '100%', borderRadius: '3px', transition: 'width 0.5s ease' }}
                                    ></div>
                                </div>
                            </div>

                            <Link
                                to={`/student/courses/${course.id}`}
                                className="instructor-link-modern"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white', marginTop: 'auto' }}
                            >
                                {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                                <ChevronRight size={16} style={{ marginLeft: '0.5rem' }} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Courses;
