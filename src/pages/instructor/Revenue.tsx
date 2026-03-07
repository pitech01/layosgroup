import {
    Download,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    Calendar,
    Search,
    Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Revenue() {
    const [stats, setStats] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const fetchRevenueData = async () => {
            try {
                const response = await fetch(`${API_URL}/instructor/revenue-stats`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setStats(data);
                    setTransactions(data.transactions);
                }
            } catch (err) {
                console.error("Fetch Revenue Stats Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRevenueData();
    }, []);

    if (loading) {
        return (
            <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                <Loader2 className="animate-spin" size={40} color="#1a4d3e" />
                <p style={{ fontWeight: 800, color: '#64748b' }}>Calculating Earnings Data...</p>
            </div>
        );
    }

    const revenueStats = [
        { label: 'Total Revenue', value: stats?.total_revenue || '$0.00', trend: '+15.4%', isUp: true, icon: DollarSign, color: '#10b981' },
        { label: 'This Month', value: stats?.this_month || '$0.00', trend: '+5.2%', isUp: true, icon: Calendar, color: '#3b82f6' },
        { label: 'Avg. per Cohort', value: stats?.avg_per_course || '$0.00', trend: '-1.2%', isUp: false, icon: TrendingUp, color: '#8b5cf6' },
    ];

    const filteredTransactions = transactions.filter(t =>
        t.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.course.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="instructor-revenue animate-fade-in-up">
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
                .status-partial { background: #fffbeb; color: #d97706; }
                
                .glass-panel-rev {
                    background: white;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    border-radius: 20px;
                    padding: 1.75rem;
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

            <div className="rev-header">
                <div>
                    <h2>Revenue Overview</h2>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Track your earnings and student enrollment fees.</p>
                </div>
                <button className="btn-standard" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#020617' }}>
                    <Download size={18} /> Export Earnings
                </button>
            </div>

            <div className="rev-stats-grid">
                {revenueStats.map((stat, i) => (
                    <div key={i} className="glass-panel-rev">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
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
                                fontWeight: 700
                            }}>
                                {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stat.trend}
                            </div>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 700, margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>{stat.label}</p>
                        <h3 style={{ fontSize: '2rem', fontWeight: 950, margin: 0, color: '#0f172a' }}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="glass-panel-rev" style={{ padding: '2rem' }}>
                <div className="filter-bar-rev">
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Transaction History</h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                placeholder="Search student or cohort..."
                                style={{ padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', fontSize: '0.9rem', width: '280px', outline: 'none' }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>
                                <th style={{ padding: '1.25rem 1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>Course / Cohort</th>
                                <th style={{ padding: '1.25rem 1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>Amount</th>
                                <th style={{ padding: '1.25rem 1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>Date</th>
                                <th style={{ padding: '1.25rem 1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>Student</th>
                                <th style={{ padding: '1.25rem 1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((t, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #f8fafc' }}>
                                    <td style={{ padding: '1.5rem 1rem', fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>{t.course}</td>
                                    <td style={{ padding: '1.5rem 1rem', fontWeight: 900, fontSize: '0.95rem', color: '#1a4d3e' }}>{t.amount}</td>
                                    <td style={{ padding: '1.5rem 1rem', fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>{new Date(t.date).toLocaleDateString()}</td>
                                    <td style={{ padding: '1.5rem 1rem', fontSize: '0.9rem', color: '#1e293b', fontWeight: 700 }}>{t.student}</td>
                                    <td style={{ padding: '1.5rem 1rem' }}>
                                        <span className={`badge-status status-${t.status.toLowerCase()}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredTransactions.length === 0 && (
                        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>
                            No transaction records found matching your criteria.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
