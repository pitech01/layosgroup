import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { PlayCircle, FileText, CheckCircle, ChevronLeft, Clock, Loader2, Video, Calendar, ShieldCheck, BookOpen, Star, Trophy, Download, RefreshCw } from 'lucide-react';
import { SkeletonCourseDetails} from '../../../components/common/SkeletonLoader';

const CourseDetails = () => {
    const { courseId } = useParams();
    const [searchParams] = useSearchParams();
    const cohortId = searchParams.get('cohortId');

    const [course, setCourse] = useState<any>(null);
    const [certificate, setCertificate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(false);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [courseRes, certsRes] = await Promise.all([
                    fetch(`${API_URL}/my-enrollments`, {
                        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${API_URL}/certificates`, {
                        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
                    })
                ]);

                const data = await courseRes.json();
                const certsData = await certsRes.json();

                if (courseRes.ok) {
                    const enrolledCohort = data.cohorts.find((c: any) => c.id == cohortId);
                    if (enrolledCohort) {
                        setCourse({
                            id: enrolledCohort.course.id,
                            title: enrolledCohort.course.title,
                            instructor: enrolledCohort.instructor?.name || 'Assigned Instructor',
                            cohortName: enrolledCohort.name,
                            description: enrolledCohort.course.description,
                            progress: enrolledCohort.pivot.progress || 0,
                            modules: enrolledCohort.course.modules || [],
                            isEnrolled: true,
                            completedLessons: data.completed_lessons || []
                        });
                        
                        const matchingCert = certsData.find((c: any) => c.course_id === enrolledCohort.course.id);
                        if (matchingCert) setCertificate(matchingCert);
                    }
                }
            } catch (err) {
                console.error("Fetch Course Details Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseData();
    }, [courseId, cohortId, API_URL]);

    const handleClaim = async () => {
        if (!course) return;
        setClaiming(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/certificates/claim/${course.id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setCertificate(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setClaiming(false);
        }
    };

    const downloadCert = async (uuid: string) => {
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
            console.error("Download Error:", err);
            window.open(`${API_URL}/certificates/download/${uuid}`, '_blank');
        }
    };

    if (loading) {
        return (
            <SkeletonCourseDetails/>
        );
    }

    if (!course) {
        return (
            <div className="py-24 px-4 text-center bg-white dark:bg-brand-charcoal rounded-xl border border-brand-border scrollbar">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                    <ShieldCheck size={40} />
                </div>
                <h2 className="text-2xl font-black text-brand-charcoal dark:text-white mb-3 uppercase tracking-tight">Access Restricted</h2>
                <p className="text-brand-muted font-medium mb-10 max-w-md mx-auto">We couldn't verify your enrollment in this educational module.</p>
                <Link to="/student/courses" className="inline-flex items-center gap-3 bg-brand-charcoal dark:bg-brand-emerald text-white font-black text-xs uppercase tracking-widest py-4 px-8 rounded-2xl hover:scale-105 transition-all shadow-xl shadow-brand-charcoal/20">
                    <ChevronLeft size={18} /> Return to Courses
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-12">
            <header className="animate-fade-in-up">
                <Link 
                    to="/student/courses" 
                    className="inline-flex items-center gap-2 text-brand-muted font-black text-xs uppercase tracking-widest hover:text-brand-emerald transition-colors group mb-8 bg-transparent border-none cursor-pointer"
                >
                    <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" /> 
                    <span>Course Catalog</span>
                </Link>

                <div className="flex flex-col lg:flex-row justify-between items-start gap-10">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-brand-emerald/10 text-brand-emerald rounded-lg border border-brand-emerald/20 text-[10px] font-black uppercase tracking-widest">
                                {course.cohortName}
                            </div>
                            <span className="text-brand-muted font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                <BookOpen size={14} className="text-brand-emerald" /> Certified Program
                            </span>
                        </div>
                        
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-brand-charcoal dark:text-white tracking-tight leading-none">
                            {course.title}
                        </h1>

                        <p className="text-brand-muted text-lg font-medium flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-brand-beige dark:bg-white/5 flex items-center justify-center text-xs font-black border border-brand-border text-brand-charcoal dark:text-white">
                                {course.instructor.charAt(0)}
                            </span>
                            Mastered by <span className="text-brand-charcoal dark:text-white font-black uppercase tracking-widest text-sm">{course.instructor}</span>
                        </p>
                    </div>

                    <div className="bg-white dark:bg-brand-charcoal p-8 rounded-lg border border-brand-border shadow-sm min-w-full lg:min-w-[340px]">
                        <div className="text-[10px] font-black text-brand-muted mb-4 uppercase tracking-[0.2em]">
                            Global Mastery Status
                        </div>
                        <div className="flex items-center gap-5">
                            <div className="flex-1 bg-brand-beige dark:bg-white/5 h-3 rounded-full overflow-hidden border border-brand-border">
                                <div 
                                    className="bg-brand-emerald h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
                                    style={{ width: `${course.progress}%` }}
                                />
                            </div>
                            <span className="font-black text-3xl text-brand-charcoal dark:text-white tracking-tighter">{course.progress}%</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 xl:gap-16">
                {/* Left Column: Curriculum */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-end justify-between border-b border-brand-border pb-6">
                        <div>
                            <h3 className="text-2xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Academic Modules</h3>
                            <p className="text-brand-muted font-medium text-sm mt-1">Structured learning path for complete mastery.</p>
                        </div>
                        <div className="hidden sm:block text-[10px] font-black text-brand-muted uppercase tracking-widest bg-brand-beige dark:bg-white/5 px-4 py-2 rounded-xl border border-brand-border">
                            {course.modules.length} Total Modules
                        </div>
                    </div>

                    <div className="space-y-6">
                        {course.modules.map((module: any, idx: number) => (
                            <div key={module.id} className="bg-white dark:bg-brand-charcoal rounded-xl border border-brand-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                                <div className="bg-brand-beige/50 dark:bg-white/5 p-6 md:p-8 border-b border-brand-border flex justify-between items-center flex-wrap gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-brand-charcoal text-white flex items-center justify-center font-black text-xs">
                                            {idx + 1}
                                        </div>
                                        <h4 className="m-0 font-black text-brand-charcoal dark:text-white text-lg tracking-tight">{module.title}</h4>
                                    </div>
                                    <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-4 py-2 bg-white dark:bg-brand-charcoal rounded-xl border border-brand-border shadow-sm">
                                        {module.lessons?.length || 0} Units
                                    </span>
                                </div>
                                
                                <div className="p-4 space-y-2">
                                    {module.lessons?.map((lesson: any) => {
                                        const isCompleted = course.completedLessons?.some((cl: any) => cl.id === lesson.id);
                                        return (
                                            <div key={lesson.id} className="flex items-center gap-5 p-5 rounded-[24px] hover:bg-brand-beige/50 dark:hover:bg-white/5 transition-all border border-transparent hover:border-brand-border group">
                                                <div className={`flex items-center justify-center w-12 h-12 rounded-2xl shrink-0 transition-transform group-hover:scale-110 ${isCompleted ? 'bg-brand-emerald text-white shadow-lg shadow-brand-emerald/20' : 'bg-brand-beige dark:bg-white/5 text-brand-muted border border-brand-border'}`}>
                                                    {isCompleted ? <CheckCircle size={20} strokeWidth={3} /> :
                                                        lesson.type === 'live' ? <Video size={20} /> :
                                                            lesson.type === 'material' ? <FileText size={20} /> :
                                                                <PlayCircle size={20} />
                                                    }
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-black text-brand-charcoal dark:text-white text-sm md:text-base truncate mb-1">
                                                        {lesson.title}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-black text-brand-muted uppercase tracking-widest">
                                                        {lesson.type === 'live' ? (
                                                            <>
                                                                <span className="flex items-center gap-1.5"><Calendar size={12} className="text-indigo-400" /> {lesson.live_date || 'TBA'}</span>
                                                                <span className="flex items-center gap-1.5"><Clock size={12} className="text-indigo-400" /> {lesson.live_time || 'TBA'}</span>
                                                            </>
                                                        ) : lesson.type === 'material' ? (
                                                            <span className="flex items-center gap-1.5"><FileText size={12} className="text-emerald-400" /> Knowledge Pack</span>
                                                        ) : (
                                                            <span className="flex items-center gap-1.5"><Clock size={12} className="text-emerald-400" /> {lesson.duration || 'Video Unit'}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <Link
                                                    to={`/student/courses/${courseId}/lesson/${lesson.id}?cohortId=${cohortId}`}
                                                    className={`shrink-0 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 border-none cursor-pointer ${
                                                        isCompleted 
                                                            ? 'bg-brand-beige dark:bg-white/5 text-brand-charcoal dark:text-white border border-brand-border hover:bg-brand-charcoal hover:text-white' 
                                                            : 'bg-brand-emerald text-white hover:bg-brand-emerald/90 hover:shadow-xl hover:shadow-brand-emerald/20'
                                                    }`}
                                                >
                                                    {isCompleted ? 'Review' : 'Start'}
                                                </Link>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Info & Certificates */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-brand-charcoal p-8 rounded-xl border border-brand-border shadow-sm sticky top-24 space-y-10">
                        <div>
                            <h4 className="flex items-center gap-3 text-lg font-black text-brand-charcoal dark:text-white mb-6 uppercase tracking-tight">
                                <BookOpen size={20} className="text-brand-emerald" /> Syllabus Info
                            </h4>
                            <p className="text-brand-muted text-sm leading-relaxed font-medium">
                                {course.description}
                            </p>
                        </div>

                        {Number(course.progress) >= 100 && (
                            <div className="bg-brand-charcoal p-8 rounded-[32px] text-white relative overflow-hidden group border border-white/10 shadow-2xl">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-emerald/20 rounded-bl-[100px] blur-2xl pointer-events-none transition-transform group-hover:scale-150" />
                                
                                <div className="relative z-10 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-inner">
                                            <Trophy size={32} className="text-brand-emerald" strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black uppercase tracking-tight leading-none">Achievement</h4>
                                            <span className="text-[10px] font-black text-brand-emerald uppercase tracking-widest">100% Verified</span>
                                        </div>
                                    </div>
                                    
                                    <p className="text-white/60 text-[11px] font-black uppercase tracking-widest leading-loose">
                                        Exceptional performance detected. Your digital credentials are ready for activation.
                                    </p>
                                    
                                    {certificate ? (
                                        <div className="space-y-3 pt-2">
                                            <button
                                                onClick={() => downloadCert(certificate.certificate_uuid)}
                                                className="w-full bg-brand-emerald text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-brand-emerald/30 hover:scale-105 transition-all flex justify-center items-center gap-2 border-none cursor-pointer"
                                            >
                                                <Download size={14} strokeWidth={3} /> Download Credential
                                            </button>
                                            <button
                                                onClick={handleClaim}
                                                disabled={claiming}
                                                className="w-full bg-white/5 text-white/50 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] hover:bg-white/10 hover:text-white transition-all flex justify-center items-center gap-2 border-none cursor-pointer"
                                            >
                                                {claiming ? <Loader2 className="animate-spin w-4 h-4" /> : <><RefreshCw size={14} /> Re-issue Design</>}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleClaim}
                                            disabled={claiming}
                                            className="w-full bg-brand-emerald text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-brand-emerald/40 hover:-translate-y-1 transition-all flex justify-center items-center gap-3 border-none cursor-pointer"
                                        >
                                            {claiming ? <Loader2 className="animate-spin w-5 h-5 text-white" /> : <><Star size={16} fill="currentColor" /> Claim Credential</>}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetails;
