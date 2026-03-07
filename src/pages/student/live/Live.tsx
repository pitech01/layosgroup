import { useState, useEffect } from 'react';
import { Calendar, Clock, Video, User, Inbox, FileVideo, X, Maximize2 } from 'lucide-react';

interface LiveSession {
    id: number;
    title: string;
    course_id: number;
    course: {
        title: string;
    };
    scheduled_date: string;
    start_time: string;
    end_time: string;
    meeting_link: string;
    instructor_name: string;
    recording_link?: string;
}

const Live = () => {
    const [sessions, setSessions] = useState<LiveSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch direct live sessions
                const sessResponse = await fetch(`${API_URL}/student/live-sessions`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const sessData = await sessResponse.json();

                // Fetch enrolled courses to extract curriculum live sessions
                const coursesResponse = await fetch(`${API_URL}/student/my-courses`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const coursesData = await coursesResponse.json();

                let combinedSessions: LiveSession[] = Array.isArray(sessData) ? sessData : [];

                // Extract live sessions from course curriculum
                if (Array.isArray(coursesData)) {
                    coursesData.forEach((course: any) => {
                        if (course.modules) {
                            course.modules.forEach((mod: any) => {
                                if (mod.lessons) {
                                    mod.lessons.forEach((lesson: any) => {
                                        if (lesson.type === 'live' && lesson.live_date) {
                                            // Avoid duplicates if same session is in both
                                            const exists = combinedSessions.some(s =>
                                                s.title === lesson.title &&
                                                s.scheduled_date === lesson.live_date
                                            );

                                            if (!exists) {
                                                combinedSessions.push({
                                                    id: lesson.id,
                                                    title: lesson.title,
                                                    course_id: course.id,
                                                    course: { title: course.title },
                                                    scheduled_date: lesson.live_date,
                                                    start_time: lesson.live_time || '00:00:00',
                                                    end_time: lesson.live_end_time || '01:00:00',
                                                    meeting_link: lesson.live_link || '#',
                                                    instructor_name: course.instructor?.name || 'Instructor',
                                                    recording_link: lesson.video_url // Assuming recording maps to video_url after class
                                                });
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    });
                }

                setSessions(combinedSessions);
            } catch (err) {
                console.error("Fetch Live Data Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [API_URL]);

    const [selectedCourseId, setSelectedCourseId] = useState<string>('all');

    const getSessionStatus = (session: LiveSession) => {
        const now = new Date();
        const start = new Date(`${session.scheduled_date}T${session.start_time}`);
        const end = new Date(`${session.scheduled_date}T${session.end_time}`);

        if (now >= start && now <= end) return 'live';
        if (now < start) return 'upcoming';
        return 'ended';
    };

    // Extract unique courses for filtering
    const courses = Array.from(new Set(sessions.filter((s: any) => s.course).map((s: any) => JSON.stringify(s.course))))
        .map((str: any) => JSON.parse(str));

    const filteredSessions = sessions.filter((s: LiveSession) =>
        selectedCourseId === 'all' || s.course_id.toString() === selectedCourseId
    );

    const upcomingSessions = filteredSessions.filter((s: LiveSession) => getSessionStatus(s) !== 'ended');
    const pastSessions = filteredSessions.filter((s: LiveSession) => getSessionStatus(s) === 'ended');

    return (
        <div className="animate-fade-in-up">
            <style>{`
                .preview-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.85);
                    backdrop-filter: blur(12px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 2rem;
                }

                .preview-content-card {
                    background: white;
                    width: 100%;
                    max-width: 900px;
                    border-radius: 32px;
                    overflow: hidden;
                    box-shadow: 0 40px 100px -20px rgba(0,0,0,0.5);
                    animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                @keyframes modalPop {
                    from { transform: scale(0.9) translateY(20px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }

                .preview-header {
                    padding: 1.5rem 2rem;
                    border-bottom: 1.5px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .video-container {
                    width: 100%;
                    background: #000;
                    aspect-ratio: 16/9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .close-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    border: none;
                    background: #f1f5f9;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .close-btn:hover {
                    background: #ef4444;
                    color: white;
                    transform: rotate(90deg);
                }
            `}</style>

            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Live Sessions</h1>
                    <p style={{ color: '#64748b' }}>Join upcoming classes or watch recorded sessions.</p>
                </div>

                {sessions.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Filter by Course:</span>
                        <select
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                            style={{
                                padding: '0.6rem 2.5rem 0.6rem 1rem',
                                borderRadius: '12px',
                                border: '1.5px solid #e2e8f0',
                                background: 'white',
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="all">All Enrolled Courses</option>
                            {courses.map((course: any) => (
                                <option key={course.id} value={course.id}>{course.title}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Upcoming Sessions */}
            <section style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <span style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 0 4px rgba(239, 68, 68, 0.2)' }}></span>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Upcoming & Live</h2>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading live sessions...</div>
                ) : upcomingSessions.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {upcomingSessions.map((session: LiveSession) => {
                            const status = getSessionStatus(session);
                            return (
                                <div key={session.id} className="section-card" style={{ position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05, transform: 'rotate(15deg)' }}>
                                        <Video size={120} />
                                    </div>

                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                            <span style={{ padding: '0.25rem 0.75rem', background: '#eff6ff', color: '#3b82f6', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #dbeafe' }}>
                                                {session.course?.title}
                                            </span>
                                            {status === 'live' && (
                                                <span className="live-badge" style={{
                                                    background: '#ef4444',
                                                    color: 'white',
                                                    padding: '0.25rem 0.6rem',
                                                    borderRadius: '6px',
                                                    fontSize: '0.65rem',
                                                    fontWeight: 900,
                                                    animation: 'pulse 1s infinite'
                                                }}>LIVE NOW</span>
                                            )}
                                        </div>

                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', lineHeight: 1.4 }}>{session.title}</h3>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', fontSize: '0.9rem' }}>
                                                <User size={16} />
                                                <span>{session.instructor_name}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', fontSize: '0.9rem' }}>
                                                <Calendar size={16} />
                                                <span>{new Date(session.scheduled_date).toLocaleDateString()} &bull; {session.start_time.substring(0, 5)} - {session.end_time.substring(0, 5)}</span>
                                            </div>
                                        </div>

                                        <a
                                            href={session.meeting_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'block',
                                                textAlign: 'center',
                                                background: status === 'live' ? '#ef4444' : '#3b82f6',
                                                padding: '0.75rem',
                                                textDecoration: 'none',
                                                color: 'white',
                                                borderRadius: '12px',
                                                fontWeight: 700,
                                                transition: 'transform 0.2s',
                                                boxShadow: status === 'live' ? '0 10px 15px -3px rgba(239, 68, 68, 0.4)' : '0 10px 15px -3px rgba(59, 130, 246, 0.2)'
                                            }}
                                            onMouseEnter={(e: any) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseLeave={(e: any) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            {status === 'live' ? 'Join Live Class' : 'View Link'}
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="section-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <Inbox size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ color: '#1e293b', marginBottom: '0.5rem', fontWeight: 800 }}>No Sessions Found</h3>
                        <p style={{ color: '#64748b', fontWeight: 600 }}>Try clearing your filters or check back later.</p>
                    </div>
                )}
            </section>

            {/* Past Sessions */}
            {pastSessions.length > 0 && (
                <section>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>Past Sessions & Recordings</h2>
                    <div className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
                        {pastSessions.map((session: LiveSession, idx: number) => (
                            <div key={session.id} style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx !== pastSessions.length - 1 ? '1px solid #f1f5f9' : 'none', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>{session.title}</h4>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: 600 }}>{session.course?.title}</p>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Calendar size={14} /> {new Date(session.scheduled_date).toLocaleDateString()}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Clock size={14} /> {session.start_time.substring(0, 5)} - {session.end_time.substring(0, 5)}
                                        </span>
                                        {session.recording_link && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#3b82f6' }}>
                                                <FileVideo size={14} /> Video Available
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => session.recording_link && setPreviewUrl(session.recording_link)}
                                    disabled={!session.recording_link}
                                    className="btn-cta-white"
                                    style={{
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: '0.85rem',
                                        padding: '0.6rem 1.25rem',
                                        borderRadius: '10px',
                                        fontWeight: 800,
                                        opacity: session.recording_link ? 1 : 0.5,
                                        cursor: session.recording_link ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    {session.recording_link ? 'Watch Recording' : 'Recording Pending'}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Video Preview Modal */}
            {previewUrl && (
                <div className="preview-modal-overlay" onClick={() => setPreviewUrl(null)}>
                    <div className="preview-content-card" onClick={(e: any) => e.stopPropagation()}>
                        <div className="preview-header">
                            <h3 style={{ margin: 0, fontWeight: 950, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Maximize2 size={18} /> Recording Preview
                            </h3>
                            <button className="close-btn" onClick={() => setPreviewUrl(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="video-container">
                            <video
                                src={previewUrl}
                                controls
                                autoPlay
                                style={{ width: '100%', height: '100%' }}
                                controlsList="nodownload"
                                onContextMenu={(e: any) => e.preventDefault()}
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Live;
