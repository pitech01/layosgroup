import { useState, useEffect } from 'react';
import { Clock, Loader2, Activity, Search } from 'lucide-react';

export default function ActivityLogsDetailed() {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await fetch(`${API_URL}/instructor/activity-logs`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setActivities(data);
                }
            } catch (err) {
                console.error("Failed to fetch activity logs:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [API_URL]);

    const filteredActivities = activities.filter(activity => 
        activity.description.toLowerCase().includes(search.toLowerCase()) || 
        (activity.user?.name && activity.user.name.toLowerCase().includes(search.toLowerCase())) ||
        activity.action.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                <Loader2 className="animate-spin" size={40} color="#1a4d3e" />
                <p style={{ fontWeight: 800, color: '#64748b' }}>Loading Activity Logs...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up" style={{ padding: '0 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 950, color: '#0f172a', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Activity size={28} color="#1a4d3e" /> Thorough Activity Logs
                    </h2>
                    <p style={{ color: '#64748b', margin: 0, fontWeight: 600, fontSize: '1.05rem' }}>
                        Detailed historical tracking of all student engagement and system events.
                    </p>
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: '24px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', outline: 'none', transition: 'border-color 0.2s', background: 'white' }}
                            onFocus={(e) => e.target.style.borderColor = '#1a4d3e'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', background: '#e2e8f0', padding: '6px 14px', borderRadius: '100px' }}>
                        {filteredActivities.length} Records
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'white', borderBottom: '2px solid #f1f5f9' }}>
                                <th style={{ padding: '1.25rem 2rem', fontSize: '0.85rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
                                <th style={{ padding: '1.25rem 2rem', fontSize: '0.85rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action Type</th>
                                <th style={{ padding: '1.25rem 2rem', fontSize: '0.85rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</th>
                                <th style={{ padding: '1.25rem 2rem', fontSize: '0.85rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredActivities.length > 0 ? filteredActivities.map((activity, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s', background: idx % 2 === 0 ? 'white' : '#fcfdfe' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'white' : '#fcfdfe'}>
                                    <td style={{ padding: '1.25rem 2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f0fdf4', color: '#1a4d3e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem' }}>
                                                {activity.user?.name ? activity.user.name.charAt(0) : '-'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{activity.user?.name || 'System / Unassigned'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 2rem' }}>
                                        <span style={{ padding: '6px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'capitalize' }}>
                                            {activity.action.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem 2rem' }}>
                                        <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem', lineHeight: 1.5 }}>
                                            {activity.description}
                                        </div>
                                        {(() => {
                                            if (!activity.metadata) return null;
                                            let parsed = {};
                                            try {
                                                parsed = typeof activity.metadata === 'string' ? JSON.parse(activity.metadata) : activity.metadata;
                                            } catch (e) {
                                                return null;
                                            }
                                            if (Object.keys(parsed).length === 0) return null;
                                            return (
                                                <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    {Object.entries(parsed).map(([key, value]) => (
                                                        <div key={key} style={{ display: 'flex' }}>
                                                            <span style={{ fontWeight: 800, minWidth: '80px', textTransform: 'capitalize' }}>{key.replace('_', ' ')}:</span>
                                                            <span style={{ fontFamily: 'monospace', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: '#0f172a' }}>{String(value)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    <td style={{ padding: '1.25rem 2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
                                            <Clock size={14} /> 
                                            {new Date(activity.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>
                                        No matching activity logs found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
