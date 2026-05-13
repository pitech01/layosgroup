import { useState, useEffect } from 'react';
import {
    Plus,
    Layers,
    Calendar,
    Users,
    CheckCircle2,
    Eye,
    Trash2,
    Search,
    Filter,
    ShieldAlert,
    Loader2,
    AlertCircle,
    ArrowRight,
    Sparkles,
    Briefcase
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function CohortsPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [cohorts, setCohorts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const fetchCohorts = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/cohorts`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.status === 401) {
                logout();
                navigate('/instructor-login');
                return;
            }

            const data = await response.json();
            if (response.ok) {
                const filtered = data.filter((c: any) => String(c.instructor_id) === String(user?.id));
                setCohorts(filtered);
            } else {
                throw new Error(data.message || 'Failed to connect to the course server.');
            }
        } catch (err: any) {
            console.error("Fetch Cohorts Error:", err);
            if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
                toast.error('Connection failed. Redirecting to login...');
                setTimeout(() => {
                    logout();
                    navigate('/instructor-login');
                }, 2000);
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCohorts();
    }, [user?.id]);

    const handleDeleteCohort = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this cohort? All enrollment data will be removed.')) return;

        try {
            const response = await fetch(`${API_URL}/cohorts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                setCohorts(cohorts.filter(c => c.id !== id));
                toast.success('Cohort decommissioned');
            } else {
                toast.error('Action failed. Active enrollments detected.');
            }
        } catch (err) {
            toast.error('Network timeout');
        }
    };

    const stats = [
        { label: 'Active Cohorts', count: cohorts.length, icon: CheckCircle2, color: 'text-brand-emerald', bg: 'bg-brand-emerald/10' },
        { label: 'Total Enrollment', count: cohorts.reduce((acc, c) => acc + (c.students?.length || 0), 0), icon: Users, color: 'text-brand-charcoal', bg: 'bg-brand-beige' },
    ];

    const filteredCohorts = cohorts.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-12 pb-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-fade-in-up">
                <div className="max-w-2xl space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-emerald/10 rounded-lg">
                            <Briefcase className="text-brand-emerald" size={18} />
                        </div>
                        <span className="text-brand-emerald font-black text-xs uppercase tracking-widest">Faculty Administration</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-brand-charcoal dark:text-white tracking-tight">
                        Cohort <span className="text-brand-emerald">Ecosystem</span>
                    </h1>
                    <p className="text-brand-muted font-medium text-lg leading-relaxed">
                        Orchestrate and monitor your active learning groups, track class timelines, and manage student enrollment flows.
                    </p>
                </div>

                <Link 
                    to="/instructor/cohorts/create" 
                    className="h-14 px-8 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-brand-charcoal/20 dark:shadow-brand-emerald/20 transition-all hover:scale-105 active:scale-95 no-underline border-none cursor-pointer"
                >
                    <Plus size={20} /> Create New Batch
                </Link>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-brand-charcoal rounded-[40px] border border-brand-border p-10 flex items-center gap-8 group hover:shadow-2xl transition-all duration-500">
                        <div className={`w-20 h-20 rounded-3xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                            <stat.icon size={40} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.3em] mb-1">{stat.label}</p>
                            <h3 className="text-4xl font-black text-brand-charcoal dark:text-white tracking-tight">{stat.count}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex-1 relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-emerald transition-colors">
                        <Search size={22} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search archives by name or unique ID..."
                        className="w-full h-16 pl-16 pr-6 bg-white dark:bg-brand-charcoal border-2 border-brand-border rounded-2xl focus:outline-none focus:border-brand-emerald focus:bg-white dark:focus:bg-brand-charcoal/50 transition-all text-brand-charcoal dark:text-white font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="h-16 px-10 bg-brand-beige dark:bg-white/5 border border-brand-border rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest text-brand-muted hover:text-brand-charcoal dark:hover:text-white transition-all border-none cursor-pointer">
                    Live Status <Filter size={18} />
                </button>
            </div>

            {/* Content Area */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white dark:bg-brand-charcoal rounded-[40px] border border-brand-border border-dashed">
                        <Loader2 className="animate-spin text-brand-emerald" size={64} />
                        <p className="font-black text-xs text-brand-muted uppercase tracking-[0.2em] animate-pulse">Syncing Cohort Data...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 dark:bg-red-500/10 border-2 border-red-100 dark:border-red-500/20 rounded-[40px] p-16 text-center space-y-6">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                            <AlertCircle size={40} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Sync Protocol Failure</h3>
                            <p className="text-brand-muted font-medium max-w-md mx-auto">{error}</p>
                        </div>
                        <button onClick={fetchCohorts} className="h-12 px-8 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all border-none cursor-pointer shadow-lg shadow-red-600/20">
                            Re-initialize Connection
                        </button>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-brand-charcoal rounded-[40px] border border-brand-border overflow-hidden shadow-sm">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-brand-beige/50 dark:bg-white/5">
                                        <th className="text-left px-10 py-8 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Class Artifact</th>
                                        <th className="text-left px-10 py-8 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Live Status</th>
                                        <th className="text-left px-10 py-8 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Assigned Curriculum</th>
                                        <th className="text-left px-10 py-8 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Deployment Timeline</th>
                                        <th className="text-left px-10 py-8 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Cadets</th>
                                        <th className="text-right px-10 py-8 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Protocols</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCohorts.length > 0 ? filteredCohorts.map((cohort, idx) => (
                                        <tr key={cohort.id} className={`group hover:bg-brand-beige/20 dark:hover:bg-white/5 transition-colors ${idx !== filteredCohorts.length - 1 ? 'border-b border-brand-border' : ''}`}>
                                            <td className="px-10 py-8 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black text-brand-emerald uppercase tracking-widest">ID: {cohort.id.substring(0, 8)}</span>
                                                    <h4 className="text-base font-black text-brand-charcoal dark:text-white uppercase tracking-tight group-hover:text-brand-emerald transition-colors">{cohort.name}</h4>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 whitespace-nowrap">
                                                <div className={`
                                                    inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border
                                                    ${(cohort.status || 'Active').toLowerCase() === 'active' 
                                                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                                                        : 'bg-brand-beige dark:bg-white/10 text-brand-muted border-brand-border'}
                                                `}>
                                                    {(cohort.status || 'Active')}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 whitespace-nowrap">
                                                {cohort.course ? (
                                                    <div className="flex items-center gap-3 text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-tight">
                                                        <Layers size={18} className="text-brand-emerald" />
                                                        {cohort.course.title}
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                                                        <ShieldAlert size={14} /> Unassigned
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-10 py-8 whitespace-nowrap">
                                                <div className="flex items-center gap-3 text-xs font-bold text-brand-muted uppercase tracking-widest">
                                                    <Calendar size={16} className="text-brand-emerald" /> 
                                                    <span>{new Date(cohort.start_date).toLocaleDateString()}</span>
                                                    <ArrowRight size={12} />
                                                    <span>{new Date(cohort.end_date).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 whitespace-nowrap">
                                                <div className="flex items-center gap-3 bg-brand-beige dark:bg-white/10 w-fit px-4 py-2 rounded-2xl border border-brand-border">
                                                    <Users size={18} className="text-brand-emerald" />
                                                    <span className="font-black text-brand-charcoal dark:text-white">{cohort.students?.length || 0}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right whitespace-nowrap">
                                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link to={`/instructor/cohorts/${cohort.id}`} className="h-12 px-6 bg-white dark:bg-white/10 text-brand-charcoal dark:text-white border-2 border-brand-border rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-brand-charcoal hover:text-white dark:hover:bg-brand-emerald transition-all no-underline shadow-sm">
                                                        <Eye size={16} /> Console
                                                    </Link>
                                                    <button onClick={() => handleDeleteCohort(cohort.id)} className="h-12 w-12 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} className="px-10 py-32 text-center">
                                                <div className="space-y-6">
                                                    <div className="w-20 h-20 bg-brand-beige dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-brand-muted/30 border border-brand-border border-dashed">
                                                        <Sparkles size={40} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">No Cohorts Matched</h3>
                                                        <p className="text-brand-muted font-medium">Refine your search parameters or initiate a new batch.</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
