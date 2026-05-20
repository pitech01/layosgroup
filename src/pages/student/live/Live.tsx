import { useState, useEffect } from 'react';
import { Calendar, Clock, Video, User, Inbox, FileVideo, X, Maximize2, PlayCircle, Filter, ArrowRight, Activity, Sparkles } from 'lucide-react';
import { SkeletonAssignmentList } from '../../../components/common/SkeletonLoader';

interface LiveSession {
    id: number;
    title: string;
    course_id: number;
    course: {
        title: string;
    };
    scheduled_date: string;
    start_time: string;
    end_time: string;
    meeting_link: string;
    instructor_name: string;
    recording_link?: string;
}

const Live = () => {
    const [sessions, setSessions] = useState<LiveSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const sessResponse = await fetch(`${API_URL}/student/live-sessions`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const sessData = await sessResponse.json();

                const coursesResponse = await fetch(`${API_URL}/student/my-courses`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const coursesData = await coursesResponse.json();

                let combinedSessions: LiveSession[] = Array.isArray(sessData) ? sessData : [];

                if (Array.isArray(coursesData)) {
                    coursesData.forEach((course: any) => {
                        if (course.modules) {
                            course.modules.forEach((mod: any) => {
                                if (mod.lessons) {
                                    mod.lessons.forEach((lesson: any) => {
                                        if (lesson.type === 'live' && lesson.live_date) {
                                            const exists = combinedSessions.some(s =>
                                                s.title === lesson.title &&
                                                s.scheduled_date === lesson.live_date
                                            );

                                            if (!exists) {
                                                combinedSessions.push({
                                                    id: lesson.id,
                                                    title: lesson.title,
                                                    course_id: course.id,
                                                    course: { title: course.title },
                                                    scheduled_date: lesson.live_date,
                                                    start_time: lesson.live_time || '00:00:00',
                                                    end_time: lesson.live_end_time || '01:00:00',
                                                    meeting_link: lesson.live_link || '#',
                                                    instructor_name: course.instructor?.name || 'Academic Faculty',
                                                    recording_link: lesson.video_url
                                                });
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    });
                }

                setSessions(combinedSessions);
            } catch (err) {
                console.error("Fetch Live Data Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [API_URL]);

    const [selectedCourseId, setSelectedCourseId] = useState<string>('all');

    const getSessionStatus = (session: LiveSession) => {
        const now = new Date();
        const start = new Date(`${session.scheduled_date}T${session.start_time}`);
        const end = new Date(`${session.scheduled_date}T${session.end_time}`);

        if (now >= start && now <= end) return 'live';
        if (now < start) return 'upcoming';
        return 'ended';
    };

    const courses = Array.from(new Set(sessions.filter((s: any) => s.course).map((s: any) => JSON.stringify(s.course))))
        .map((str: any) => JSON.parse(str));

    const filteredSessions = sessions.filter((s: LiveSession) =>
        selectedCourseId === 'all' || s.course_id.toString() === selectedCourseId
    );

    const upcomingSessions = filteredSessions.filter((s: LiveSession) => getSessionStatus(s) !== 'ended');
    const pastSessions = filteredSessions.filter((s: LiveSession) => getSessionStatus(s) === 'ended');

    return (
        <div className="space-y-12 pb-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-fade-in-up">
                <div className="max-w-2xl space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-emerald/10 rounded-lg">
                            <Video className="text-brand-emerald" size={18} />
                        </div>
                        <span className="text-brand-emerald font-black text-xs uppercase tracking-widest">Real-time Instruction</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-brand-charcoal dark:text-white tracking-tight">
                        Live <span className="text-brand-emerald">Broadcasts</span>
                    </h1>
                    <p className="text-brand-muted font-medium text-lg leading-relaxed">
                        Access synchronous classroom sessions, engage with faculty in real-time, and review archived instructional recordings.
                    </p>
                </div>

                {sessions.length > 0 && (
                    <div className="relative group min-w-[240px]">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted z-10">
                            <Filter size={16} />
                        </div>
                        <select
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                            className="w-full h-14 pl-12 pr-10 bg-white dark:bg-brand-charcoal border border-brand-border rounded-2xl appearance-none focus:outline-none focus:ring-4 focus:ring-brand-emerald/10 focus:border-brand-emerald transition-all text-brand-charcoal dark:text-white font-black text-xs uppercase tracking-widest cursor-pointer shadow-sm"
                        >
                            <option value="all">All Enrolled Courses</option>
                            {courses.map((course: any) => (
                                <option key={course.id} value={course.id}>{course.title}</option>
                            ))}
                        </select>
                    </div>
                )}
            </header>

            {/* Upcoming Sessions Section */}
            <section className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.5)]" />
                    <h2 className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Active & Upcoming</h2>
                </div>

                {loading ? (
                    <SkeletonAssignmentList/>
                ) : upcomingSessions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {upcomingSessions.map((session: LiveSession) => {
                            const status = getSessionStatus(session);
                            return (
                                <div key={session.id} className="bg-white dark:bg-brand-charcoal rounded-xl border border-brand-border p-8 flex flex-col hover:shadow-2xl hover:shadow-brand-emerald/10 transition-all duration-500 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                                        <Video size={120} />
                                    </div>

                                    <div className="relative z-10 flex-1 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <span className="px-3 py-1 bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 rounded-lg text-[10px] font-black uppercase tracking-widest truncate max-w-[150px]">
                                                {session.course?.title}
                                            </span>
                                            {status === 'live' && (
                                                <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse shadow-lg shadow-red-500/30">
                                                    <span className="w-1.5 h-1.5 bg-white rounded-full" /> Live
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="text-2xl font-black text-brand-charcoal dark:text-white tracking-tight leading-tight group-hover:text-brand-emerald transition-colors line-clamp-2">
                                            {session.title}
                                        </h3>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-brand-muted font-bold text-xs uppercase tracking-widest">
                                                <User size={16} className="text-brand-emerald" />
                                                <span>{session.instructor_name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-brand-muted font-bold text-xs uppercase tracking-widest">
                                                <Calendar size={16} className="text-brand-emerald" />
                                                <span>{new Date(session.scheduled_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-brand-muted font-bold text-xs uppercase tracking-widest">
                                                <Clock size={16} className="text-brand-emerald" />
                                                <span>{session.start_time.substring(0, 5)} - {session.end_time.substring(0, 5)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <a
                                        href={session.meeting_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`
                                            mt-8 w-full h-14 flex items-center justify-center gap-2 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 no-underline border-none cursor-pointer
                                            ${status === 'live' 
                                                ? 'bg-red-500 text-white shadow-md shadow-red-500/20' 
                                                : 'bg-brand-charcoal dark:bg-brand-emerald text-white shadow-md shadow-brand-charcoal/20 dark:shadow-brand-emerald/20 hover:scale-105'}
                                        `}
                                    >
                                        {status === 'live' ? <><Activity size={18} /> Enter Live Room</> : 'View Session Details'}
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-brand-charcoal py-24 text-center rounded-xl border border-brand-border border-dashed shadow-sm space-y-6">
                        <div className="w-20 h-20 bg-brand-beige dark:bg-white/5 rounded-[32px] flex items-center justify-center mx-auto text-brand-muted/30">
                            <Inbox size={40} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">No Active Sessions</h3>
                            <p className="text-brand-muted font-medium max-w-md mx-auto">All instructional streams are currently offline. Check the calendar for upcoming scheduling.</p>
                        </div>
                    </div>
                )}
            </section>

            {/* Past Sessions & Recordings Section */}
            {pastSessions.length > 0 && (
                <section className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-beige dark:bg-white/5 rounded-xl">
                            <PlayCircle size={18} className="text-brand-muted" />
                        </div>
                        <h2 className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Archived Recordings</h2>
                    </div>

                    <div className="bg-white dark:bg-brand-charcoal rounded-xl border border-brand-border overflow-hidden shadow-sm">
                        {pastSessions.map((session: LiveSession, idx: number) => (
                            <div 
                                key={session.id} 
                                className={`
                                    p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group transition-colors
                                    ${idx !== pastSessions.length - 1 ? 'border-b border-brand-border' : ''}
                                    hover:bg-brand-beige/20 dark:hover:bg-white/5
                                `}
                            >
                                <div className="space-y-3 flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{session.course?.title}</span>
                                        {session.recording_link && (
                                            <span className="flex items-center gap-1.5 text-[10px] font-black text-brand-emerald uppercase tracking-widest">
                                                <Sparkles size={12} /> High Fidelity
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="text-xl font-black text-brand-charcoal dark:text-white tracking-tight truncate group-hover:text-brand-emerald transition-colors">{session.title}</h4>
                                    <div className="flex flex-wrap gap-6 text-[10px] font-black text-brand-muted uppercase tracking-widest">
                                        <span className="flex items-center gap-2">
                                            <Calendar size={14} className="text-brand-emerald" /> {new Date(session.scheduled_date).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <Clock size={14} className="text-brand-emerald" /> {session.start_time.substring(0, 5)} - {session.end_time.substring(0, 5)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => session.recording_link && setPreviewUrl(session.recording_link)}
                                    disabled={!session.recording_link}
                                    className={`
                                        h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border-none cursor-pointer flex items-center gap-3
                                        ${session.recording_link 
                                            ? 'bg-brand-beige dark:bg-white/10 text-brand-charcoal dark:text-white hover:bg-brand-charcoal hover:text-white dark:hover:bg-brand-emerald shadow-sm' 
                                            : 'bg-transparent text-brand-muted/30 border-2 border-brand-border cursor-not-allowed'}
                                    `}
                                >
                                    {session.recording_link ? <><PlayCircle size={18} /> Launch Archive</> : 'Processing Record'}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Multimedia Preview Overlay */}
            {previewUrl && (
                <div className="fixed inset-0 z-[3000] bg-brand-charcoal/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-brand-charcoal w-full max-w-6xl rounded-xl overflow-hidden shadow-2xl border border-brand-border animate-in zoom-in-95 duration-500">
                        <div className="px-8 py-6 border-b border-brand-border flex justify-between items-center bg-brand-beige/20 dark:bg-white/5 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-brand-emerald text-white flex items-center justify-center shadow-lg shadow-brand-emerald/20">
                                    <Maximize2 size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">Session Recording</h3>
                                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] mt-1">Synchronized Instructional Playback</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setPreviewUrl(null)}
                                className="w-12 h-12 rounded-2xl bg-white dark:bg-white/10 text-brand-muted flex items-center justify-center hover:text-red-500 hover:rotate-90 transition-all border-none cursor-pointer"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="aspect-video bg-black relative flex items-center justify-center">
                            {(() => {
                                const getCleanUrl = (url: string) => {
                                    if (!url) return '';
                                    if (url.includes('mediadelivery.net')) return url;
                                    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
                                    if (url.startsWith('/storage')) return `${baseUrl}${url}`;
                                    if (url.includes('localhost:8000') || url.includes('127.0.0.1:8000')) {
                                        return url.replace(/https?:\/\/[^\/]+(?=\/storage)/, baseUrl);
                                    }
                                    return url;
                                };
                                
                                const cleanUrl = getCleanUrl(previewUrl);
                                
                                return cleanUrl.includes('mediadelivery.net') ? (
                                    <iframe
                                        src={cleanUrl}
                                        loading="lazy"
                                        className="w-full h-full border-none"
                                        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                                        allowFullScreen={true}
                                    />
                                ) : (
                                    <video
                                        src={cleanUrl}
                                        controls
                                        autoPlay
                                        className="w-full h-full"
                                        controlsList="nodownload"
                                        onContextMenu={(e: any) => e.preventDefault()}
                                    />
                                );
                            })()}
                        </div>
                        <div className="px-8 py-4 bg-brand-beige/20 dark:bg-brand-charcoal text-center border-t border-brand-border shrink-0">
                            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Layos Virtual Ecosystem • Multimedia Protocol Active</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Live;
