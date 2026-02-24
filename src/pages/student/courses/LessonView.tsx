import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle, Play, Download } from 'lucide-react';

const MOCK_LESSON = {
    id: 103,
    title: 'Custom Hooks',
    moduleTitle: 'Modern React Fundamentals',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    description: 'In this lesson, we will explore how to extract component logic into reusable functions called Custom Hooks. We will build a useFetch hook from scratch.',
    resources: [
        { name: 'useFetch.js snippet', url: '#' }
    ]
};

const LessonView = () => {
    // const { lessonId } = useParams();
    const [isCompleted, setIsCompleted] = useState(false);

    const lesson = MOCK_LESSON;

    return (
        <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                    {/* Navigation Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <Link to="/student/courses/1" style={{ display: 'flex', alignItems: 'center', color: '#64748b', fontSize: '0.95rem', fontWeight: 500, textDecoration: 'none' }}>
                            <ChevronLeft size={18} style={{ marginRight: '0.25rem' }} />
                            Back to Course
                        </Link>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn-cta-white" style={{ border: '1px solid #e2e8f0', padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
                                Previous
                            </button>
                            <button className="join-btn" style={{ background: '#0f172a', padding: '0.5rem 1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                Next Lesson <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Video Player Container */}
                    <div style={{ background: 'black', borderRadius: '16px', overflow: 'hidden', aspectRatio: '16/9', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', marginBottom: '2.5rem', position: 'relative' }}>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', margin: '0 auto 1.5rem auto', cursor: 'pointer', transition: 'transform 0.2s' }}>
                                    <Play size={40} color="white" style={{ marginLeft: '4px' }} />
                                </div>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Secure Video Stream Player</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }}>
                        <div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>{lesson.title}</h1>
                                <p style={{ fontSize: '0.95rem', color: '#3b82f6', fontWeight: 600 }}>{lesson.moduleTitle}</p>
                            </div>

                            <div style={{ color: '#475569', lineHeight: 1.7, marginBottom: '2rem' }}>
                                <p>{lesson.description}</p>
                            </div>

                            <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                                <button
                                    onClick={() => setIsCompleted(!isCompleted)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        border: isCompleted ? '1px solid #bbf7d0' : 'none',
                                        backgroundColor: isCompleted ? '#f0fdf4' : '#f1f5f9',
                                        color: isCompleted ? '#15803d' : '#475569',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <CheckCircle size={20} />
                                    {isCompleted ? 'Marked as Completed' : 'Mark as Completed'}
                                </button>
                            </div>
                        </div>

                        <div>
                            <div className="section-card" style={{ padding: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Lesson Materials</h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {lesson.resources.map((resource, idx) => (
                                        <li key={idx}>
                                            <a href={resource.url} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', textDecoration: 'none', padding: '0.5rem 0', fontSize: '0.95rem', transition: 'color 0.2s' }}>
                                                <Download size={18} style={{ color: '#94a3b8' }} />
                                                <span style={{ borderBottom: '1px solid transparent' }}>{resource.name}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonView;
