import { useState, useEffect } from 'react';
import {
    Settings,
    PlusCircle,
    ArrowLeft,
    Loader2,
    AlertCircle,
    Layers,
    ShieldBan,
    User,
    CheckCircle2,
    X,
    Sparkles,
    Calendar,
    Users,
    ChevronRight,
    Search,
    BookOpen,
    MoreVertical,
    Clock,
    Lock
} from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';

interface Student {
    id: string;
    name: string;
    email: string;
    pivot: {
        status: string;
        created_at: string;
    };
}

interface Course {
    id: string;
    title: string;
    modules: Array<{
        id: string;
        title: string;
        lessons: Array<{
            id: string;
            title: string;
        }>;
    }>;
}

interface Cohort {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    visibility: string;
    course: Course | null;
    students: Student[];
}

export default function CohortDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [cohort, setCohort] = useState<Cohort | null>(null);
    const [activeTab, setActiveTab] = useState<'curriculum' | 'students'>('curriculum');
    const [isUpdating, setIsUpdating] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const fetchCohort = async () => {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        try {
            const response = await fetch(`${API_URL}/cohorts/${id}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setCohort(data);
            } else {
                throw new Error(data.message || 'Failed to fetch cohort data.');
            }
        } catch (err) {
            const errorInstance = err as Error;
            console.error("Fetch Cohort Error:", errorInstance);
            setError(errorInstance.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCohort();
    }, [id]);

    const handleBlockAccess = async (studentId: string) => {
        if (!confirm('Are you sure you want to block this student? They will lose access to the cohort immediately.')) return;
        setIsUpdating(true);
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        try {
            const response = await fetch(`${API_URL}/cohorts/${id}/students/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status: 'dropped' })
            });

            if (response.ok) {
                setNotification({ type: 'success', message: 'Student access has been blocked.' });
                fetchCohort();
                setTimeout(() => setNotification(null), 4000);
            } else {
                setNotification({ type: 'error', message: 'Failed to block student access.' });
            }
        } catch (err) {
            console.error("Block Student Error:", err);
            alert('An error occurred while blocking.');
        } finally {
            setIsUpdating(false);
        }
    };


    if (loading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center gap-6 animate-pulse">
                <Loader2 className="animate-spin text-brand-emerald" size={48} />
                <p className="font-black text-[10px] text-brand-muted uppercase tracking-[0.3em]">Synchronizing Manifest...</p>
            </div>
        );
    }

    if (error || !cohort) {
        return (
            <div className="p-12 md:p-24 flex justify-center items-center">
                <div className="max-w-xl w-full bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-[40px] p-12 text-center space-y-8 animate-fade-in-up">
                    <div className="w-20 h-20 bg-red-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-red-500/20">
                        <AlertCircle size={40} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">System Refusal</h2>
                        <p className="text-red-600 dark:text-red-400 font-bold leading-relaxed">{error || 'The requested cohort record could not be retrieved from the central repository.'}</p>
                    </div>
                    <button 
                        onClick={() => navigate('/instructor/cohorts')} 
                        className="h-14 px-8 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 mx-auto shadow-xl transition-all hover:scale-105 border-none cursor-pointer"
                    >
                        <ArrowLeft size={18} /> Return to Directory
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-12">
            {/* Breadcrumb */}
            <Link to="/instructor/cohorts" className="inline-flex items-center gap-3 text-[10px] font-black text-brand-muted hover:text-brand-emerald uppercase tracking-[0.2em] transition-all no-underline group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to My Cohorts
            </Link>

            {/* Notification Toast */}
            {notification && (
                <div className="fixed top-8 right-8 z-[1000] px-8 py-5 bg-white dark:bg-brand-charcoal border-2 border-brand-border rounded-3xl shadow-2xl flex items-center gap-4 animate-slide-in">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                        {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    </div>
                    <span className="font-black text-xs uppercase tracking-widest text-brand-charcoal dark:text-white">{notification.message}</span>
                    <button onClick={() => setNotification(null)} className="p-2 hover:bg-brand-beige dark:hover:bg-white/10 rounded-lg transition-all border-none cursor-pointer">
                        <X size={18} className="text-brand-muted" />
                    </button>
                </div>
            )}

            {/* Premium Header */}
            <header className="bg-white dark:bg-brand-charcoal rounded-[40px] border border-brand-border p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 animate-fade-in-up relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-emerald/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-brand-emerald/10 transition-colors duration-1000"></div>
                
                <div className="relative z-10 space-y-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest">
                            Active Operational Cycle
                        </div>
                        <div className="px-4 py-1.5 bg-brand-emerald/10 text-brand-emerald rounded-xl text-[10px] font-black uppercase tracking-widest border border-brand-emerald/20 font-mono">
                            {cohort.id}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-black text-brand-charcoal dark:text-white tracking-tight uppercase leading-none">{cohort.name}</h1>
                        <p className="text-brand-muted font-medium text-lg flex items-center gap-3">
                            <Calendar size={18} className="text-brand-emerald" />
                            {new Date(cohort.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} — {new Date(cohort.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <div className="px-6 py-3 bg-brand-beige/50 dark:bg-white/5 border border-brand-border rounded-2xl space-y-1">
                            <div className="text-[10px] font-black text-brand-muted uppercase tracking-widest leading-none">Total Enrolled</div>
                            <div className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">{cohort.students?.length || 0} Cadets</div>
                        </div>
                        <div className="px-6 py-3 bg-brand-beige/50 dark:bg-white/5 border border-brand-border rounded-2xl space-y-1">
                            <div className="text-[10px] font-black text-brand-muted uppercase tracking-widest leading-none">Sync Status</div>
                            <div className="text-xl font-black text-brand-emerald uppercase tracking-tight">Active</div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex gap-4 w-full md:w-auto">
                    <button 
                        onClick={() => navigate(`/instructor/cohorts/${cohort.id}/edit`)}
                        className="flex-1 md:flex-none h-14 px-8 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-brand-charcoal/20 dark:shadow-brand-emerald/20 transition-all hover:scale-105 active:scale-95 border-none cursor-pointer"
                    >
                        <Settings size={20} /> Management Terminal
                    </button>
                </div>
            </header>

            {/* Tab Navigation */}
            <nav className="flex gap-12 border-b border-brand-border px-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                {[
                    { id: 'curriculum', label: 'Curriculum Manifest', icon: Layers },
                    { id: 'students', label: 'Enrolled Directory', icon: Users }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-3 pb-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all border-none cursor-pointer relative ${activeTab === tab.id ? 'text-brand-emerald' : 'text-brand-muted hover:text-brand-charcoal dark:hover:text-white'}`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-emerald rounded-t-full"></div>
                        )}
                    </button>
                ))}
            </nav>

            {/* Tab Content */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {activeTab === 'curriculum' ? (
                    !cohort.course ? (
                        <div className="bg-white dark:bg-brand-charcoal rounded-[60px] border-2 border-brand-border border-dashed p-20 text-center space-y-10 animate-fade-in-up">
                            <div className="w-24 h-24 bg-brand-beige dark:bg-white/5 rounded-[40px] flex items-center justify-center mx-auto text-brand-muted/30 shadow-inner">
                                <Layers size={48} />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-tight">No Instructional Artifact Linked</h3>
                                <p className="text-brand-muted font-medium text-lg max-w-md mx-auto">This cohort current lacks a curriculum blueprint. Synchronize a course to initiate educational delivery.</p>
                            </div>
                            <button 
                                onClick={() => navigate(`/instructor/cohorts/${cohort.id}/attach-course`)}
                                className="h-16 px-10 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 mx-auto shadow-2xl shadow-brand-charcoal/20 transition-all hover:scale-105 border-none cursor-pointer"
                            >
                                <PlusCircle size={22} /> Synchronize Course Blueprint
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-brand-emerald/10 rounded-lg">
                                            <BookOpen size={16} className="text-brand-emerald" />
                                        </div>
                                        <h3 className="text-2xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">{cohort.course.title}</h3>
                                    </div>
                                    <p className="text-brand-muted font-medium">Currently active curriculum blueprint for this operational session.</p>
                                </div>
                                <button 
                                    onClick={() => navigate(`/instructor/courses/${cohort.course!.id}/edit`)}
                                    className="h-12 px-6 bg-brand-beige dark:bg-white/5 border border-brand-border rounded-xl font-black text-[10px] uppercase tracking-widest text-brand-muted hover:text-brand-charcoal dark:hover:text-white transition-all border-none cursor-pointer"
                                >
                                    Access Master Artifact
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                {cohort.course.modules?.map((module, idx) => (
                                    <div key={module.id} className="bg-white dark:bg-brand-charcoal rounded-[40px] border border-brand-border overflow-hidden shadow-sm hover:shadow-xl hover:shadow-brand-charcoal/5 transition-all duration-500 group/module">
                                        <div className="px-10 py-8 bg-brand-beige/20 dark:bg-white/5 border-b border-brand-border flex flex-col md:flex-row justify-between items-center gap-4">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 bg-white dark:bg-brand-charcoal rounded-2xl flex items-center justify-center text-brand-emerald shadow-sm font-black text-lg">
                                                    {idx + 1}
                                                </div>
                                                <h4 className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight group-hover/module:text-brand-emerald transition-colors">{module.title}</h4>
                                            </div>
                                            <div className="px-4 py-1.5 bg-white dark:bg-brand-charcoal/50 border border-brand-border rounded-xl text-[10px] font-black text-brand-muted uppercase tracking-widest">
                                                {module.lessons?.length || 0} Instructional Units
                                            </div>
                                        </div>
                                        <div className="p-10 divide-y divide-brand-border/50">
                                            {module.lessons?.map((lesson) => (
                                                <div key={lesson.id} className="py-6 flex items-center gap-6 group/lesson">
                                                    <div className="w-2 h-2 rounded-full bg-brand-border group-hover/lesson:bg-brand-emerald group-hover/lesson:scale-150 transition-all"></div>
                                                    <div className="flex-1">
                                                        <h5 className="text-base font-black text-brand-charcoal dark:text-white uppercase tracking-tight">{lesson.title}</h5>
                                                    </div>
                                                    <ChevronRight size={18} className="text-brand-muted opacity-0 group-hover/lesson:opacity-100 group-hover/lesson:translate-x-2 transition-all" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                ) : (
                    <div className="space-y-10">
                        {/* Students Directory Controls */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="w-full md:max-w-md relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-emerald transition-colors">
                                    <Search size={22} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search enrolled directory..."
                                    className="w-full h-16 pl-16 pr-6 bg-white dark:bg-brand-charcoal border-2 border-brand-border rounded-2xl focus:outline-none focus:border-brand-emerald transition-all text-brand-charcoal dark:text-white font-bold"
                                />
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <button className="flex-1 md:flex-none h-16 px-8 bg-brand-beige dark:bg-white/5 border border-brand-border rounded-2xl font-black text-[10px] uppercase tracking-widest text-brand-muted hover:text-brand-charcoal dark:hover:text-white transition-all border-none cursor-pointer">
                                    Export Manifest
                                </button>
                                <button className="flex-1 md:flex-none h-16 px-10 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-105 border-none cursor-pointer">
                                    Enroll Cadet
                                </button>
                            </div>
                        </div>

                        {/* Students Table */}
                        <div className="bg-white dark:bg-brand-charcoal rounded-[40px] border border-brand-border overflow-hidden shadow-2xl shadow-brand-charcoal/5">
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-brand-beige/20 dark:bg-white/5">
                                            <th className="px-10 py-6 text-left text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] border-b border-brand-border">Enrolled Individual</th>
                                            <th className="px-10 py-6 text-left text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] border-b border-brand-border text-center">Protocol Status</th>
                                            <th className="px-10 py-6 text-left text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] border-b border-brand-border text-center">Synchronization Date</th>
                                            <th className="px-10 py-6 text-right text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] border-b border-brand-border">Terminal Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-border">
                                        {cohort.students?.length > 0 ? cohort.students.map((student: Student) => (
                                            <tr key={student.id} className="group/row hover:bg-brand-beige/5 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-12 h-12 bg-brand-beige dark:bg-white/10 rounded-2xl flex items-center justify-center font-black text-brand-emerald text-lg shadow-inner group-hover/row:scale-110 transition-transform duration-500">
                                                            {student.name.charAt(0)}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-base font-black text-brand-charcoal dark:text-white uppercase tracking-tight">{student.name}</div>
                                                            <div className="text-xs font-bold text-brand-muted">{student.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8 text-center">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${student.pivot.status === 'dropped' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}>
                                                        {student.pivot.status}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-8 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-tight">
                                                            {new Date(student.pivot.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </div>
                                                        <div className="text-[10px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-1">
                                                            <Clock size={10} /> {new Date(student.pivot.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    {student.pivot.status !== 'dropped' ? (
                                                        <div className="flex justify-end gap-3 opacity-0 group-hover/row:opacity-100 transition-all">
                                                            <button 
                                                                onClick={() => handleBlockAccess(student.id)}
                                                                disabled={isUpdating}
                                                                className="h-11 px-5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-none cursor-pointer flex items-center gap-2"
                                                            >
                                                                <ShieldBan size={16} /> Block Access
                                                            </button>
                                                            <button className="h-11 w-11 flex items-center justify-center bg-brand-beige dark:bg-white/10 text-brand-muted hover:text-brand-charcoal rounded-xl transition-all border-none cursor-pointer">
                                                                <MoreVertical size={18} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center justify-end gap-2">
                                                            <Lock size={12} /> Access Terminated
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={4} className="px-10 py-32 text-center">
                                                    <div className="space-y-6">
                                                        <div className="w-16 h-16 bg-brand-beige dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-brand-muted/30">
                                                            <Users size={32} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h4 className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Zero Cadets Detected</h4>
                                                            <p className="text-brand-muted font-medium">No students have been successfully synchronized with this operational cycle.</p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
