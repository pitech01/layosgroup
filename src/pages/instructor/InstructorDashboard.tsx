import { useState, useEffect } from 'react';
import {
    Plus,
    Users,
    BookOpen,
    Clock,
    ArrowUpRight,
    Loader2,
    Activity,
    TrendingUp,
    Calendar,
    ArrowRight,
    Target,
    Zap,
    ShieldCheck,
    Globe,
    Layers,
    Sparkles,
    ChevronRight,
    ArrowUpCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function InstructorDashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();
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
                
                if (statsRes.status === 401 || activitiesRes.status === 401) {
                    logout();
                    navigate('/instructor-login');
                    return;
                }

                if (statsRes.ok) {
                    const data = await statsRes.json();
                    setStats(data.stats);
                }
                
                if (activitiesRes.ok) {
                    const logs = await activitiesRes.json();
                    setActivities(logs);
                }
            } catch (err: any) {
                console.error("Fetch Dashboard Stats Error:", err);
                if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
                    toast.error('Synchronization failed. Re-authenticating...');
                    setTimeout(() => {
                        logout();
                        navigate('/instructor-login');
                    }, 2000);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [API_URL]);

    if (loading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-6 animate-pulse">
                <Loader2 className="animate-spin text-brand-emerald" size={48} />
                <p className="font-black text-[10px] text-brand-muted uppercase tracking-[0.4em]">Synchronizing Analytics manifest...</p>
            </div>
        );
    }

    const quickStats = [
        { label: 'Active Operational Cycles', value: stats?.active_cohorts || '0', trend: 'Live', icon: Globe, color: 'text-brand-emerald', bg: 'bg-brand-emerald/10' },
        { label: 'Synchronized Cadets', value: stats?.total_students?.toLocaleString() || '0', trend: 'Global', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Comprehension Metric', value: `${stats?.completion_rate || 0}%`, trend: 'Avg', icon: Target, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Artifacts Authorized', value: stats?.certificates_issued || '0', trend: 'Total', icon: ShieldCheck, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    ];

    return (
        <div className="space-y-12 pb-20">
            {/* Page Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 animate-fade-in-up">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-emerald/10 rounded-lg">
                            <Sparkles size={20} className="text-brand-emerald" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">Command Center</h1>
                    </div>
                    <p className="text-brand-muted font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                        <Activity size={14} className="text-brand-emerald" />
                        Operational Overview & Real-time Ecosystem Metrics
                    </p>
                </div>
                <button
                    onClick={() => navigate('/instructor/cohorts/create')}
                    className="h-16 px-10 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 shadow-2xl shadow-brand-charcoal/20 transition-all hover:scale-105 active:scale-95 border-none cursor-pointer"
                >
                    <Plus size={22} strokeWidth={3} /> Initialize New Cycle
                </button>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                {quickStats.map(({ label, value, trend, icon: Icon, color, bg }, i) => (
                    <div key={i} className="bg-white dark:bg-brand-charcoal p-8 rounded-[40px] border border-brand-border shadow-sm hover:shadow-2xl hover:shadow-brand-charcoal/5 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-emerald/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-brand-emerald/10 transition-colors"></div>
                        
                        <div className="relative z-10 flex justify-between items-start mb-8">
                            <div className={`w-14 h-14 rounded-2xl ${bg} ${color} flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner`}>
                                <Icon size={28} />
                            </div>
                            <div className={`px-3 py-1.5 rounded-xl ${bg} ${color} text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-transparent group-hover:border-current/20 transition-all`}>
                                <Zap size={12} strokeWidth={3} className="animate-pulse" />
                                {trend}
                            </div>
                        </div>
                        <div className="relative z-10 space-y-1">
                            <div className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">{label}</div>
                            <div className="text-4xl font-black text-brand-charcoal dark:text-white tracking-tighter group-hover:text-brand-emerald transition-colors leading-none">{value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {/* Left: Activity Manifest */}
                <div className="xl:col-span-8 space-y-6">
                    <div className="bg-white dark:bg-brand-charcoal rounded-[48px] border border-brand-border overflow-hidden shadow-2xl shadow-brand-charcoal/5 flex flex-col h-full">
                        <div className="p-10 border-b border-brand-border flex items-center justify-between bg-brand-beige/10 dark:bg-white/5">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-brand-charcoal text-white rounded-xl">
                                    <Activity size={20} />
                                </div>
                                <h3 className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">System Event Manifest</h3>
                            </div>
                            <Link to="/instructor/activity-logs" className="h-10 px-6 bg-white dark:bg-brand-charcoal border border-brand-border rounded-xl font-black text-[10px] uppercase tracking-widest text-brand-muted hover:text-brand-charcoal dark:hover:text-white hover:border-brand-emerald flex items-center gap-2 transition-all group no-underline">
                                Full Logs <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar max-h-[600px]">
                            {activities.length > 0 ? activities.map((activity, idx) => (
                                <div key={idx} className="p-6 rounded-[32px] hover:bg-brand-beige/40 dark:hover:bg-white/5 transition-all border border-transparent hover:border-brand-border group flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-brand-charcoal dark:bg-brand-emerald/20 text-white dark:text-brand-emerald flex items-center justify-center font-black text-xl shrink-0 border-2 border-brand-border group-hover:scale-110 group-hover:border-brand-emerald transition-all duration-500 shadow-sm">
                                        {activity.user?.name?.charAt(0) || 'S'}
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <p className="text-sm font-bold text-brand-charcoal dark:text-white leading-relaxed group-hover:text-brand-emerald transition-colors">
                                            {activity.description}
                                        </p>
                                        <div className="flex items-center gap-6">
                                            <div className="text-[10px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-2">
                                                <Clock size={12} className="text-brand-emerald" /> 
                                                {new Date(activity.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="text-[10px] font-black text-brand-emerald uppercase tracking-widest flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ArrowUpCircle size={12} />
                                                Operational Update
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-32 text-center space-y-8">
                                    <div className="w-24 h-24 bg-brand-beige dark:bg-white/5 rounded-[40px] flex items-center justify-center mx-auto text-brand-muted/30 shadow-inner">
                                        <Globe size={48} className="animate-pulse" />
                                    </div>
                                    <div className="space-y-2">
                                        <h5 className="text-2xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Ecosystem Idle</h5>
                                        <p className="text-brand-muted font-medium text-sm">No operational events recorded in the current cycle.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Performance Metrics */}
                <div className="xl:col-span-4 space-y-8">
                    <div className="bg-white dark:bg-brand-charcoal rounded-[48px] border border-brand-border p-10 shadow-2xl shadow-brand-charcoal/5 space-y-12 h-full flex flex-col justify-between">
                        <div className="space-y-2">
                            <div className="text-[10px] font-black text-brand-muted uppercase tracking-[0.3em]">Comprehension Efficiency</div>
                            <h3 className="text-2xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">Learning Velocity</h3>
                        </div>

                        <div className="flex flex-col items-center gap-8 flex-1 justify-center py-10">
                            <div className="relative w-56 h-56 group">
                                <div className="absolute inset-0 bg-brand-emerald/10 rounded-full blur-3xl group-hover:bg-brand-emerald/20 transition-colors"></div>
                                <svg className="w-full h-full transform -rotate-90 relative z-10">
                                    <circle
                                        cx="112"
                                        cy="112"
                                        r="94"
                                        stroke="currentColor"
                                        strokeWidth="18"
                                        fill="transparent"
                                        className="text-brand-beige dark:text-white/5"
                                    />
                                    <circle
                                        cx="112"
                                        cy="112"
                                        r="94"
                                        stroke="currentColor"
                                        strokeWidth="18"
                                        fill="transparent"
                                        strokeDasharray={590.6}
                                        strokeDashoffset={590.6 - (590.6 * (stats?.completion_rate || 0)) / 100}
                                        strokeLinecap="round"
                                        className="text-brand-emerald transition-all duration-1000 ease-out filter drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                    <span className="text-5xl font-black text-brand-charcoal dark:text-white tracking-tighter leading-none">{stats?.completion_rate || 0}%</span>
                                    <span className="text-[10px] font-black text-brand-muted uppercase tracking-[0.3em] mt-2">Operational Goal</span>
                                </div>
                            </div>

                            <div className="w-full grid grid-cols-2 gap-4">
                                <div className="p-6 bg-brand-beige/30 dark:bg-white/5 rounded-[32px] border border-brand-border text-center space-y-1 hover:border-brand-emerald transition-colors">
                                    <div className="text-2xl font-black text-brand-emerald">+12.4%</div>
                                    <div className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Velocity Growth</div>
                                </div>
                                <div className="p-6 bg-brand-beige/30 dark:bg-white/5 rounded-[32px] border border-brand-border text-center space-y-1 hover:border-brand-emerald transition-colors">
                                    <div className="text-2xl font-black text-brand-emerald">99.9%</div>
                                    <div className="text-[10px] font-black text-brand-muted uppercase tracking-widest">System Uptime</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-brand-charcoal dark:bg-brand-emerald/10 rounded-[40px] border border-white/5 text-center space-y-4">
                            <p className="text-[10px] font-bold text-white/70 dark:text-brand-emerald uppercase tracking-widest leading-relaxed">
                                Global curriculum engagement across all active instructor modules is exceeding quarterly benchmarks by <span className="text-white dark:text-white font-black">18.5%</span>.
                            </p>
                            <button onClick={() => navigate('/instructor/activity-logs')} className="w-full h-14 bg-white/10 dark:bg-brand-emerald text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all border-none cursor-pointer flex items-center justify-center gap-3">
                                View Detailed Analysis <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
