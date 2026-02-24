import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Plus,
    Calendar,
    Clock,
    Video,
    Play,
    AlertCircle,
    Inbox,
    CheckCircle2
} from 'lucide-react';

interface LiveSession {
    id: string;
    title: string;
    courseId: string;
    courseTitle: string;
    scheduledDate: string; // ISO date
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    meetingLink: string;
    status: "upcoming" | "live" | "ended";
}

const INITIAL_SESSIONS: LiveSession[] = [
    {
        id: '1',
        title: 'Advanced React Hooks Workshop',
        courseId: 'c1',
        courseTitle: 'Professional React Development',
        scheduledDate: '2026-02-24T14:30:00Z',
        startTime: '14:30',
        endTime: '15:30',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        status: 'upcoming'
    },
    {
        id: '2',
        title: 'Project Setup & Architecture',
        courseId: 'c2',
        courseTitle: 'Fullstack Web Mastery',
        scheduledDate: '2026-02-24T12:00:00Z',
        startTime: '12:00',
        endTime: '13:30',
        meetingLink: 'https://meet.google.com/xyz-pqrs-tuv',
        status: 'live'
    }
];

export default function LiveClass() {
    const navigate = useNavigate();
    const location = useLocation();
    const [sessions] = useState<LiveSession[]>(INITIAL_SESSIONS);
    const [filter, setFilter] = useState<"all" | "upcoming" | "live" | "ended">("all");
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    // Show success toast if redirected from creation page
    useEffect(() => {
        if (location.state?.success) {
            setShowSuccessToast(true);
            const timer = setTimeout(() => {
                setShowSuccessToast(false);
                // Clear state to avoid toast on refresh
                window.history.replaceState({}, document.title);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [location]);

    // Update time every minute to refresh status logic
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    const filteredSessions = sessions.filter(session => {
        if (filter === "all") return true;
        return session.status === filter;
    });

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'live':
                return { bg: '#ecfdf5', color: '#10b981', label: 'LIVE NOW' };
            case 'upcoming':
                return { bg: '#eff6ff', color: '#3b82f6', label: 'UPCOMING' };
            case 'ended':
                return { bg: '#f1f5f9', color: '#64748b', label: 'ENDED' };
            default:
                return { bg: '#f1f5f9', color: '#64748b', label: status.toUpperCase() };
        }
    };

    const handleGoLive = (link: string) => {
        if (link) {
            window.open(link, '_blank');
        }
    };

    return (
        <div className="animate-fade-in-up">
            <style>{`
                .live-header-section {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 3rem;
                    gap: 2rem;
                    flex-wrap: wrap;
                }

                .filter-tabs {
                    display: flex;
                    gap: 0.5rem;
                    background: #f1f5f9;
                    padding: 0.4rem;
                    border-radius: 14px;
                    width: fit-content;
                }

                .filter-btn {
                    padding: 0.6rem 1.25rem;
                    border: none;
                    background: transparent;
                    color: #64748b;
                    font-weight: 700;
                    font-size: 0.85rem;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .filter-btn.active {
                    background: white;
                    color: #020617;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                .sessions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
                    gap: 1.5rem;
                }

                .live-session-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 20px;
                    padding: 1.75rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                }

                .live-session-card:hover {
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
                    border-color: #cbd5e1;
                    transform: translateY(-4px);
                }

                .session-status-badge {
                    padding: 0.4rem 0.75rem;
                    border-radius: 8px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                    width: fit-content;
                    margin-bottom: 1.25rem;
                }

                .success-toast {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    background: #10b981;
                    color: white;
                    padding: 1rem 1.5rem;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    z-index: 3000;
                    animation: slideUp 0.3s ease-out;
                }

                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .btn-go-live {
                    width: 100%;
                    height: 52px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    background: #020617;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-go-live:hover:not(:disabled) {
                    background: #0f172a;
                    box-shadow: 0 10px 15px -3px rgba(2, 6, 23, 0.2);
                }

                .btn-go-live:disabled {
                    background: #f1f5f9;
                    color: #94a3b8;
                    cursor: not-allowed;
                }

                .warning-badge {
                    background: #fff7ed;
                    color: #c2410c;
                    padding: 0.75rem;
                    border-radius: 10px;
                    font-size: 0.8rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    border: 1px solid #ffedd5;
                }

                .empty-state-container {
                    padding: 8rem 2rem;
                    text-align: center;
                    background: white;
                    border: 2px dashed #e2e8f0;
                    border-radius: 32px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                @media (max-width: 640px) {
                    .sessions-grid {
                        grid-template-columns: 1fr;
                    }
                    .live-header-section {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                }
            `}</style>

            <div className="live-header-section">
                <div>
                    <h1 className="dashboard-header-title" style={{ marginBottom: '0.5rem' }}>Live Sessions</h1>
                    <p style={{ color: '#64748b', fontSize: '1rem' }}>Manage and host your upcoming live classes.</p>
                </div>

                <button
                    className="btn-standard"
                    style={{ background: '#020617', padding: '0.85rem 1.75rem', borderRadius: '12px' }}
                    onClick={() => navigate('/instructor/live/create')}
                >
                    <Plus size={20} /> Schedule Session
                </button>
            </div>

            <div className="filter-tabs" style={{ marginBottom: '2rem' }}>
                {(['all', 'upcoming', 'live', 'ended'] as const).map(f => (
                    <button
                        key={f}
                        className={`filter-btn ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {filteredSessions.length > 0 ? (
                <div className="sessions-grid">
                    {filteredSessions.map(session => {
                        const style = getStatusStyles(session.status);
                        const hasLink = !!session.meetingLink;

                        const scheduledTime = new Date(session.scheduledDate);
                        const isTimeToGoLive = currentTime >= scheduledTime;
                        const isUpcoming = session.status === 'upcoming';
                        const isEnded = session.status === 'ended';

                        return (
                            <div key={session.id} className="live-session-card">
                                <div className="session-status-badge" style={{ background: style.bg, color: style.color }}>
                                    {style.label}
                                </div>

                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>{session.title}</h3>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                    <Video size={16} />
                                    <span>{session.courseTitle}</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                    <Calendar size={16} />
                                    <span>{new Date(session.scheduledDate).toLocaleDateString()}</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                    <Clock size={16} />
                                    <span>{session.startTime} - {session.endTime}</span>
                                </div>

                                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                                    {!hasLink && !isEnded && (
                                        <div className="warning-badge" style={{ marginBottom: '1rem' }}>
                                            <AlertCircle size={16} /> No meeting link added
                                        </div>
                                    )}

                                    {isEnded ? (
                                        <button className="btn-go-live" disabled>Session Ended</button>
                                    ) : (
                                        <button
                                            className="btn-go-live"
                                            disabled={!hasLink || (isUpcoming && !isTimeToGoLive)}
                                            onClick={() => handleGoLive(session.meetingLink)}
                                        >
                                            {isUpcoming && !isTimeToGoLive ? `Starts at ${session.startTime}` : <><Play size={18} fill="currentColor" /> Go Live</>}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-state-container">
                    <div style={{ padding: '2.5rem', background: '#f8fafc', borderRadius: '40px', marginBottom: '2rem' }}>
                        <Inbox size={64} color="#cbd5e1" strokeWidth={1.5} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>
                        No live sessions scheduled
                    </h2>
                    <p style={{ color: '#64748b', maxWidth: '300px', margin: '0 0 2rem 0' }}>When you schedule sessions, they will appear here for management.</p>
                    <button className="btn-standard" style={{ background: '#020617' }} onClick={() => navigate('/instructor/live/create')}>Schedule Your First Live Session</button>
                </div>
            )}

            {showSuccessToast && (
                <div className="success-toast">
                    <CheckCircle2 size={20} />
                    <span>Live session created successfully</span>
                </div>
            )}
        </div>
    );
}
