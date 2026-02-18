import { Link } from 'react-router-dom';
import {
    Play,
    CheckCircle2,
    BookOpen,
    Clock,
    ArrowRight,
    Star,
    Video,
    ChevronRight
} from 'lucide-react';

const stats = [
    { label: 'Enrolled Courses', value: '3', icon: <BookOpen size={20} />, color: '#3b82f6' },
    { label: 'Live Classes Today', value: '2', icon: <Video size={20} />, color: '#8b5cf6' },
    { label: 'Completed', value: '1', icon: <CheckCircle2 size={20} />, color: '#10b981' },
    { label: 'Certificates', value: '1', icon: <Star size={20} />, color: '#f59e0b' },
];

const courseProgress = [
    { id: 1, title: 'UI/UX Design for Beginner', lessons: '30', progress: 78, icon: '🎨' },
    { id: 2, title: 'Front End developer for beginner', lessons: '30', progress: 78, icon: '💻' },
    { id: 3, title: 'Usability testing for beginner', lessons: '28', progress: 22, icon: '🧪' },
];

const upcomingLive = [
    { id: 1, course: 'Advanced React Patterns', instructor: 'Sarah Jenkins', time: '10:00 AM', date: 'Today' },
    { id: 2, course: 'Node.js Backend Architecture', instructor: 'Mike Chen', time: '02:00 PM', date: 'Tomorrow' },
];

const notifications = [
    { id: 1, text: 'Live class starting in 30 minutes', time: '2 mins ago' },
    { id: 2, text: 'New lesson uploaded in React Course', time: '1 hour ago' },
    { id: 3, text: 'Your assignment has been graded', time: '5 hours ago' },
];

export default function StudentDashboard() {
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

                <div className="welcome-course-previews">
                    {courseProgress.slice(0, 2).map(course => (
                        <div key={course.id} className="mini-course-card">
                            <div className="mini-icon-box" style={{ fontSize: '1.25rem' }}>{course.icon}</div>
                            <h5 style={{ fontWeight: 600 }}>{course.title}</h5>
                            <div className="mini-progress-bar">
                                <div className="mini-progress-fill" style={{ width: `${course.progress}%` }}></div>
                            </div>
                            <div className="mini-lessons-count">{course.lessons} lessons</div>
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
                            {courseProgress.map(course => (
                                <div key={course.id} className="progress-item-modern">
                                    <div className="course-icon-round" style={{ fontSize: '1.25rem' }}>{course.icon}</div>
                                    <div className="course-info-modern">
                                        <h6>{course.title}</h6>
                                        <div className="course-progress-bar-wrapper">
                                            <div className="modern-progress-bg">
                                                <div className="modern-progress-fill" style={{ width: `${course.progress}%` }}></div>
                                            </div>
                                            <span className="progress-percentage">{course.progress}%</span>
                                        </div>
                                    </div>
                                    <div style={{ color: '#94a3b8' }}>
                                        <div className="sidebar-icon-btn" style={{ padding: '0.5rem', cursor: 'pointer', background: '#f8fafc' }}>
                                            <Play size={18} fill="#3b82f6" color="#3b82f6" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="section-card" style={{ backgroundColor: '#fff7f2', border: '1px solid #ffe4d3' }}>
                        <div className="section-title-modern">
                            <span>Learning Activity</span>
                            <select style={{ background: 'transparent', border: 'none', fontSize: '0.85rem', fontWeight: 600, color: '#fb923c', outline: 'none' }}>
                                <option>Monthly</option>
                                <option>Weekly</option>
                            </select>
                        </div>
                        <div className="activity-chart-placeholder">
                            <div className="chart-bar" style={{ height: '40%' }}></div>
                            <div className="chart-bar" style={{ height: '60%' }}></div>
                            <div className="chart-bar" style={{ height: '80%' }}></div>
                            <div className="chart-bar" style={{ height: '50%' }}></div>
                            <div className="chart-bar" style={{ height: '30%' }}></div>
                            <div className="chart-bar" style={{ height: '70%' }}></div>
                            <div className="chart-bar" style={{ height: '90%' }}></div>
                            <div className="chart-bar" style={{ height: '45%' }}></div>
                            <div className="chart-bar" style={{ height: '55%' }}></div>
                            <div className="chart-bar" style={{ height: '75%' }}></div>
                            <div className="chart-bar" style={{ height: '85%' }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Live Classes & Notifications */}
                <div className="dashboard-right-col">
                    <div className="section-card">
                        <div className="section-title-modern">
                            <span>Upcoming Live Classes</span>
                        </div>
                        {upcomingLive.length > 0 ? upcomingLive.map(session => (
                            <div key={session.id} style={{ marginBottom: '1.25rem', padding: '1rem', borderRadius: '16px', border: '1px solid #f1f5f9', background: '#f8fafc' }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Clock size={14} />
                                    {session.date}, {session.time}
                                </div>
                                <h6 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem', color: '#0f172a' }}>{session.course}</h6>
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>By {session.instructor}</p>
                                <a
                                    href="https://meet.google.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="join-btn"
                                    style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0.625rem', fontSize: '0.85rem' }}
                                >
                                    Join Live Session
                                </a>
                            </div>
                        )) : (
                            <p style={{ fontSize: '0.875rem', color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>No upcoming live sessions. Explore courses.</p>
                        )}
                    </div>

                    <div className="section-card">
                        <div className="section-title-modern">
                            <span>Notifications</span>
                        </div>
                        <div className="notification-list">
                            {notifications.map(notif => (
                                <div key={notif.id} className="notification-item">
                                    <div className="notif-dot-marker"></div>
                                    <div className="notif-text">
                                        <p style={{ color: '#0f172a', fontWeight: 500 }}>{notif.text}</p>
                                        <div className="notif-time">{notif.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link to="#" style={{ display: 'block', textAlign: 'center', fontSize: '0.85rem', color: '#3b82f6', fontWeight: 600, marginTop: '1rem' }}>
                            View Full Inbox
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
