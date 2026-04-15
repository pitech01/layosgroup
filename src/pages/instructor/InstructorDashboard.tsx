import { useState, useEffect } from 'react';
import {
    Plus,
    Users,
    BookOpen,
    Clock,
    ArrowUpRight,
    Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function InstructorDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const headers = {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                };
                
                const [statsRes, activitiesRes] = await Promise.all([
                    fetch(`${API_URL}/instructor/dashboard-stats`, { headers }),
                    fetch(`${API_URL}/instructor/activity-logs`, { headers })
                ]);
                
                if (statsRes.ok) {
                    const data = await statsRes.json();
                    setStats(data.stats);
                }
                
                if (activitiesRes.ok) {
                    const logs = await activitiesRes.json();
                    setActivities(logs);
                }
            } catch (err) {
                console.error("Fetch Dashboard Stats Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [API_URL]);

    if (loading) {
        return (
            <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                <Loader2 className="animate-spin" size={40} color="#1a4d3e" />
                <p style={{ fontWeight: 800, color: '#64748b' }}>Loading Analytics...</p>
            </div>
        );
    }

    const quickStats = [
        { label: 'Active Cohorts', value: stats?.active_cohorts || '0', trend: 'Live', isUp: true, icon: BookOpen, color: '#1a4d3e' },
        { label: 'Enrolled Students', value: stats?.total_students?.toLocaleString() || '0', trend: 'Total', isUp: true, icon: Users, color: '#1a4d3e' },
    ];

    return (
        <div className="instructor-dashboard animate-fade-in-up">
            <style>{`
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 3rem;
                    gap: 1.5rem;
                }
                
                .section-header h2 {
                    font-size: 1.75rem;
                    font-weight: 950;
                    color: #0f172a;
                    margin: 0;
                    letter-spacing: -0.02em;
                }

                .stats-grid-dashboard {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 3.5rem;
                }

                .stat-card-premium {
                    background: white;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    border-radius: 24px;
                    padding: 2rem;
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.02);
                    transition: all 0.3s;
                }
                
                .stat-card-premium:hover {
                    transform: translateY(-4px);
                    border-color: #1a4d3e30;
                }

                .dashboard-content-grid {
                    display: grid;
                    grid-template-columns: 1.6fr 1fr;
                    gap: 2rem;
                }

                .activity-item {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    padding: 1.25rem;
                    border-radius: 20px;
                    transition: all 0.2s;
                    border: 1px solid transparent;
                }

                .activity-item:hover {
                    background: #f8fafc;
                    border-color: #f1f5f9;
                }

                .user-avatar-mini {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 900;
                    color: #1a4d3e;
                    flex-shrink: 0;
                }
                
                .glass-panel-premium {
                    background: white;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    border-radius: 32px;
                    padding: 2.5rem;
                }
                
                .btn-standard {
                    height: 52px;
                    padding: 0 2rem;
                    border-radius: 16px;
                    font-weight: 850;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.3s;
                    cursor: pointer;
                    border: none;
                    color: white;
                    text-decoration: none;
                    font-size: 0.95rem;
                    white-space: nowrap;
                }

                @media (max-width: 1024px) {
                    .dashboard-content-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .section-header {
                        flex-direction: column;
                        align-items: flex-start;
                        margin-bottom: 2.5rem;
                    }
                    
                    .section-header h2 {
                        font-size: 1.5rem;
                    }

                    .section-header p {
                        font-size: 1rem !important;
                    }

                    .btn-standard {
                        width: 100%;
                        height: 48px;
                    }

                    .stats-grid-dashboard {
                        grid-template-columns: 1fr;
                        margin-bottom: 2.5rem;
                    }

                    .stat-card-premium {
                        padding: 1.5rem;
                    }

                    .stat-card-premium h3 {
                        font-size: 2rem !important;
                    }

                    .glass-panel-premium {
                        padding: 1.5rem;
                        border-radius: 24px;
                    }
                }

                @media (max-width: 480px) {
                    .activity-item {
                        padding: 1rem 0.5rem;
                        gap: 1rem;
                    }
                    
                    .user-avatar-mini {
                        width: 38px;
                        height: 38px;
                        font-size: 0.9rem;
                    }

                    .activity-item p {
                        font-size: 0.85rem !important;
                    }
                }
            `}</style>

            <div className="section-header">
                <div>
                    <h2>Instructor Dashboard</h2>
                    <p style={{ color: '#64748b', margin: '0.5rem 0 0 0', fontWeight: 600, fontSize: '1.1rem' }}>
                        Overview of active academic operations and student progress.
                    </p>
                </div>
                <Link
                    to="/instructor/cohorts/create"
                    className="btn-standard"
                    style={{ background: '#1a4d3e', boxShadow: '0 10px 15px rgba(26, 77, 62, 0.15)' }}
                >
                    <Plus size={20} /> Create Cohort
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
                                background: '#f0fdf4',
                                color: '#16a34a',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <ArrowUpRight size={14} />
                                {stat.trend}
                            </div>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 800, margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                        <h3 style={{ fontSize: '2.5rem', fontWeight: 950, margin: 0, color: '#0f172a', letterSpacing: '-0.04em' }}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="dashboard-content-grid">
                <div className="glass-panel-premium">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 950, color: '#0f172a' }}>Recent Activity</h3>
                        <Link to="/instructor/activity-logs" style={{ color: '#1a4d3e', fontWeight: 850, fontSize: '0.9rem', textDecoration: 'none' }}>View All Logs</Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflowY: 'auto', paddingRight: '12px' }}>
                        {activities.length > 0 ? activities.map((activity, idx) => {
                            const name = activity.user?.name || 'A student';
                            const initial = name.charAt(0);
                            return (
                                <div key={idx} className="activity-item">
                                    <div className="user-avatar-mini">{initial}</div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b', fontWeight: 600, lineHeight: 1.5 }}>
                                            {activity.description}
                                        </p>
                                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontWeight: 700 }}>
                                            <Clock size={12} /> {new Date(activity.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>
                                No recent activity recorded.
                            </div>
                        )}
                    </div>
                </div>

                <div className="glass-panel-premium">
                    <h3 style={{ margin: '0 0 2rem 0', fontSize: '1.25rem', fontWeight: 950, color: '#0f172a' }}>Performance Overview</h3>
                    <div style={{ padding: '1rem 0', textAlign: 'center' }}>
                        <div style={{
                            width: '160px',
                            height: '160px',
                            borderRadius: '50%',
                            border: '12px solid #f8fafc',
                            borderTopColor: '#1a4d3e',
                            margin: '0 auto 2.5rem auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column'
                        }}>
                            <span style={{ fontSize: '2.5rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.04em' }}>{stats?.completion_rate || 0}%</span>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 900, textTransform: 'uppercase' }}>Completion</span>
                        </div>
                        <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.6, fontWeight: 600, margin: 0 }}>
                            Global curriculum engagement across all active instructor modules.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
