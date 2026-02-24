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
        { label: 'Total Students', value: '1,284', trend: '+12.5%', isUp: true, icon: Users, color: '#2563eb' },
        { label: 'Active Courses', value: '6', trend: '+2', isUp: true, icon: BookOpen, color: '#10b981' },
    ];

    const activities = [
        { id: 1, user: 'Alex Johnson', action: 'enrolled in', target: 'Advanced React', time: '2 mins ago', type: 'enroll' },
        { id: 2, user: 'Maria Garcia', action: 'completed', target: 'UI Design Basics', time: '15 mins ago', type: 'complete' },
        { id: 3, user: 'David Smith', action: 'posted a question in', target: 'Live Q&A', time: '1 hour ago', type: 'comment' },
    ];

    return (
        <div className="instructor-dashboard">
            <style>{`
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                
                .section-header h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                }

                .stats-grid-dashboard {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2.5rem;
                }

                .stat-card-standard {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }

                .dashboard-content-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 1.5rem;
                }

                @media (max-width: 1024px) {
                    .dashboard-content-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .activity-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    border-bottom: 1px solid #f1f5f9;
                }

                .activity-item:last-child {
                    border-bottom: none;
                }

                .user-avatar-mini {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    color: #64748b;
                }
            `}</style>

            <div className="section-header">
                <div>
                    <h2>Dashboard Summary</h2>
                    <p style={{ color: '#64748b', margin: '0.25rem 0 0 0' }}>Welcome back, here's strictly what's happening today.</p>
                </div>
                <Link
                    to="/instructor/courses/create"
                    className="btn-standard"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', background: '#020617' }}
                >
                    <Plus size={18} /> New Course
                </Link>
            </div>

            <div className="stats-grid-dashboard">
                {quickStats.map((stat, i) => (
                    <div key={i} className="stat-card-standard">
                        <div className="flex justify-between items-start mb-4">
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: `${stat.color}10`,
                                color: stat.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <stat.icon size={24} />
                            </div>
                            <div className="flex items-center gap-1" style={{
                                background: stat.isUp ? '#f0fdf4' : '#fef2f2',
                                color: stat.isUp ? '#16a34a' : '#dc2626',
                                padding: '0.25rem 0.6rem',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: 600
                            }}>
                                {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stat.trend}
                            </div>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500, margin: '0 0 0.5rem 0' }}>{stat.label}</p>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="dashboard-content-grid">
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Recent Activities</h3>
                        <button style={{ background: 'none', border: 'none', color: '#020617', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>View all</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {activities.map(activity => (
                            <div key={activity.id} className="activity-item">
                                <div className="user-avatar-mini">{activity.user.charAt(0)}</div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: '0.925rem', color: '#1e293b' }}>
                                        <span style={{ fontWeight: 600 }}>{activity.user}</span> {activity.action} <span style={{ fontWeight: 600 }}>{activity.target}</span>
                                    </p>
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                        <Clock size={12} /> {activity.time}
                                    </span>
                                </div>
                                <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem' }}>Overall Performance</h3>
                    <div style={{ padding: '2rem 0', textAlign: 'center' }}>
                        {/* Simplified Chart Placeholder */}
                        <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '8px solid #f1f5f9', borderTopColor: '#020617', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>85%</span>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Capacity</span>
                        </div>
                        <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>Your course engagement is up 12% this week.</p>
                        <button className="btn-standard" style={{ width: '100%', marginTop: '1.5rem', background: 'transparent', border: '1px solid #e2e8f0', color: '#1e293b' }}>Analytics Detail</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
