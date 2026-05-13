import { useState, useEffect } from 'react';
import { Clock, Loader2, Activity, Search, Filter, ShieldCheck, Database, Layout, Sparkles, ChevronRight, ArrowUpRight } from 'lucide-react';

export default function ActivityLogsDetailed() {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await fetch(`${API_URL}/instructor/activity-logs`, {
                    headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setActivities(data);
                }
            } catch (err) {
                console.error("Failed to synchronize with system manifest:", err);
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
            <div className="h-[70vh] flex flex-col items-center justify-center gap-6 animate-pulse">
                <Loader2 className="animate-spin text-brand-emerald" size={48} />
                <p className="font-black text-[10px] text-brand-muted uppercase tracking-[0.4em]">Synchronizing Operational Logs...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-32 max-w-7xl mx-auto px-6 md:px-0">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 animate-fade-in-up">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-emerald/10 rounded-lg">
                            <Activity className="text-brand-emerald" size={18} />
                        </div>
                        <span className="text-brand-emerald font-black text-[10px] uppercase tracking-[0.3em]">System Intelligence</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-brand-charcoal dark:text-white tracking-tight leading-none uppercase">Activity <span className="text-brand-emerald">Manifest</span></h1>
                    <p className="text-brand-muted font-medium text-lg max-w-2xl leading-relaxed">Detailed chronological tracking of academic interactions, system modifications, and student engagement artifacts.</p>
                </div>
                <div className="flex items-center gap-4 p-6 bg-brand-beige/20 dark:bg-white/5 rounded-[32px] border border-brand-border">
                    <div className="w-12 h-12 bg-brand-charcoal text-white rounded-xl flex items-center justify-center font-black text-xs shadow-xl">{filteredActivities.length}</div>
                    <div className="space-y-0.5">
                        <div className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Total Records</div>
                        <div className="text-xs font-black text-brand-charcoal dark:text-white uppercase">Operational Cycles</div>
                    </div>
                </div>
            </header>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex-1 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-emerald transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search system archives..." 
                        className="w-full h-16 pl-16 pr-6 bg-white dark:bg-brand-charcoal border-2 border-brand-border rounded-2xl focus:outline-none focus:border-brand-emerald focus:bg-white transition-all text-sm font-bold text-brand-charcoal dark:text-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button className="h-16 px-10 bg-brand-beige dark:bg-white/5 border border-brand-border rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest text-brand-muted hover:text-brand-charcoal dark:hover:text-white transition-all border-none cursor-pointer">
                    Live Feed <Sparkles size={16} />
                </button>
            </div>

            {/* Logs Table */}
            <div className="bg-white dark:bg-brand-charcoal rounded-[48px] border border-brand-border overflow-hidden shadow-2xl shadow-brand-charcoal/5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-brand-beige/20 dark:bg-white/5">
                                <th className="px-10 py-8 text-left text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] border-b border-brand-border">Subject Node</th>
                                <th className="px-10 py-8 text-left text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] border-b border-brand-border">Action Protocol</th>
                                <th className="px-10 py-8 text-left text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] border-b border-brand-border w-1/2">Operational Intelligence</th>
                                <th className="px-10 py-8 text-right text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] border-b border-brand-border">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredActivities.length > 0 ? filteredActivities.map((activity, idx) => (
                                <tr key={idx} className={`group hover:bg-brand-beige/10 dark:hover:bg-white/5 transition-colors ${idx !== filteredActivities.length - 1 ? 'border-b border-brand-border' : ''}`}>
                                    <td className="px-10 py-8 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-brand-charcoal dark:bg-brand-emerald/10 text-white dark:text-brand-emerald rounded-xl flex items-center justify-center font-black text-base shadow-inner group-hover:scale-110 transition-transform">
                                                {activity.user?.name ? activity.user.name.charAt(0) : '-'}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-tight">{activity.user?.name || 'System Core'}</div>
                                                <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">{activity.user?.role || 'Operational Node'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 whitespace-nowrap">
                                        <div className="inline-flex items-center px-4 py-1.5 bg-brand-beige dark:bg-white/10 text-brand-muted rounded-xl text-[10px] font-black uppercase tracking-widest border border-brand-border group-hover:border-brand-emerald transition-colors">
                                            {activity.action.replace('_', ' ')}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="space-y-4">
                                            <p className="text-sm font-bold text-brand-charcoal dark:text-white leading-relaxed">{activity.description}</p>
                                            {(() => {
                                                if (!activity.metadata) return null;
                                                let parsed = {};
                                                try {
                                                    parsed = typeof activity.metadata === 'string' ? JSON.parse(activity.metadata) : activity.metadata;
                                                } catch (e) { return null; }
                                                if (Object.keys(parsed).length === 0) return null;
                                                return (
                                                    <div className="p-6 bg-brand-beige/30 dark:bg-white/5 rounded-2xl border border-brand-border space-y-3">
                                                        <div className="flex items-center gap-2 text-[8px] font-black text-brand-muted uppercase tracking-widest mb-2">
                                                            <Database size={10} className="text-brand-emerald" /> Intel Snippet
                                                        </div>
                                                        {Object.entries(parsed).map(([key, value]) => (
                                                            <div key={key} className="flex items-start gap-4 text-xs">
                                                                <span className="font-black text-brand-muted uppercase tracking-widest min-w-[100px] shrink-0">{key.replace('_', ' ')}:</span>
                                                                <span className="font-mono text-brand-emerald break-all">{String(value)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right whitespace-nowrap">
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-widest">
                                                <Clock size={12} className="text-brand-emerald" />
                                                {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                                                {new Date(activity.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-10 py-32 text-center space-y-8">
                                        <div className="w-24 h-24 bg-brand-beige dark:bg-white/5 rounded-[40px] flex items-center justify-center mx-auto text-brand-muted/30 shadow-inner">
                                            <Database size={48} className="animate-pulse" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">Archives Idle</h3>
                                            <p className="text-brand-muted font-medium text-sm">No operational records matched the current filtering parameters.</p>
                                        </div>
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
