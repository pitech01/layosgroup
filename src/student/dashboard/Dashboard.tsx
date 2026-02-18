import { Link } from 'react-router-dom';
import {
    CheckCircle2,
    BookOpen,
    Clock,
    ArrowRight,
    Video
} from 'lucide-react';

const stats = [
    { label: 'Enrolled Courses', value: '3', icon: <BookOpen size={20} />, color: '#3b82f6' },
    { label: 'Completed Courses', value: '1', icon: <CheckCircle2 size={20} />, color: '#10b981' },
    { label: 'Upcoming Live Classes', value: '2', icon: <Video size={20} />, color: '#8b5cf6' },
];

const lastAccessedCourse = {
    id: 1,
    title: 'UI/UX Design for Beginner',
    currentLesson: 'Lesson 5: Typography Basics',
    progress: 78,
    icon: '🎨'
};

const upcomingLive = [
    { id: 1, course: 'Advanced React Patterns', instructor: 'Sarah Jenkins', time: '10:00 AM', date: 'Today' }
];

const notifications = [
    { id: 1, text: 'Live class starting in 30 minutes', time: '2 mins ago' },
    { id: 2, text: 'New lesson uploaded in React Course', time: '1 hour ago' },
    { id: 3, text: 'Your assignment has been graded', time: '5 hours ago' },
];

export default function Dashboard() {
    return (
        <div className="animate-fade-in-up">
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem', color: '#0f172a' }}>Dashboard</h1>

            {/* Welcome Card */}
            <div className="welcome-card-dark">
                <div className="welcome-content-left">
                    <h2>Welcome back, Anna 👋</h2>
                    <p style={{ lineHeight: '1.6' }}>Your progress this week is awesome!<br />Keep it up and reach your learning goals faster than ever.</p>
                    <button className="btn-cta-white">
                        <span>Continue Learning</span>
                        <ArrowRight size={18} />
                    </button>
                </div>
                {/* Decorative elements are handled by CSS pseudo-elements/backgrounds in .welcome-card-dark */}
            </div>

            {/* Stats Overview Cards */}
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

            <div className="dashboard-grid-layout">
                {/* Left Column: Continue Learning */}
                <div>
                    <div className="section-card">
                        <div className="section-title-modern">
                            <span>Continue Learning</span>
                        </div>

                        <div className="progress-item-modern" style={{ borderBottom: 'none', padding: 0 }}>
                            <div className="course-icon-round" style={{ fontSize: '1.5rem' }}>{lastAccessedCourse.icon}</div>
                            <div className="course-info-modern">
                                <h6 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{lastAccessedCourse.title}</h6>
                                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>{lastAccessedCourse.currentLesson}</p>

                                <div className="course-progress-bar-wrapper">
                                    <div className="modern-progress-bg">
                                        <div className="modern-progress-fill" style={{ width: `${lastAccessedCourse.progress}%` }}></div>
                                    </div>
                                    <span className="progress-percentage">{lastAccessedCourse.progress}%</span>
                                </div>
                                <div style={{ marginTop: '1.5rem' }}>
                                    <Link to={`/student/courses/${lastAccessedCourse.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
                                        Continue <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Upcoming Live & Recent Notifications */}
                <div>
                    {/* Upcoming Live Session Preview */}
                    <div className="section-card">
                        <div className="section-title-modern">
                            <span>Upcoming Live Class</span>
                        </div>
                        {upcomingLive.length > 0 ? (
                            <div style={{ padding: '1rem', borderRadius: '16px', border: '1px solid #f1f5f9', background: '#f8fafc' }}>
                                <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span>
                                    UPCOMING
                                </div>
                                <h6 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem', color: '#0f172a' }}>{upcomingLive[0].course}</h6>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>by {upcomingLive[0].instructor}</p>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Clock size={16} />
                                    {upcomingLive[0].date}, {upcomingLive[0].time}
                                </div>
                                <a
                                    href="https://meet.google.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="join-btn"
                                    style={{ width: '100%', display: 'flex', justifyContent: 'center', textAlign: 'center' }}
                                >
                                    Join Live Session
                                </a>
                            </div>
                        ) : (
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No upcoming sessions.</p>
                        )}
                    </div>

                    {/* Recent Notifications */}
                    <div className="section-card">
                        <div className="section-title-modern">
                            <span>Recent Notifications</span>
                        </div>
                        <div className="notification-list">
                            {notifications.map(notif => (
                                <div key={notif.id} className="notification-item">
                                    <div className="notif-dot-marker" style={{ background: '#f43f5e' }}></div>
                                    <div className="notif-text">
                                        <p style={{ color: '#0f172a', fontWeight: 500, margin: 0 }}>{notif.text}</p>
                                        <div className="notif-time">{notif.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
