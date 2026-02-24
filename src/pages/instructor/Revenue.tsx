import {
    Download,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    Calendar,
    Search
} from 'lucide-react';

export default function Revenue() {
    const revenueStats = [
        { label: 'Total Revenue', value: '$45,285.40', trend: '+15.4%', isUp: true, icon: DollarSign, color: '#10b981' },
        { label: 'This Month', value: '$8,240.00', trend: '+5.2%', isUp: true, icon: Calendar, color: '#3b82f6' },
        { label: 'Avg. per Course', value: '$7,547.00', trend: '-1.2%', isUp: false, icon: TrendingUp, color: '#8b5cf6' },
    ];

    const transactions = [
        { id: 1, course: 'Frontend Development Bootcamp', amount: '$199.00', date: '2024-02-20', status: 'Completed', student: 'Alex Johnson' },
        { id: 2, course: 'Advanced React Architecture', amount: '$150.00', date: '2024-02-19', status: 'Pending', student: 'Maria Garcia' },
        { id: 3, course: 'UI Design Principles', amount: '$99.00', date: '2024-02-18', status: 'Completed', student: 'David Smith' },
    ];

    return (
        <div className="instructor-revenue">
            <style>{`
                .rev-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2.5rem;
                }

                .rev-header h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                }

                .rev-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2.5rem;
                }

                .filter-bar-rev {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .badge-status {
                    padding: 0.35rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .status-completed { background: #f0fdf4; color: #16a34a; }
                .status-pending { background: #fffbeb; color: #d97706; }
            `}</style>

            <div className="rev-header">
                <div>
                    <h2>Revenue Overview</h2>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Track your earnings and payouts automatically.</p>
                </div>
                <button className="btn-standard" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#020617' }}>
                    <Download size={18} /> Export Earnings
                </button>
            </div>

            <div className="rev-stats-grid">
                {revenueStats.map((stat, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '1.75rem' }}>
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
                            <div style={{
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
                        <h3 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div className="filter-bar-rev">
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Transaction History</h3>
                    <div className="flex gap-4">
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input type="text" placeholder="Search transactions..." style={{ padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', width: '220px' }} />
                        </div>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>
                                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Course</th>
                                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Amount</th>
                                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Date</th>
                                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Student</th>
                                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(t => (
                                <tr key={t.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                    <td style={{ padding: '1.25rem 1rem', fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>{t.course}</td>
                                    <td style={{ padding: '1.25rem 1rem', fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{t.amount}</td>
                                    <td style={{ padding: '1.25rem 1rem', fontSize: '0.9rem', color: '#64748b' }}>{t.date}</td>
                                    <td style={{ padding: '1.25rem 1rem', fontSize: '0.9rem', color: '#64748b' }}>{t.student}</td>
                                    <td style={{ padding: '1.25rem 1rem' }}>
                                        <span className={`badge-status status-${t.status.toLowerCase()}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
