import { useState, useEffect } from 'react';
import { Clock, Loader2, Activity, Search } from 'lucide-react';

export default function ActivityLogsDetailed() {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

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

    useEffect(() => {
        setCurrentPage(1);
    }, [filteredActivities.length]);

    const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage);

    if (loading) {
        return (
            <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                <Loader2 className="animate-spin" size={40} color="var(--index-primary-color)" />
                <p style={{ fontWeight: 800, color: 'var(--index-text-secondary)' }}>Loading Activity Logs...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up" style={{ padding: '0 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 950, color: 'var(--index-text-heading)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Activity size={28} color="var(--index-primary-color)" /> Thorough Activity Logs
                    </h2>
                    <p style={{ color: 'var(--index-text-secondary)', margin: 0, fontWeight: 600, fontSize: '1.05rem' }}>
                        Detailed historical tracking of all student engagement and system events.
                    </p>
                </div>
            </div>

            <div style={{ background: 'var(--index-card-bg)', borderRadius: '24px', border: '1px solid color-mix(in srgb, var(--index-border-color) 80%, transparent)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--index-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--index-hover-bg)' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} color="var(--index-text-faint)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '12px', border: '1.5px solid var(--index-border-color)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--index-text-heading)', outline: 'none', transition: 'border-color 0.2s', background: 'var(--index-card-bg)' }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--index-primary-color)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--index-border-color)'}
                        />
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--index-text-secondary)', background: 'var(--index-border-color)', padding: '6px 14px', borderRadius: '100px' }}>
                        {filteredActivities.length} Records
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'var(--index-card-bg)', borderBottom: '2px solid var(--index-border-subtle)' }}>
                                <th style={{ padding: '1.25rem 2rem', fontSize: '0.85rem', fontWeight: 800, color: 'var(--index-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
                                <th style={{ padding: '1.25rem 2rem', fontSize: '0.85rem', fontWeight: 800, color: 'var(--index-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action Type</th>
                                <th style={{ padding: '1.25rem 2rem', fontSize: '0.85rem', fontWeight: 800, color: 'var(--index-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</th>
                                <th style={{ padding: '1.25rem 2rem', fontSize: '0.85rem', fontWeight: 800, color: 'var(--index-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedActivities.length > 0 ? paginatedActivities.map((activity, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid var(--index-border-subtle)', transition: 'background 0.2s', background: idx % 2 === 0 ? 'var(--index-card-bg)' : 'var(--index-hover-bg)' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--index-hover-bg)'} onMouseOut={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'var(--index-card-bg)' : 'var(--index-hover-bg)'}>
                                    <td style={{ padding: '1.25rem 2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'color-mix(in srgb, var(--lgl-success) 12%, transparent)', color: 'var(--index-primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem' }}>
                                                {activity.user?.name ? activity.user.name.charAt(0) : '-'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, color: 'var(--index-text-heading)', fontSize: '0.95rem' }}>{activity.user?.name || 'System / Unassigned'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 2rem' }}>
                                        <span style={{ padding: '6px 12px', background: 'var(--index-hover-bg)', color: 'var(--index-text-secondary)', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'capitalize' }}>
                                            {activity.action.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem 2rem' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--index-text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
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
                                                <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--index-hover-bg)', borderRadius: '8px', border: '1px solid var(--index-border-color)', fontSize: '0.8rem', color: 'var(--index-text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    {Object.entries(parsed).map(([key, value]) => (
                                                        <div key={key} style={{ display: 'flex' }}>
                                                            <span style={{ fontWeight: 800, minWidth: '80px', textTransform: 'capitalize' }}>{key.replace('_', ' ')}:</span>
                                                            <span style={{ fontFamily: 'monospace', background: 'var(--index-border-color)', padding: '2px 6px', borderRadius: '4px', color: 'var(--index-text-heading)' }}>{String(value)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    <td style={{ padding: '1.25rem 2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--index-text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
                                            <Clock size={14} /> 
                                            {new Date(activity.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--index-text-faint)', fontWeight: 600 }}>
                                        No matching activity logs found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.5rem 2rem',
                    borderTop: '1px solid var(--index-border-subtle)',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    background: 'var(--index-hover-bg)'
                }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--index-text-secondary)', fontWeight: 600 }}>
                        Showing <span style={{ fontWeight: 800, color: 'var(--index-text-heading)' }}>{filteredActivities.length > 0 ? startIndex + 1 : 0}</span> to <span style={{ fontWeight: 800, color: 'var(--index-text-heading)' }}>{Math.min(startIndex + itemsPerPage, filteredActivities.length)}</span> of <span style={{ fontWeight: 800, color: 'var(--index-text-heading)' }}>{filteredActivities.length}</span> records
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            style={{
                                padding: '0.5rem 0.85rem',
                                borderRadius: '8px',
                                border: '1.5px solid var(--index-border-color)',
                                background: 'var(--index-card-bg)',
                                color: currentPage === 1 ? 'var(--index-text-faint)' : 'var(--index-text-secondary)',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Previous
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                            const isClose = Math.abs(pageNum - currentPage) <= 1;
                            const isEnd = pageNum === 1 || pageNum === totalPages;
                            if (!isClose && !isEnd) {
                                if (pageNum === 2 || pageNum === totalPages - 1) {
                                    return <span key={pageNum} style={{ padding: '0 0.5rem', color: 'var(--index-text-faint)' }}>...</span>;
                                }
                                return null;
                            }
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    style={{
                                        padding: '0.5rem 0.85rem',
                                        borderRadius: '8px',
                                        border: '1.5px solid',
                                        borderColor: currentPage === pageNum ? 'var(--index-primary-color)' : 'var(--index-border-color)',
                                        background: currentPage === pageNum ? 'var(--index-primary-color)' : 'var(--index-card-bg)',
                                        color: currentPage === pageNum ? 'white' : 'var(--index-text-secondary)',
                                        fontWeight: 800,
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            style={{
                                padding: '0.5rem 0.85rem',
                                borderRadius: '8px',
                                border: '1.5px solid var(--index-border-color)',
                                background: 'var(--index-card-bg)',
                                color: (currentPage === totalPages || totalPages === 0) ? 'var(--index-text-faint)' : 'var(--index-text-secondary)',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
