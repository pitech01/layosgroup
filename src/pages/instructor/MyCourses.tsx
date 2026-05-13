import {
    Plus,
    CheckCircle2,
    Users,
    Trash2,
    Eye,
    Clock,
    Loader2,
    Search,
    ChevronRight,
    Sparkles,
    ShieldCheck,
    Globe,
    Zap,
    Filter,
    Activity
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface Cohort {
    id: string | number;
    name: string;
    start_date: string;
    course?: {
        id: string;
        title: string;
    };
    students: Array<{ id: string | number; name: string }>;
}

export default function MyCourses() {
    const navigate = useNavigate();
    const [cohortsList, setCohortsList] = useState<Cohort[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const fetchCohorts = async () => {
        try {
            const response = await fetch(`${API_URL}/cohorts`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setCohortsList(data);
            }
        } catch (err) {
            console.error("Fetch Cohorts Error:", err);
            toast.error("Failed to sync cohort records");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCohorts();
    }, []);

    const handleDeleteCohort = async (id: string | number) => {
        if (window.confirm('Are you sure you want to delete this cohort? All student progress data for this group will be lost.')) {
            try {
                const response = await fetch(`${API_URL}/cohorts/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    setCohortsList(cohortsList.filter(c => c.id !== id));
                    toast.success("Cohort record redacted");
                } else {
                    toast.error("Failed to delete cohort");
                }
            } catch (err) {
                console.error("Delete Cohort Error:", err);
                toast.error("Operational failure during deletion");
            }
        }
    };

    const filteredCohorts = cohortsList.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = [
        { label: 'Active Operational Cycles', count: cohortsList.length, trend: 'Managed', color: 'text-brand-emerald', bg: 'bg-brand-emerald/10', icon: Globe },
        { label: 'Synchronized Student Body', count: cohortsList.reduce((acc, c) => acc + (c.students?.length || 0), 0), trend: 'Enrolled', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Users },
    ];

    if (loading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-8 animate-pulse">
                <div className="w-20 h-20 bg-brand-emerald/10 rounded-[32px] flex items-center justify-center">
                    <Loader2 className="animate-spin text-brand-emerald" size={40} />
                </div>
                <p className="font-black text-[10px] text-brand-muted uppercase tracking-[0.4em]">Synchronizing Registry Manifest...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-32">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 animate-fade-in-up">
                <div className="space-y-6 flex-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-brand-emerald/10 rounded-xl">
                            <ShieldCheck className="text-brand-emerald" size={18} />
                        </div>
                        <span className="text-brand-emerald font-black text-[10px] uppercase tracking-[0.4em]">Academic Operations</span>
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-black text-brand-charcoal dark:text-white tracking-tighter leading-none uppercase">Cohort <span className="text-brand-emerald">Registry</span></h1>
                        <p className="text-brand-muted font-medium text-xl max-w-2xl leading-relaxed">Oversee active instructional cycles, manage student allocations, and track curriculum synchronization.</p>
                    </div>
                </div>

                <Link
                    to="/instructor/cohorts/create"
                    className="h-20 px-10 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-[32px] font-black text-xs uppercase tracking-[0.3em] flex items-center gap-4 shadow-2xl shadow-brand-charcoal/20 transition-all hover:scale-105 active:scale-95 group no-underline"
                >
                    <Plus size={24} className="group-hover:rotate-90 transition-transform" /> Initialize Cycle
                </Link>
            </header>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                {stats.map(({ label, count, trend, color, bg, icon: Icon }, i) => (
                    <div key={i} className="bg-white dark:bg-brand-charcoal p-10 rounded-[48px] border border-brand-border flex items-center gap-10 group hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-emerald/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-brand-emerald/10 transition-colors"></div>
                        <div className={`w-20 h-20 ${bg} ${color} rounded-[32px] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                            <Icon size={40} />
                        </div>
                        <div className="relative z-10 flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.3em]">{label}</p>
                                <span className={`px-2 py-0.5 rounded-lg ${bg} ${color} text-[8px] font-black uppercase tracking-widest`}>{trend}</span>
                            </div>
                            <h3 className="text-4xl font-black text-brand-charcoal dark:text-white tracking-tight leading-none group-hover:text-brand-emerald transition-colors">{count}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Hub Bar */}
            <div className="flex flex-col xl:flex-row gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex-1 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-emerald transition-colors" size={24} />
                    <input
                        type="text"
                        placeholder="Filter registry by cycle name or ID..."
                        className="w-full h-20 pl-16 pr-8 bg-white dark:bg-brand-charcoal border-2 border-brand-border rounded-[32px] focus:outline-none focus:border-brand-emerald transition-all text-sm font-bold text-brand-charcoal dark:text-white shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <button className="h-20 px-8 bg-white dark:bg-brand-charcoal border-2 border-brand-border rounded-[32px] flex items-center gap-4 font-black text-[10px] uppercase tracking-widest text-brand-muted hover:text-brand-charcoal dark:hover:text-white transition-all border-none cursor-pointer">
                        <Filter size={20} /> Protocol
                    </button>
                    <button className="h-20 px-8 bg-white dark:bg-brand-charcoal border-2 border-brand-border rounded-[32px] flex items-center gap-4 font-black text-[10px] uppercase tracking-widest text-brand-muted hover:text-brand-charcoal dark:hover:text-white transition-all border-none cursor-pointer">
                        <Activity size={20} /> Analytics
                    </button>
                </div>
            </div>

            {/* Registry List */}
            <div className="bg-white dark:bg-brand-charcoal rounded-[60px] border border-brand-border overflow-hidden shadow-2xl shadow-brand-charcoal/5 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="p-10 border-b border-brand-border flex items-center justify-between bg-brand-beige/10 dark:bg-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-brand-charcoal text-white rounded-xl">
                            <Zap size={20} />
                        </div>
                        <h3 className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Active Transmissions</h3>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-brand-beige/5 dark:bg-white/5 border-b border-brand-border">
                                <th className="text-left py-8 px-10 text-[10px] font-black text-brand-muted uppercase tracking-[0.3em]">Session Identity</th>
                                <th className="text-left py-8 px-10 text-[10px] font-black text-brand-muted uppercase tracking-[0.3em]">Operational Data</th>
                                <th className="text-left py-8 px-10 text-[10px] font-black text-brand-muted uppercase tracking-[0.3em]">Population</th>
                                <th className="text-right py-8 px-10 text-[10px] font-black text-brand-muted uppercase tracking-[0.3em]">Management</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border">
                            {filteredCohorts.length > 0 ? filteredCohorts.map((cohort, idx) => (
                                <tr key={cohort.id} className="group hover:bg-brand-beige/20 dark:hover:bg-white/5 transition-all">
                                    <td className="py-10 px-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-brand-charcoal dark:bg-brand-emerald text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-brand-charcoal/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                                {cohort.name.charAt(0)}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-brand-emerald bg-brand-emerald/10 px-2 py-0.5 rounded-lg uppercase tracking-widest">{cohort.id}</span>
                                                    <h4 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight group-hover:text-brand-emerald transition-colors">{cohort.name}</h4>
                                                </div>
                                                <p className="text-xs font-bold text-brand-muted">{cohort.course?.title || 'General Curriculum'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-10 px-10">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-tight">
                                                <Clock size={16} className="text-brand-emerald" /> 
                                                {new Date(cohort.start_date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                Operational
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-10 px-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-brand-beige/50 dark:bg-white/10 rounded-xl flex items-center justify-center text-brand-muted group-hover:text-brand-emerald transition-colors">
                                                <Users size={20} />
                                            </div>
                                            <span className="text-xl font-black text-brand-charcoal dark:text-white tracking-tight">{cohort.students?.length || 0}</span>
                                        </div>
                                    </td>
                                    <td className="py-10 px-10 text-right">
                                        <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                                            <Link 
                                                to={`/instructor/cohorts/${cohort.id}`} 
                                                className="h-14 px-8 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 no-underline shadow-lg shadow-brand-charcoal/20 transition-all hover:scale-105 active:scale-95"
                                            >
                                                <Eye size={18} /> Manage
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteCohort(cohort.id)}
                                                className="w-14 h-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center transition-all hover:bg-red-500 hover:text-white border-none cursor-pointer group/del"
                                            >
                                                <Trash2 size={20} className="group-hover/del:rotate-12 transition-transform" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="py-40 text-center space-y-10">
                                        <div className="w-32 h-32 bg-brand-beige dark:bg-white/5 rounded-[48px] flex items-center justify-center mx-auto text-brand-muted/30 shadow-inner">
                                            <Sparkles size={64} className="animate-pulse" />
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-3xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">No Records Found</h3>
                                            <p className="text-brand-muted font-medium text-lg max-w-md mx-auto">The registry manifest is currently empty. Initialize a new cycle to begin operational tracking.</p>
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
