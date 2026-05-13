import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Play,
    CheckCircle2,
    BookOpen,
    Clock,
    ArrowRight,
    Star,
    Video,
    ChevronRight,
    Loader2,
    Maximize2,
    X,
    FileVideo,
    Sparkles,
    Trophy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function StudentDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [liveSessions, setLiveSessions] = useState<any[]>([]);
    const [certificates, setCertificates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState<number | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
            const token = localStorage.getItem('token');

            try {
                const [enrollmentsRes, sessionsRes, certsRes] = await Promise.all([
                    fetch(`${API_URL}/my-enrollments`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${API_URL}/student/live-sessions`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${API_URL}/certificates`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (enrollmentsRes.status === 401 || sessionsRes.status === 401 || certsRes.status === 401) {
                    logout();
                    navigate('/login');
                    return;
                }

                if (enrollmentsRes.ok) {
                    const data = await enrollmentsRes.json();
                    if (data.cohorts) {
                        setEnrollments(data.cohorts);
                    }
                }

                if (sessionsRes.ok) {
                    const data = await sessionsRes.json();
                    setLiveSessions(data);
                }

                if (certsRes.ok) {
                    const data = await certsRes.json();
                    setCertificates(data);
                }
            } catch (err: any) {
                console.error("Fetch Student Dashboard Error:", err);
                if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
                    toast.error('Connection failed. Redirecting to login...');
                    setTimeout(() => {
                        logout();
                        navigate('/login');
                    }, 2000);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const firstName = user?.name?.split(' ')[0] || 'Student';

    const getCourseIcon = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes('design') || t.includes('ui/ux')) return '🎨';
        if (t.includes('frontend') || t.includes('developer') || t.includes('code')) return '💻';
        if (t.includes('test') || t.includes('qa')) return '🧪';
        if (t.includes('data')) return '📊';
        return '📚';
    };

    const getSessionStatus = (session: any) => {
        const now = new Date();
        const start = new Date(`${session.scheduled_date}T${session.start_time}`);
        const end = new Date(`${session.scheduled_date}T${session.end_time}`);

        if (now >= start && now <= end) return 'live';
        if (now < start) return 'upcoming';
        return 'ended';
    };

    const handleClaimCertificate = async (courseId: number) => {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        const token = localStorage.getItem('token');
        setClaiming(courseId);

        try {
            const res = await fetch(`${API_URL}/certificates/claim/${courseId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('Certificate generated successfully!');
                const certsRes = await fetch(`${API_URL}/certificates`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (certsRes.ok) setCertificates(await certsRes.json());
            } else {
                toast.error(data.message || 'Failed to claim certificate');
            }
        } catch (err) {
            toast.error('An error occurred while claiming your certificate.');
        } finally {
            setClaiming(null);
        }
    };

    const downloadCertificate = async (uuid: string) => {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/certificates/download/${uuid}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Certificate-${uuid}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            window.open(`${API_URL}/certificates/download/${uuid}`, '_blank');
        }
    };

    const stats = [
        { label: 'Enrolled Courses', value: enrollments.length.toString(), icon: BookOpen, color: 'text-brand-emerald', bg: 'bg-brand-emerald/10' },
        { label: 'Live Sessions', value: liveSessions.length.toString(), icon: Video, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { label: 'Completed', value: enrollments.filter(e => e.pivot?.progress === 100).length.toString(), icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Certificates', value: certificates.length.toString(), icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ];

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
                <Loader2 size={40} className="animate-spin text-brand-emerald" />
                <p className="text-brand-muted font-black text-xs uppercase tracking-widest animate-pulse">Syncing Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Hero Section */}
            <section className="relative h-64 md:h-80 rounded-[40px] overflow-hidden group shadow-2xl">
                <img
                    src="/learning_journey_hero.png"
                    alt="Hero"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-brand-charcoal via-brand-charcoal/60 to-transparent" />
                
                <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 max-w-2xl">
                    <div className="flex items-center gap-3 mb-4 animate-fade-in-up">
                        <div className="p-2 bg-brand-emerald/20 backdrop-blur-md rounded-lg border border-brand-emerald/30">
                            <Sparkles className="text-brand-emerald" size={18} />
                        </div>
                        <span className="text-brand-emerald font-black text-xs uppercase tracking-[0.2em]">Learning Portal</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-4 animate-fade-in-up delay-100">
                        Welcome back, <span className="text-brand-emerald">{firstName}</span>
                    </h1>
                    <p className="text-white/70 font-medium text-sm md:text-lg mb-8 animate-fade-in-up delay-200">
                        Your progress this week is exceptional. Complete your next lesson to maintain your streak.
                    </p>
                    <div className="flex items-center gap-4 animate-fade-in-up delay-300">
                        <Link 
                            to="/student/courses" 
                            className="bg-brand-emerald hover:bg-brand-emerald/90 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand-emerald/20 flex items-center gap-3 active:scale-95"
                        >
                            Continue Journey <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>

                {/* Decorative floating icon */}
                <div className="absolute top-1/2 right-12 -translate-y-1/2 hidden lg:block animate-float">
                    <div className="w-24 h-24 bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 flex items-center justify-center shadow-2xl">
                        <Star className="text-brand-emerald fill-brand-emerald" size={40} />
                    </div>
                </div>
            </section>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {stats.map(({ label, value, icon: Icon, color, bg }, idx) => (
                    <div key={idx} className="bg-white dark:bg-brand-charcoal p-6 rounded-[32px] border border-brand-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-2xl ${bg} ${color} transition-transform group-hover:scale-110`}>
                                <Icon size={24} />
                            </div>
                            <div>
                                <div className="text-2xl md:text-3xl font-black text-brand-charcoal dark:text-white leading-none mb-1">{value}</div>
                                <div className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left: Course Progress */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-brand-charcoal rounded-[40px] border border-brand-border overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-brand-border flex items-center justify-between">
                            <h3 className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Active Courses</h3>
                            <Link to="/student/courses" className="text-xs font-black text-brand-emerald hover:underline underline-offset-4 uppercase tracking-widest flex items-center gap-2">
                                View All <ChevronRight size={16} />
                            </Link>
                        </div>

                        <div className="p-4 space-y-4">
                            {enrollments.length > 0 ? enrollments.map((cohort: any) => {
                                const progress = cohort.pivot?.progress || 0;
                                const isCompleted = progress >= 100;
                                const cert = certificates.find(c => Number(c.course_id) === Number(cohort.course?.id));

                                return (
                                    <div key={cohort.id} className="p-6 rounded-[32px] hover:bg-brand-beige/50 dark:hover:bg-white/5 transition-all border border-transparent hover:border-brand-border group">
                                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-brand-beige dark:bg-white/5 flex items-center justify-center text-3xl shadow-inner border border-brand-border shrink-0 group-hover:scale-105 transition-transform">
                                                {getCourseIcon(cohort.course?.title || 'Course')}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-lg font-black text-brand-charcoal dark:text-white truncate mb-4">{cohort.course?.title || cohort.name}</h4>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1 h-2 bg-brand-beige dark:bg-white/5 rounded-full overflow-hidden border border-brand-border">
                                                        <div 
                                                            className="h-full bg-brand-emerald rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-black text-brand-charcoal dark:text-white w-10">{progress}%</span>
                                                </div>
                                            </div>

                                            <div className="shrink-0 flex items-center gap-3">
                                                {isCompleted ? (
                                                    cert ? (
                                                        <button 
                                                            onClick={() => downloadCertificate(cert.certificate_uuid)} 
                                                            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                                                        >
                                                            Download Certificate
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleClaimCertificate(cohort.course?.id)}
                                                            disabled={claiming === cohort.course?.id}
                                                            className="px-6 py-3 bg-brand-emerald hover:bg-brand-emerald/90 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-brand-emerald/20 flex items-center gap-2 disabled:opacity-50"
                                                        >
                                                            {claiming === cohort.course?.id ? <Loader2 size={14} className="animate-spin" /> : 'Claim Certificate'}
                                                        </button>
                                                    )
                                                ) : (
                                                    <Link
                                                        to={`/student/courses/${cohort.course?.id}?cohortId=${cohort.id}`}
                                                        className="w-12 h-12 rounded-2xl bg-brand-charcoal dark:bg-brand-emerald text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl shadow-brand-charcoal/20"
                                                    >
                                                        <Play size={20} fill="currentColor" className="ml-1" />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="py-20 text-center">
                                    <div className="w-24 h-24 bg-brand-beige dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl grayscale opacity-50">📚</div>
                                    <h5 className="text-brand-charcoal dark:text-white font-black uppercase tracking-widest mb-2">No Active Enrollments</h5>
                                    <p className="text-brand-muted font-medium text-sm mb-8">Start your learning journey today by exploring our courses.</p>
                                    <Link to="/student/courses" className="inline-flex items-center gap-2 bg-brand-emerald text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
                                        Explore Courses <ArrowRight size={16} />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Live Sessions */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-brand-charcoal rounded-[40px] border border-brand-border overflow-hidden shadow-sm sticky top-24">
                        <div className="p-8 border-b border-brand-border flex items-center justify-between">
                            <h3 className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Live Classes</h3>
                            <div className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        </div>

                        <div className="p-6 space-y-4">
                            {liveSessions.length > 0 ? liveSessions.slice(0, 4).map((session: any) => {
                                const sessionDate = new Date(session.scheduled_date);
                                const isToday = sessionDate.toDateString() === new Date().toDateString();
                                const status = getSessionStatus(session);

                                return (
                                    <div key={session.id} className="p-5 rounded-[24px] bg-brand-beige dark:bg-white/5 border border-brand-border group hover:border-brand-emerald transition-colors">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
                                            <Clock size={14} className={status === 'live' ? 'text-red-500' : ''} />
                                            <span className={status === 'live' ? 'text-red-500' : ''}>
                                                {isToday ? 'Today' : sessionDate.toLocaleDateString()}, {session.start_time.substring(0, 5)}
                                            </span>
                                        </div>

                                        <h6 className="font-black text-brand-charcoal dark:text-white mb-2 leading-snug line-clamp-2">{session.title}</h6>
                                        <p className="text-xs font-bold text-brand-muted mb-6">{session.course?.title}</p>

                                        {status === 'ended' ? (
                                            <button
                                                onClick={() => session.recording_link && setPreviewUrl(session.recording_link)}
                                                disabled={!session.recording_link}
                                                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                    session.recording_link
                                                        ? 'bg-brand-charcoal dark:bg-white/10 text-white hover:opacity-80'
                                                        : 'bg-brand-beige dark:bg-white/5 text-brand-muted border border-brand-border cursor-not-allowed'
                                                }`}
                                            >
                                                {session.recording_link ? <><FileVideo size={14} /> Watch Recording</> : 'Recording Pending'}
                                            </button>
                                        ) : (
                                            <a
                                                href={session.meeting_link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                    status === 'live'
                                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                                        : 'bg-brand-charcoal dark:bg-brand-emerald text-white hover:scale-105 shadow-lg'
                                                }`}
                                            >
                                                {status === 'live' ? 'Join Live Now' : 'Launch Session'}
                                            </a>
                                        )}
                                    </div>
                                );
                            }) : (
                                <div className="py-12 text-center">
                                    <div className="w-16 h-16 bg-brand-beige dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl grayscale opacity-50">🎥</div>
                                    <p className="text-xs font-black text-brand-muted uppercase tracking-widest">No scheduled sessions</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Video Preview Modal */}
            {previewUrl && (
                <div
                    className="fixed inset-0 bg-brand-charcoal/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in"
                    onClick={() => setPreviewUrl(null)}
                >
                    <div
                        className="bg-white dark:bg-brand-charcoal w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl border border-brand-border animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-8 py-6 border-b border-brand-border flex justify-between items-center">
                            <h3 className="font-black text-brand-charcoal dark:text-white flex items-center gap-3 uppercase tracking-widest text-sm">
                                <Maximize2 size={18} className="text-brand-muted" /> Session Recording
                            </h3>
                            <button
                                onClick={() => setPreviewUrl(null)}
                                className="w-10 h-10 rounded-full bg-brand-beige dark:bg-white/10 text-brand-muted flex items-center justify-center hover:text-red-500 transition-colors border-none cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="w-full bg-black aspect-video">
                            <video
                                src={previewUrl}
                                controls
                                autoPlay
                                className="w-full h-full"
                                controlsList="nodownload"
                                onContextMenu={(e) => e.preventDefault()}
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
