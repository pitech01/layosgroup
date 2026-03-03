import {
    Plus,
    Users,
    BookOpen,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function InstructorDashboard() {
    const quickStats = [
        { label: 'Shells Deployed', value: '6', trend: '+2', isUp: true, icon: BookOpen, color: '#1a4d3e' },
        { label: 'Total Capacity', value: '2,500', trend: '+12.5%', isUp: true, icon: Users, color: '#1a4d3e' },
    ];

    const activities = [
        { id: 1, user: 'Alex Johnson', action: 'enrolled in', target: 'Full-Stack Jan 2026', time: '2 mins ago', type: 'enroll' },
        { id: 2, user: 'Maria Garcia', action: 'completed assessment in', target: 'UI/UX March Batch', time: '15 mins ago', type: 'complete' },
        { id: 3, user: 'David Smith', action: 'posted in cohort Q&A', target: 'Backend Pro', time: '1 hour ago', type: 'comment' },
    ];

    return (
        <div className="instructor-dashboard">
            <style>{`
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 3rem;
                }
                
                .section-header h2 {
                    font-size: 1.75rem;
                    font-weight: 900;
                    color: #0f172a;
                    margin: 0;
                    letter-spacing: -0.02em;
                }

                .stats-grid-dashboard {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                    margin-bottom: 3.5rem;
                }

                .stat-card-premium {
                    background: white;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    border-radius: 24px;
                    padding: 2rem;
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.02), 0 4px 6px -4px rgba(0,0,0,0.02);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .stat-card-premium:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05);
                    border-color: #1a4d3e30;
                }

                .dashboard-content-grid {
                    display: grid;
                    grid-template-columns: 1.6fr 1fr;
                    gap: 2rem;
                }

                @media (max-width: 1024px) {
                    .dashboard-content-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .activity-item {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    padding: 1.25rem;
                    border-radius: 16px;
                    transition: all 0.2s;
                    border: 1px solid transparent;
                }

                .activity-item:hover {
                    background: #f8fafc;
                    border-color: #f1f5f9;
                }

                .user-avatar-mini {
                    width: 48px;
                    height: 48px;
                    border-radius: 14px;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    color: #1a4d3e;
                    font-size: 1.1rem;
                }
                
                .glass-panel-premium {
                    background: white;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    border-radius: 32px;
                    padding: 2.5rem;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
                }
                
                .btn-standard {
                    height: 52px;
                    padding: 0 2rem;
                    border-radius: 16px;
                    font-size: 0.95rem;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    border: none;
                    color: white;
                    text-decoration: none;
                }
            `}</style>

            <div className="section-header">
                <div>
                    <h2>Dashboard</h2>
                    <p style={{ color: '#64748b', margin: '0.4rem 0 0 0', fontWeight: 600, fontSize: '1rem' }}>Overview of your performance and active cohorts.</p>
                </div>
                <Link
                    to="/instructor/cohorts/create"
                    className="btn-standard"
                    style={{ background: '#1a4d3e', boxShadow: '0 10px 15px -3px rgba(26, 77, 62, 0.2)' }}
                >
                    <Plus size={20} /> Create New Cohort
                </Link>
            </div>

            <div className="stats-grid-dashboard">
                {quickStats.map((stat, i) => (
                    <div key={i} className="stat-card-premium">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '14px',
                                background: '#f0fdf4',
                                color: '#1a4d3e',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <stat.icon size={28} />
                            </div>
                            <div style={{
                                background: stat.isUp ? '#f0fdf4' : '#fef2f2',
                                color: stat.isUp ? '#16a34a' : '#dc2626',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stat.trend}
                            </div>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                        <h3 style={{ fontSize: '2.25rem', fontWeight: 950, margin: 0, color: '#0f172a', letterSpacing: '-0.03em' }}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="dashboard-content-grid">
                <div className="glass-panel-premium">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>Cohort Engagement</h3>
                        <button style={{ background: 'transparent', border: 'none', color: '#1a4d3e', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer' }}>View Live Stream</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {activities.map(activity => (
                            <div key={activity.id} className="activity-item">
                                <div className="user-avatar-mini">{activity.user.charAt(0)}</div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: '1rem', color: '#1e293b', fontWeight: 500 }}>
                                        <span style={{ fontWeight: 800, color: '#0f172a' }}>{activity.user}</span> {activity.action} <span style={{ fontWeight: 800, color: '#1a4d3e' }}>{activity.target}</span>
                                    </p>
                                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontWeight: 600 }}>
                                        <Clock size={14} /> {activity.time}
                                    </span>
                                </div>
                                <button style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '8px' }}>
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel-premium">
                    <h3 style={{ margin: '0 0 2rem 0', fontSize: '1.25rem', fontWeight: 900 }}>Network Performance</h3>
                    <div style={{ padding: '1rem 0', textAlign: 'center' }}>
                        <div style={{ width: '160px', height: '160px', borderRadius: '50%', border: '12px solid #f8fafc', borderTopColor: '#1a4d3e', margin: '0 auto 2.5rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', boxShadow: '0 0 20px rgba(26, 77, 62, 0.05)' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.02em' }}>85%</span>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Batch Cap</span>
                        </div>
                        <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.6, fontWeight: 600 }}>
                            Cohort retention is <span style={{ color: '#16a34a', fontWeight: 800 }}>+12%</span> against last quarter.
                        </p>
                        <button className="btn-standard" style={{ width: '100%', marginTop: '2.5rem', background: '#f8fafc', border: '1.5px solid #e2e8f0', color: '#1e293b', fontWeight: 900 }}>
                            Full Analytics Suite
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
