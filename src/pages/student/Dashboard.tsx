import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Play,
    CheckCircle2,
    BookOpen,
    Clock,
    ArrowRight,
    Star,
    Video,
    ChevronRight,
    Loader2,
    Maximize2,
    X,
    FileVideo
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function StudentDashboard() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [liveSessions, setLiveSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
            const token = localStorage.getItem('token');

            try {
                // Fetch concurrently for better performance
                const [enrollmentsRes, sessionsRes] = await Promise.all([
                    fetch(`${API_URL}/my-enrollments`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${API_URL}/student/live-sessions`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (enrollmentsRes.ok) {
                    const data = await enrollmentsRes.json();
                    if (data.cohorts) {
                        setEnrollments(data.cohorts);
                    }
                }

                if (sessionsRes.ok) {
                    const data = await sessionsRes.json();
                    setLiveSessions(data);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const nameParts = user?.name ? user.name.split(' ') : [''];
    const firstName = nameParts[0] || 'Student';

    const getCourseIcon = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes('design') || t.includes('ui/ux')) return '🎨';
        if (t.includes('frontend') || t.includes('developer') || t.includes('code')) return '💻';
        if (t.includes('test') || t.includes('qa')) return '🧪';
        if (t.includes('data')) return '📊';
        return '📚';
    };

    const getSessionStatus = (session: any) => {
        const now = new Date();
        const start = new Date(`${session.scheduled_date}T${session.start_time}`);
        const end = new Date(`${session.scheduled_date}T${session.end_time}`);

        if (now >= start && now <= end) return 'live';
        if (now < start) return 'upcoming';
        return 'ended';
    };

    const stats = [
        { label: 'Enrolled Courses', value: enrollments.length.toString(), icon: <BookOpen size={20} />, color: '#3b82f6' },
        { label: 'Live Classes Today', value: liveSessions.filter(s => new Date(s.scheduled_date).toDateString() === new Date().toDateString()).length.toString(), icon: <Video size={20} />, color: '#8b5cf6' },
        { label: 'Completed', value: enrollments.filter(e => e.pivot?.progress === 100).length.toString(), icon: <CheckCircle2 size={20} />, color: '#10b981' },
        { label: 'Certificates', value: '0', icon: <Star size={20} />, color: '#f59e0b' },
    ];


    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Loader2 size={40} className="animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up">
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem', color: '#0f172a' }}>Dashboard</h1>

            {/* Welcome Card */}
            <div className="welcome-card-dark">
                <div className="welcome-content-left">
                    <h2>Welcome back, {firstName} 👋</h2>
                    <p style={{ lineHeight: '1.6' }}>Your progress this week is awesome!<br />Keep it up and reach your learning goals faster than ever.</p>
                    <Link to="/student/courses" className="btn-cta-white" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                        <span>Continue Learning</span>
                        <ArrowRight size={18} />
                    </Link>
                </div>

                <div className="welcome-course-previews">
                    {enrollments.slice(0, 2).map((cohort: any) => (
                        <div key={cohort.id} className="mini-course-card">
                            <div className="mini-icon-box" style={{ fontSize: '1.25rem' }}>{getCourseIcon(cohort.course?.title || 'Course')}</div>
                            <h5 style={{ fontWeight: 600 }}>{cohort.course?.title || cohort.name}</h5>
                            <div className="mini-progress-bar">
                                <div className="mini-progress-fill" style={{ width: `${cohort.pivot?.progress || 0}%` }}></div>
                            </div>
                            <div className="mini-lessons-count">{cohort.course?.modules?.flatMap((m: any) => m.lessons)?.length || 0} lessons</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {stats.map((stat, idx) => (
                    <div key={idx} className="section-card" style={{ marginBottom: 0, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', borderRadius: '12px', background: `${stat.color}15`, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{stat.value}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Grid Content */}
            <div className="dashboard-grid-layout">
                <style>{`
                    .welcome-card-dark {
                        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                        color: white;
                        border-radius: 24px;
                        padding: 3rem;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 2.5rem;
                        position: relative;
                        overflow: hidden;
                    }
                    .welcome-content-left h2 { font-size: 2rem; margin-bottom: 1rem; }
                    .welcome-course-previews { display: flex; gap: 1.5rem; }
                    .mini-course-card { background: rgba(255,255,255,0.1); padding: 1.25rem; border-radius: 16px; min-width: 180px; }
                    .section-card { background: white; border-radius: 20px; padding: 1.5rem; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); margin-bottom: 2rem; }
                    .section-title-modern { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; font-weight: 700; color: #0f172a; }
                    .progress-item-modern { display: flex; align-items: center; gap: 1.5rem; padding: 1rem 0; border-bottom: 1px solid #f8fafc; }
                    .course-icon-round { width: 48px; height: 48px; border-radius: 12px; background: #f1f5f9; display: flex; alignItems: center; justifyContent: center; }
                    .course-info-modern { flex: 1; }
                    .course-info-modern h6 { margin: 0 0 0.5rem 0; font-size: 0.95rem; }
                    .course-progress-bar-wrapper { display: flex; align-items: center; gap: 1rem; }
                    .modern-progress-bg { flex: 1; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }
                    .modern-progress-fill { height: 100%; background: #3b82f6; border-radius: 3px; }
                    .progress-percentage { font-size: 0.75rem; font-weight: 700; color: #64748b; }
                    .btn-cta-white { background: white; color: #0f172a; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 600; margin-top: 1.5rem; }
                    .dashboard-grid-layout { display: grid; grid-template-columns: 1.6fr 1fr; gap: 2.5rem; }

                    @media (max-width: 1024px) {
                        .welcome-card-dark {
                            flex-direction: column;
                            align-items: flex-start;
                            padding: 2rem;
                            gap: 2.5rem;
                            margin-bottom: 2rem;
                        }
                        .welcome-course-previews {
                            width: 100%;
                            flex-direction: row;
                            overflow-x: auto;
                            padding-bottom: 0.5rem;
                            gap: 1.25rem;
                            scrollbar-width: none;
                        }
                        .welcome-course-previews::-webkit-scrollbar { display: none; }
                        .mini-course-card {
                            min-width: 200px;
                            flex-shrink: 0;
                        }
                        .dashboard-grid-layout {
                            grid-template-columns: 1fr;
                            gap: 1.5rem;
                        }
                    }

                    @media (max-width: 640px) {
                        .welcome-card-dark h2 {
                            font-size: 1.5rem;
                        }
                        .welcome-card-dark p {
                            font-size: 0.9rem;
                        }
                        .section-card {
                            padding: 1.25rem !important;
                        }
                        .progress-item-modern {
                            gap: 1rem;
                        }
                        .course-icon-round {
                            width: 40px;
                            height: 40px;
                        }
                        .course-info-modern h6 {
                            font-size: 0.9rem;
                        }
                    }
                `}</style>
                {/* Left Column: Progress & Activity */}
                <div className="dashboard-left-col">
                    <div className="section-card">
                        <div className="section-title-modern">
                            <span>My Course Progress</span>
                            <Link to="#" style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                                View All <ChevronRight size={14} />
                            </Link>
                        </div>

                        <div className="progress-list">
                            {enrollments.map((cohort: any) => (
                                <div key={cohort.id} className="progress-item-modern">
                                    <div className="course-icon-round" style={{ fontSize: '1.25rem' }}>{getCourseIcon(cohort.course?.title || 'Course')}</div>
                                    <div className="course-info-modern">
                                        <h6>{cohort.course?.title || cohort.name}</h6>
                                        <div className="course-progress-bar-wrapper">
                                            <div className="modern-progress-bg">
                                                <div className="modern-progress-fill" style={{ width: `${cohort.pivot?.progress || 0}%` }}></div>
                                            </div>
                                            <span className="progress-percentage">{cohort.pivot?.progress || 0}%</span>
                                        </div>
                                    </div>
                                    <div style={{ color: '#94a3b8' }}>
                                        <div className="sidebar-icon-btn" style={{ padding: '0.5rem', cursor: 'pointer', background: '#f8fafc' }}>
                                            <Play size={18} fill="#3b82f6" color="#3b82f6" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {enrollments.length === 0 && (
                                <p style={{ fontSize: '0.875rem', color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>You are not enrolled in any courses yet.</p>
                            )}
                        </div>
                    </div>

                </div>

                {/* Right Column: Live Classes & Notifications */}
                <div className="dashboard-right-col">
                    <div className="section-card">
                        <div className="section-title-modern">
                            <span>Upcoming Live Classes</span>
                        </div>
                        {liveSessions.length > 0 ? liveSessions.slice(0, 3).map((session: any) => {
                            const sessionDate = new Date(session.scheduled_date);
                            const isToday = sessionDate.toDateString() === new Date().toDateString();
                            const isTomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toDateString() === sessionDate.toDateString();
                            const dateLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : sessionDate.toLocaleDateString();
                            const status = getSessionStatus(session);

                            return (
                                <div key={session.id} style={{ marginBottom: '1.25rem', padding: '1rem', borderRadius: '16px', border: '1px solid #f1f5f9', background: '#f8fafc' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Clock size={14} />
                                        {dateLabel}, {session.start_time.substring(0, 5)} - {session.end_time.substring(0, 5)}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h6 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem', color: '#0f172a' }}>{session.title}</h6>
                                        {status === 'live' && (
                                            <span style={{ background: '#ef4444', color: 'white', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 800, animation: 'pulse 1s infinite' }}>LIVE</span>
                                        )}
                                        {status === 'ended' && (
                                            <span style={{ background: '#f1f5f9', color: '#64748b', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 800 }}>ENDED</span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>{session.course?.title}</p>

                                    {status === 'ended' ? (
                                        <button
                                            onClick={() => session.recording_link && setPreviewUrl(session.recording_link)}
                                            disabled={!session.recording_link}
                                            style={{
                                                width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '0.625rem', fontSize: '0.85rem',
                                                background: session.recording_link ? '#3b82f6' : '#e2e8f0',
                                                color: session.recording_link ? 'white' : '#94a3b8',
                                                border: 'none', borderRadius: '8px', fontWeight: 600,
                                                cursor: session.recording_link ? 'pointer' : 'not-allowed'
                                            }}
                                        >
                                            {session.recording_link ? <><FileVideo size={16} /> Watch Recording</> : 'Recording Pending'}
                                        </button>
                                    ) : (
                                        <a
                                            href={session.meeting_link}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{
                                                width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '0.625rem', fontSize: '0.85rem',
                                                background: status === 'live' ? '#ef4444' : '#3b82f6',
                                                color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 600
                                            }}
                                        >
                                            {status === 'live' ? 'Join Live Now' : 'Join Link'}
                                        </a>
                                    )}
                                </div>
                            );
                        }) : (
                            <p style={{ fontSize: '0.875rem', color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>No upcoming live sessions.</p>
                        )}
                    </div>

                </div>
            </div>

            {/* Video Preview Modal */}
            {previewUrl && (
                <div
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}
                    onClick={() => setPreviewUrl(null)}
                >
                    <style>{`
                        @keyframes modalPopDash {
                            from { transform: scale(0.9) translateY(20px); opacity: 0; }
                            to { transform: scale(1) translateY(0); opacity: 1; }
                        }
                    `}</style>
                    <div
                        style={{ background: 'white', width: '100%', maxWidth: '900px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.5)', animation: 'modalPopDash 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                        onClick={(e: any) => e.stopPropagation()}
                    >
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1.5px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontWeight: 950, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Maximize2 size={18} /> Recording Preview
                            </h3>
                            <button
                                onClick={() => setPreviewUrl(null)}
                                style={{ width: '40px', height: '40px', borderRadius: '12px', border: 'none', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={(e: any) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'rotate(90deg)'; }}
                                onMouseLeave={(e: any) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.transform = 'none'; }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ width: '100%', background: '#000', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
}
