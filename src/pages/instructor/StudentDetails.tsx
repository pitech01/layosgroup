import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    ShieldCheck,
    BookOpen,
    Clock,
    TrendingUp,
    Award,
    Activity,
    MapPin,
    Loader2,
    AlertCircle,
    User,
    CheckCircle2,
    X,
    HelpCircle,
    ChevronDown,
    ChevronUp,
    MoreVertical,
    BarChart3,
    FileText,
    Zap,
    Target,
    ShieldAlert,
    Sparkles,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';

export default function StudentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [deactivateMessage, setDeactivateMessage] = useState('');
    const [pendingCohortId, setPendingCohortId] = useState<string | null>(null);
    const [viewingQuizResult, setViewingQuizResult] = useState<any>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [expandedCohortMap, setExpandedCohortMap] = useState<Record<string, boolean>>({});

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const fetchStudentData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/students/${id}`, {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (response.ok) setStudent(data);
            else throw new Error(data.message || 'Synchronization with student repository failed.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleActivation = async (cohortId: string, currentStatus: string, message?: string) => {
        const newStatus = currentStatus === 'inactive' ? 'active' : 'inactive';
        if (newStatus === 'inactive' && !message) {
            setPendingCohortId(cohortId);
            setShowDeactivateModal(true);
            return;
        }
        try {
            const response = await fetch(`${API_URL}/cohorts/${cohortId}/students/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ status: newStatus, message: message })
            });
            if (response.ok) {
                setShowDeactivateModal(false);
                setDeactivateMessage('');
                setPendingCohortId(null);
                setNotification({ type: 'success', message: `Uplink status modified: ${newStatus}.` });
                fetchStudentData();
                setTimeout(() => setNotification(null), 4000);
            }
        } catch (err) {
            setNotification({ type: 'error', message: 'Operational failure during status modification.' });
        }
    };

    const toggleLessonCompletion = async (lessonId: string, currentCompleted: boolean) => {
        try {
            const response = await fetch(`${API_URL}/lessons/${lessonId}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ student_id: student.id, completed: !currentCompleted })
            });
            if (response.ok) {
                setNotification({ type: 'success', message: 'Curriculum progress synchronized.' });
                fetchStudentData(); 
            }
        } catch (err) {
            setNotification({ type: 'error', message: 'Progress update failed.' });
        }
    };

    useEffect(() => {
        fetchStudentData();
    }, [id]);

    if (loading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-6 animate-pulse">
                <Loader2 className="animate-spin text-brand-emerald" size={48} />
                <p className="font-black text-[10px] text-brand-muted uppercase tracking-[0.4em]">Synchronizing Portfolio Intel...</p>
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="max-w-2xl mx-auto py-20 px-10 bg-red-50 dark:bg-red-500/10 border-2 border-red-100 dark:border-red-500/20 rounded-[48px] text-center space-y-8 animate-fade-in-up">
                <div className="w-24 h-24 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-[32px] flex items-center justify-center mx-auto shadow-sm">
                    <ShieldAlert size={48} />
                </div>
                <div className="space-y-2">
                    <h3 className="text-3xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">Sync Protocol Error</h3>
                    <p className="text-brand-muted font-medium text-lg leading-relaxed">{error || 'Target cadet profile could not be retrieved from the central repository.'}</p>
                </div>
                <button onClick={() => navigate(-1)} className="h-14 px-10 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 mx-auto hover:scale-105 transition-all border-none cursor-pointer"><ArrowLeft size={20} /> Back to Directory</button>
            </div>
        );
    }

    const validCohorts = student.cohorts || [];
    const avgCompletion = validCohorts.length > 0 ? Math.round(validCohorts.reduce((acc: number, c: any) => acc + Number(c.pivot?.progress || 0), 0) / validCohorts.length) : 0;
    const scoredLessons = student.completed_lessons?.filter((l: any) => l.pivot?.score != null) || [];
    const avgQuizScore = scoredLessons.length > 0 ? Math.round(scoredLessons.reduce((acc: number, l: any) => acc + Number(l.pivot?.score), 0) / scoredLessons.length) : 'N/A';

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-32">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between animate-fade-in-up">
                <button onClick={() => navigate(-1)} className="group flex items-center gap-4 text-[10px] font-black text-brand-muted hover:text-brand-emerald uppercase tracking-[0.3em] transition-all border-none bg-transparent cursor-pointer">
                    <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" /> Back to Cadet Directory
                </button>
                <div className="flex gap-4">
                    <button onClick={fetchStudentData} className="h-11 px-6 bg-brand-beige dark:bg-white/10 text-brand-muted hover:text-brand-charcoal dark:hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-none cursor-pointer">Refresh Portfolio</button>
                </div>
            </div>

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-12 right-12 z-[1000] px-8 py-5 rounded-[28px] shadow-2xl flex items-center gap-4 animate-slide-in ${notification.type === 'success' ? 'bg-brand-emerald text-white' : 'bg-red-600 text-white'}`}>
                    {notification.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    <span className="font-black text-xs uppercase tracking-widest">{notification.message}</span>
                    <button onClick={() => setNotification(null)} className="p-1 hover:bg-white/20 rounded-lg border-none bg-transparent cursor-pointer"><X size={18} /></button>
                </div>
            )}

            {/* Profile Hero */}
            <div className="bg-white dark:bg-brand-charcoal rounded-[60px] border border-brand-border p-12 md:p-16 flex flex-col lg:flex-row items-center gap-16 shadow-2xl shadow-brand-charcoal/5 animate-fade-in-up">
                <div className="relative group">
                    <div className="absolute inset-0 bg-brand-emerald/20 blur-[60px] rounded-full group-hover:bg-brand-emerald/30 transition-all"></div>
                    <div className="relative w-48 h-48 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-[56px] flex items-center justify-center font-black text-7xl shadow-2xl shadow-brand-charcoal/20 border-4 border-white/10 select-none">
                        {student.name.charAt(0)}
                    </div>
                </div>
                <div className="flex-1 space-y-8 text-center lg:text-left">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand-emerald/10 text-brand-emerald rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-brand-emerald/20">
                            <ShieldCheck size={14} /> Identity Verified
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-brand-charcoal dark:text-white tracking-tighter leading-none">{student.name}</h1>
                    </div>
                    <div className="flex flex-wrap justify-center lg:justify-start gap-8">
                        <div className="flex items-center gap-3 text-sm font-bold text-brand-muted group">
                            <div className="p-2 bg-brand-beige/50 dark:bg-white/5 rounded-lg group-hover:bg-brand-emerald/10 transition-colors"><Mail size={18} className="text-brand-emerald" /></div>
                            {student.email}
                        </div>
                        {student.phone && (
                            <div className="flex items-center gap-3 text-sm font-bold text-brand-muted group">
                                <div className="p-2 bg-brand-beige/50 dark:bg-white/5 rounded-lg group-hover:bg-brand-emerald/10 transition-colors"><Phone size={18} className="text-brand-emerald" /></div>
                                {student.phone}
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-sm font-bold text-brand-muted group">
                            <div className="p-2 bg-brand-beige/50 dark:bg-white/5 rounded-lg group-hover:bg-brand-emerald/10 transition-colors"><Calendar size={18} className="text-brand-emerald" /></div>
                            Joined {new Date(student.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="bg-white dark:bg-brand-charcoal p-10 rounded-[48px] border border-brand-border flex items-center gap-8 group hover:shadow-2xl transition-all duration-500">
                    <div className="w-20 h-20 bg-brand-emerald/10 text-brand-emerald rounded-[32px] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <Target size={40} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.3em] mb-1">Engagement</p>
                        <h3 className="text-4xl font-black text-brand-charcoal dark:text-white tracking-tight leading-none group-hover:text-brand-emerald transition-colors">{avgCompletion}%</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-brand-charcoal p-10 rounded-[48px] border border-brand-border flex items-center gap-8 group hover:shadow-2xl transition-all duration-500">
                    <div className="w-20 h-20 bg-blue-500/10 text-blue-600 rounded-[32px] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <Layers size={40} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.3em] mb-1">Operational Nodes</p>
                        <h3 className="text-4xl font-black text-brand-charcoal dark:text-white tracking-tight leading-none group-hover:text-blue-500 transition-colors">{student.cohorts?.length || 0}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-brand-charcoal p-10 rounded-[48px] border border-brand-border flex items-center gap-8 group hover:shadow-2xl transition-all duration-500">
                    <div className="w-20 h-20 bg-amber-500/10 text-amber-600 rounded-[32px] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <BarChart3 size={40} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.3em] mb-1">Proficiency Avg</p>
                        <h3 className="text-4xl font-black text-brand-charcoal dark:text-white tracking-tight leading-none group-hover:text-amber-500 transition-colors">{avgQuizScore}{avgQuizScore !== 'N/A' ? '%' : ''}</h3>
                    </div>
                </div>
            </div>

            {/* Content Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {/* Main: Academic Records */}
                <div className="xl:col-span-8 space-y-8">
                    <div className="bg-white dark:bg-brand-charcoal rounded-[48px] border border-brand-border overflow-hidden shadow-2xl shadow-brand-charcoal/5">
                        <div className="p-10 border-b border-brand-border flex items-center justify-between bg-brand-beige/10 dark:bg-white/5">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-brand-charcoal text-white rounded-xl">
                                    <BookOpen size={20} />
                                </div>
                                <h3 className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">Academic Deployments</h3>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            {student.cohorts && student.cohorts.length > 0 ? student.cohorts.map((cohort: any) => (
                                <div key={cohort.id} className="group border border-brand-border rounded-[32px] overflow-hidden bg-brand-beige/10 dark:bg-white/5 hover:bg-white dark:hover:bg-brand-charcoal/50 hover:shadow-xl transition-all duration-500">
                                    <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                                        <div className="flex items-center gap-6 flex-1">
                                            <div className="relative w-16 h-16 rounded-2xl bg-white dark:bg-brand-charcoal border border-brand-border flex items-center justify-center shadow-sm overflow-hidden group-hover:border-brand-emerald transition-colors">
                                                <span className="text-xl font-black text-brand-charcoal dark:text-white">{Math.round(cohort.pivot?.progress || 0)}%</span>
                                                <div className="absolute bottom-0 left-0 h-1 bg-brand-emerald transition-all duration-1000" style={{ width: `${cohort.pivot?.progress}%` }}></div>
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight group-hover:text-brand-emerald transition-colors">{cohort.name}</h4>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{cohort.course?.title || 'General Curriculum'}</span>
                                                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] ${cohort.pivot?.status === 'inactive' ? 'bg-red-500/10 text-red-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                                                        {cohort.pivot?.status || 'Active'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 w-full md:w-auto">
                                            <button 
                                                onClick={() => setExpandedCohortMap(p => ({ ...p, [cohort.id]: !p[cohort.id] }))}
                                                className={`flex-1 md:flex-none h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-none cursor-pointer flex items-center justify-center gap-2 ${expandedCohortMap[cohort.id] ? 'bg-brand-charcoal text-white' : 'bg-white dark:bg-brand-charcoal border border-brand-border text-brand-muted hover:border-brand-emerald'}`}
                                            >
                                                {expandedCohortMap[cohort.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                Intel
                                            </button>
                                            <button 
                                                onClick={() => toggleActivation(cohort.id, cohort.pivot?.status)}
                                                className={`flex-1 md:flex-none h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-none cursor-pointer ${cohort.pivot?.status === 'inactive' ? 'bg-brand-emerald text-white shadow-lg shadow-brand-emerald/20' : 'bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white'}`}
                                            >
                                                {cohort.pivot?.status === 'inactive' ? 'Authorize' : 'Redact Access'}
                                            </button>
                                        </div>
                                    </div>

                                    {expandedCohortMap[cohort.id] && (
                                        <div className="p-10 bg-white dark:bg-brand-charcoal/50 border-t border-brand-border animate-fade-in-up space-y-10">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <Sparkles className="text-brand-emerald" size={18} />
                                                    <h5 className="text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-widest leading-none">Curriculum Override Protocol</h5>
                                                </div>
                                                <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest leading-relaxed">Manually adjust unit completion status for direct instructional intervention.</p>
                                            </div>

                                            <div className="space-y-8">
                                                {cohort.course?.modules?.map((mod: any) => (
                                                    <div key={mod.id} className="space-y-4">
                                                        <div className="flex items-center justify-between px-2">
                                                            <span className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.3em]">{mod.title}</span>
                                                            <div className="h-[1px] flex-1 bg-brand-border mx-6"></div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {mod.lessons?.map((lesson: any) => {
                                                                const isCompleted = student?.completed_lessons?.some((cl: any) => cl.id === lesson.id);
                                                                return (
                                                                    <div key={lesson.id} className={`p-5 rounded-[24px] border transition-all flex items-center justify-between group ${isCompleted ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-brand-beige/20 dark:bg-white/5 border-brand-border'}`}>
                                                                        <div className="flex items-center gap-4 truncate">
                                                                            <button 
                                                                                onClick={() => toggleLessonCompletion(lesson.id, !!isCompleted)}
                                                                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border-none cursor-pointer shrink-0 ${isCompleted ? 'bg-brand-emerald text-white' : 'bg-white dark:bg-brand-charcoal border-2 border-brand-border text-brand-muted hover:border-brand-emerald'}`}
                                                                            >
                                                                                {isCompleted ? <CheckCircle2 size={18} /> : <div className="w-2 h-2 rounded-full bg-brand-border"></div>}
                                                                            </button>
                                                                            <span className={`text-xs font-black uppercase truncate tracking-tight transition-all ${isCompleted ? 'text-brand-emerald opacity-60 line-through' : 'text-brand-charcoal dark:text-white'}`}>
                                                                                {lesson.title}
                                                                            </span>
                                                                        </div>
                                                                        <div className="px-3 py-1 bg-white dark:bg-brand-charcoal border border-brand-border rounded-lg text-[8px] font-black text-brand-muted uppercase tracking-widest">{lesson.type}</div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )) : (
                                <div className="py-24 text-center space-y-6">
                                    <div className="w-20 h-20 bg-brand-beige dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-brand-muted/30 border border-brand-border border-dashed">
                                        <Zap size={32} />
                                    </div>
                                    <div className="space-y-1">
                                        <h5 className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">No Active Linkages</h5>
                                        <p className="text-xs font-medium text-brand-muted">This cadet profile currently has no operational enrollment records.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quiz Results Section */}
                    <div className="bg-white dark:bg-brand-charcoal rounded-[48px] border border-brand-border overflow-hidden shadow-2xl shadow-brand-charcoal/5">
                        <div className="p-10 border-b border-brand-border flex items-center justify-between bg-brand-beige/10 dark:bg-white/5">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-amber-500 text-white rounded-xl">
                                    <HelpCircle size={20} />
                                </div>
                                <h3 className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">Comprehension Assessments</h3>
                            </div>
                        </div>
                        <div className="p-8">
                             {student.completed_lessons && student.completed_lessons.filter((l: any) => l.type === 'quiz' || (l.quiz_data && l.quiz_data !== 'null' && l.quiz_data !== '{}') || l.pivot?.score != null).length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {student.completed_lessons.filter((l: any) => l.type === 'quiz' || (l.quiz_data && l.quiz_data !== 'null' && l.quiz_data !== '{}') || l.pivot?.score != null).map((lesson: any) => {
                                         const isPass = (lesson.pivot?.score || 0) >= (lesson.quiz_data?.pass_mark || 80);
                                         return (
                                            <div key={lesson.id} className="p-6 bg-brand-beige/10 dark:bg-white/5 border border-brand-border rounded-[32px] flex items-center justify-between group hover:border-brand-emerald transition-all">
                                                <div className="flex items-center gap-5 truncate">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner ${isPass ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                                                        {lesson.pivot?.score || 0}%
                                                    </div>
                                                    <div className="truncate space-y-1">
                                                        <h5 className="text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-tight truncate">{lesson.title}</h5>
                                                        <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">{new Date(lesson.pivot?.updated_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <button className="w-10 h-10 bg-white dark:bg-brand-charcoal border border-brand-border rounded-xl flex items-center justify-center text-brand-muted hover:text-brand-emerald transition-all border-none cursor-pointer"><ArrowUpRight size={18} /></button>
                                            </div>
                                         );
                                    })}
                                </div>
                            ) : (
                                <div className="py-16 text-center text-brand-muted italic text-xs font-bold uppercase tracking-widest">No assessment artifacts detected.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Intelligence Log */}
                <div className="xl:col-span-4 space-y-8 sticky top-32">
                    <div className="bg-brand-charcoal dark:bg-brand-emerald p-10 rounded-[48px] text-white space-y-8 shadow-2xl shadow-brand-charcoal/20">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white/10 rounded-xl">
                                <Sparkles size={20} />
                            </div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Profile Intelligence</h4>
                        </div>
                        <p className="text-sm font-medium leading-relaxed opacity-80">
                            Cadet has maintained a <span className="font-black text-white">{avgCompletion}% operational efficiency</span> across synchronized learning phases.
                        </p>
                        <div className="h-[1px] bg-white/10"></div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                <span>Sync Protocol</span>
                                <span className="text-brand-emerald bg-white px-2 py-0.5 rounded-lg">High Density</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-white transition-all duration-1000" style={{ width: `${avgCompletion}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-brand-charcoal rounded-[48px] border border-brand-border p-10 space-y-8 shadow-sm">
                        <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-[0.3em]">Operational Timeline</h4>
                        <div className="space-y-8">
                             <div className="flex gap-6 relative">
                                <div className="absolute top-10 left-6 bottom-0 w-[2px] bg-brand-border"></div>
                                <div className="w-12 h-12 bg-brand-emerald text-white rounded-2xl flex items-center justify-center font-black text-xs shrink-0 z-10 shadow-lg shadow-brand-emerald/20">
                                    <Zap size={18} />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Account Initialized</div>
                                    <div className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{new Date(student.created_at).toLocaleString()}</div>
                                </div>
                            </div>
                            {student.cohorts?.slice(0, 3).map((c: any, i: number) => (
                                <div key={c.id} className="flex gap-6 relative">
                                    {i < 2 && <div className="absolute top-10 left-6 bottom-0 w-[2px] bg-brand-border"></div>}
                                    <div className="w-12 h-12 bg-brand-beige dark:bg-white/10 text-brand-muted rounded-2xl flex items-center justify-center font-black text-xs shrink-0 z-10 border border-brand-border">
                                        <Layers size={18} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Phase Linkage: {c.name}</div>
                                        <div className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{new Date(c.pivot?.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showDeactivateModal && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 animate-fade-in">
                    <div className="absolute inset-0 bg-brand-charcoal/90 backdrop-blur-2xl" onClick={() => setShowDeactivateModal(false)}></div>
                    <div className="relative w-full max-w-lg bg-white dark:bg-brand-charcoal rounded-[48px] p-12 space-y-10 shadow-2xl animate-scale-up">
                        <div className="space-y-3">
                            <h3 className="text-3xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Redact Authorization</h3>
                            <p className="text-brand-muted font-medium leading-relaxed italic">You are about to suspend cadet access to the operational node. Define the rationale for this redaction.</p>
                        </div>
                        <textarea 
                            className="w-full p-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[32px] focus:outline-none focus:border-brand-emerald font-bold h-40 resize-none" 
                            placeholder="Reason for access suspension..."
                            value={deactivateMessage}
                            onChange={(e) => setDeactivateMessage(e.target.value)}
                        />
                        <div className="flex gap-4">
                            <button onClick={() => setShowDeactivateModal(false)} className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest text-brand-muted hover:bg-brand-beige transition-all border-none cursor-pointer">Abort</button>
                            <button onClick={() => toggleActivation(pendingCohortId!, 'active', deactivateMessage)} className="flex-1 h-14 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-600/20 hover:scale-105 transition-all border-none cursor-pointer">Confirm Redaction</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
