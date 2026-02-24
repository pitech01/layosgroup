import { Calendar, Clock, Video, User } from 'lucide-react';

const UPCOMING_SESSIONS = [
    {
        id: 1,
        courseName: 'Advanced React Development',
        topic: 'Live Q&A: State Management Patterns',
        instructor: 'Sarah Wilson',
        date: 'Today',
        time: '15:00 - 16:30',
        status: 'Upcoming',
        meetLink: 'https://meet.google.com/abc-defg-hij'
    },
    {
        id: 2,
        courseName: 'UI/UX Design Masterclass',
        topic: 'Design Review & Feedback',
        instructor: 'Michael Chen',
        date: 'Tomorrow',
        time: '10:00 - 11:30',
        status: 'Scheduled',
        meetLink: '#'
    }
];

const PAST_SESSIONS = [
    {
        id: 101,
        courseName: 'Advanced React Development',
        topic: 'Introduction to Next.js',
        date: 'Feb 10, 2024',
        duration: '1h 30m',
        recordingUrl: '#'
    },
    {
        id: 102,
        courseName: 'Full Stack Web Development',
        topic: 'API Security Best Practices',
        date: 'Feb 08, 2024',
        duration: '1h 15m',
        recordingUrl: '#'
    }
];

const Live = () => {
    return (
        <div className="animate-fade-in-up">
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Live Sessions</h1>
                <p style={{ color: '#64748b' }}>Join upcoming classes or watch recorded sessions.</p>
            </div>

            {/* Upcoming Sessions */}
            <section style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <span style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 0 4px rgba(239, 68, 68, 0.2)' }}></span>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Upcoming & Live</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {UPCOMING_SESSIONS.map((session) => (
                        <div key={session.id} className="section-card" style={{ position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05, transform: 'rotate(15deg)' }}>
                                <Video size={120} />
                            </div>

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <span style={{ padding: '0.25rem 0.75rem', background: '#eff6ff', color: '#3b82f6', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #dbeafe' }}>
                                        {session.courseName}
                                    </span>
                                    {session.date === 'Today' && (
                                        <span className="live-badge">LIVE SOON</span>
                                    )}
                                </div>

                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', lineHeight: 1.4 }}>{session.topic}</h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', fontSize: '0.9rem' }}>
                                        <User size={16} />
                                        <span>{session.instructor}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', fontSize: '0.9rem' }}>
                                        <Calendar size={16} />
                                        <span>{session.date} &bull; {session.time}</span>
                                    </div>
                                </div>

                                <a
                                    href={session.meetLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="join-btn"
                                    style={{ display: 'block', textAlign: 'center', background: '#3b82f6', padding: '0.75rem' }}
                                >
                                    Join Live Class
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Past Sessions */}
            <section>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>Past Sessions</h2>
                <div className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
                    {PAST_SESSIONS.map((session, idx) => (
                        <div key={session.id} style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx !== PAST_SESSIONS.length - 1 ? '1px solid #f1f5f9' : 'none', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>{session.topic}</h4>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>{session.courseName}</p>
                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Calendar size={14} /> {session.date}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Clock size={14} /> {session.duration}
                                    </span>
                                </div>
                            </div>
                            <button className="btn-cta-white" style={{ border: '1px solid #e2e8f0', fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                                Watch Recording
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Live;
