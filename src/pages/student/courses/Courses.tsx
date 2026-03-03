import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Users, BookOpen, ArrowLeft, Layers } from 'lucide-react';

const MOCK_COHORTS = [
    {
        id: 'CH-WLB-2026',
        name: 'Masterclass Batch Jan 2026',
        courses: [
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
            }
        ]
    },
    {
        id: 'CH-FE-PRIN',
        name: 'UI Design Principles — Global',
        courses: [
            {
                id: 3,
                title: 'Full Stack Web Development',
                instructor: 'Emma Davis',
                thumbnail: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                progress: 0,
                totalLessons: 42,
                completedLessons: 0,
            }
        ]
    }
];

const Courses = () => {
    const [selectedCohort, setSelectedCohort] = useState<typeof MOCK_COHORTS[0] | null>(null);

    if (!selectedCohort) {
        return (
            <div className="animate-fade-in-up">
                <style>{`
                    .cohort-selection-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                        gap: 2rem;
                        margin-top: 2rem;
                    }

                    .cohort-select-card {
                        background: white;
                        border: 1.5px solid #f1f5f9;
                        border-radius: 24px;
                        padding: 2rem;
                        cursor: pointer;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        display: flex;
                        flex-direction: column;
                        gap: 1.5rem;
                    }

                    .cohort-select-card:hover {
                        transform: translateY(-8px);
                        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
                        border-color: #3b82f640;
                    }

                    .cohort-icon-box {
                        width: 56px;
                        height: 56px;
                        background: #eff6ff;
                        color: #3b82f6;
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
                `}</style>

                <div className="section-header-compact">
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.04em' }}>My Cohorts</h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 600, marginTop: '0.5rem' }}>Select a cohort to access its associated courses.</p>
                </div>

                <div className="cohort-selection-grid">
                    {MOCK_COHORTS.map(cohort => (
                        <div key={cohort.id} className="cohort-select-card shadow-sm" onClick={() => setSelectedCohort(cohort)}>
                            <div className="cohort-icon-box">
                                <Users size={28} />
                            </div>
                            <div>
                                <div className="cohort-meta">
                                    <span style={{ color: '#3b82f6', letterSpacing: '0.05em', fontSize: '0.75rem', fontWeight: 800 }}>{cohort.id}</span>
                                </div>
                                <h3>{cohort.name}</h3>
                            </div>
                            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>
                                    <BookOpen size={16} /> {cohort.courses.length} Courses
                                </div>
                                <div style={{ color: '#3b82f6' }}>
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up">
            <button
                onClick={() => setSelectedCohort(null)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginBottom: '2rem',
                    padding: '0'
                }}
            >
                <ArrowLeft size={18} /> Back to Cohorts
            </button>

            <div style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#3b82f6', marginBottom: '0.5rem' }}>
                    <Layers size={20} strokeWidth={2.5} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{selectedCohort.id}</span>
                </div>
                <h1 style={{ fontSize: '2.25rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.04em' }}>{selectedCohort.name}</h1>
            </div>

            <div className="course-grid">
                {selectedCohort.courses.map((course) => (
                    <div key={course.id} className="course-card shadow-premium">
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
