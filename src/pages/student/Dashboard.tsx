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
    Download,
    Check,
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
            <section className="relative h-full sm:h-full md:h-80 rounded-xl overflow-hidden group shadow-2xl p-2">
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
                            className="bg-brand-emerald hover:bg-brand-emerald/90  px-8 py-4 rounded-lg font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand-emerald/20 flex items-center gap-3 active:scale-95"
                        >
                           <span className='text-white dark:text-muted'>Continue Journey</span>  <ArrowRight size={16} className='text-white' />
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
            <div className="grid md:grid-cols-2 grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
                {stats.map(({ label, value, icon: Icon, color, bg }, idx) => (
                    <div key={idx} className="bg-white dark:bg-brand-charcoal p-6 rounded-2xl border border-brand-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group ">
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-2xl ${bg} ${color} transition-transform group-hover:scale-110`}>
                                <Icon size={24} />
                            </div>
                            <div>
                                <div className="text-2xl md:text-3xl font-black text-brand-charcoal dark:text-white leading-none mb-1 text-wrap">{value}</div>
                                <div className="text-[0.6em] font-black text-brand-muted uppercase tracking-widest text-wrap">{label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left: Course Progress */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-brand-charcoal rounded-2xl border border-brand-border overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-brand-border flex items-center justify-between">
                            <h3 className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Active Courses</h3>
                            <Link to="/student/courses" className="text-xs font-black text-brand-emerald hover:underline underline-offset-4 uppercase tracking-widest flex items-center gap-2">
                                View All <ChevronRight size={16} />
                            </Link>
                        </div>

                        <div className="p-4 space-y-4">
                            {enrollments.length > 0 ? (
  <div className="grid gap-6">
    {enrollments.map((cohort: any) => {
      const progress = cohort.pivot?.progress || 0;
      const isCompleted = progress >= 100;
      const cert = certificates.find((c) => Number(c.course_id) === Number(cohort.course?.id));
      const lessons = cohort.course?.modules?.reduce(
        (total: number, module: any) => total + (module.lessons?.length || 0),
        0
      );

      return (
        <div
          key={cohort.id}
          className="group relative bg-white dark:bg-white/5 border border-brand-border rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-brand-charcoal/5 hover:-translate-y-1"
        >
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Icon Section */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-brand-beige dark:bg-white/10 flex items-center justify-center text-4xl shadow-inner border border-brand-border/50 group-hover:rotate-3 transition-transform duration-300">
                {getCourseIcon(cohort.course?.title || 'Course')}
              </div>
              {isCompleted && (
                <div className="absolute -top-2 -right-2 bg-brand-emerald text-white p-1 rounded-full shadow-lg border-2 border-white dark:border-brand-charcoal">
                  <Check size={14} strokeWidth={3} />
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-emerald opacity-80">
                  {isCompleted ? 'Course Completed' : 'In Progress'}
                </span>
                <h4 className="text-xl font-bold text-brand-charcoal dark:text-white truncate tracking-tight">
                  {cohort.course?.title || cohort.name}
                </h4>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-brand-muted dark:text-white/60">
                <div className="flex items-center gap-1.5">
                  <BookOpen size={14} />
                  {lessons} {lessons === 1 ? 'Lesson' : 'Lessons'}
                </div>
                <div className="w-1 h-1 rounded-full bg-brand-border" />
                <div>{progress}% Completed</div>
              </div>

              {/* Modern Progress Bar */}
              <div className="relative w-full h-1.5 bg-brand-beige dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-brand-emerald transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Action Section */}
            <div className="shrink-0 w-full md:w-auto">
              {isCompleted ? (
                cert ? (
                  <button
                    onClick={() => downloadCertificate(cert.certificate_uuid)}
                    className="w-full md:w-auto px-6 py-3 bg-brand-charcoal text-white dark:bg-white dark:text-brand-charcoal rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Certificate
                  </button>
                ) : (
                  <button
                    onClick={() => handleClaimCertificate(cohort.course?.id)}
                    disabled={claiming === cohort.course?.id}
                    className="w-full md:w-auto px-6 py-3 bg-brand-emerald text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {claiming === cohort.course?.id ? <Loader2 size={16} className="animate-spin" /> : 'Claim Reward'}
                  </button>
                )
              ) : (
                <Link
                  to={`/student/courses/${cohort.course?.id}?cohortId=${cohort.id}`}
                  className="w-full md:w-auto flex items-center justify-center gap-3 px-6 py-3 bg-brand-emerald text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:shadow-lg hover:shadow-brand-emerald/30 transition-all active:scale-95"
                >
                  Resume Progress
                  <Play size={14} fill="currentColor" />
                </Link>
              )}
            </div>
          </div>
        </div>
      );
    })}
  </div>
) : (
  <div className="py-24 text-center bg-brand-beige/30 dark:bg-white/5 rounded-3xl border-2 border-dashed border-brand-border">
    <div className="w-20 h-20 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm">
      ✨
    </div>
    <h5 className="text-xl font-bold text-brand-charcoal dark:text-white mb-2">
      Ready to start something new?
    </h5>
    <p className="text-brand-muted max-w-xs mx-auto mb-8">
      You aren't enrolled in any courses yet. Your learning journey is just a click away.
    </p>
    <Link
      to="/student/courses"
      className="inline-flex items-center gap-2 bg-brand-charcoal text-white dark:bg-white dark:text-brand-charcoal px-8 py-4 rounded-2xl font-bold text-sm transition-transform hover:scale-105"
    >
      Browse Courses <ArrowRight size={18} />
    </Link>
  </div>
)}
                        </div>
                    </div>
                </div>

                {/* Right: Live Sessions */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-brand-charcoal rounded-xl border border-brand-border overflow-hidden shadow-sm sticky top-24">
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
                                    <div key={session.id} className="p-5 rounded-lg bg-brand-beige/30 dark:bg-white/5 border border-brand-border group hover:border-brand-charcoal/30 transition-colors">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
                                            <Clock size={14} className={status === 'live' ? 'text-red-500' : ''} />
                                            <span className={status === 'live' ? 'text-red-500' : ''}>
                                                {isToday ? 'Today' : sessionDate.toLocaleDateString()}, {session.start_time.substring(0, 5)}
                                            </span>
                                        </div>

                                        <h6 className="font-black text-brand-charcoal dark:text-white mb-2 leading-snug line-clamp-2">{session.title}</h6>

                                        <p className="text-xs font-bold text-brand-muted mb-6">{session.course?.title}                                        <span className="px-1 py-1 m-1 bg-gray-100  text-gray-400 rounded-md font-black text-[10px] uppercase transition-all items-center  disabled:opacity-50">ENDED</span>
                                        </p>

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
                        className="bg-white dark:bg-brand-charcoal w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl border border-brand-border animate-in zoom-in-95 duration-200"
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
