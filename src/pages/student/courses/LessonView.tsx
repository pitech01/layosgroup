import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle, CheckCircle2, ShieldCheck, Loader2, PlayCircle, FileText, Eye, X, Video, HelpCircle, Sparkles, Maximize2, Minimize2, Trophy, Download, RefreshCw, Calendar, Clock, BookOpen, Activity, AlertCircle } from 'lucide-react';
import AIPDFInteraction from '../../../components/student/AIPDFInteraction';
import SecurePDFViewer from '../../../components/student/SecurePDFViewer';
import { SkeletonLessonView } from '../../../components/common/SkeletonLoader';
import { useAIPutter } from '../../../utils/useAIPutter';
import { buildProxyUrl } from '../../../utils/pdfTextExtractor';


// ==========================================
// AUDIO VISUALIZER SUB-COMPONENT
// ==========================================
let globalAudioContext: AudioContext | null = null;

// ==========================================
// AUDIO VISUALIZER SUB-COMPONENT
// ==========================================
const VideoAudioVisualizer = ({ video }: { video: HTMLVideoElement | null }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let analyser = analyserRef.current;
        
        if (!globalAudioContext) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            globalAudioContext = new AudioContextClass();
        }
        
        const audioContext = globalAudioContext;

        if (!analyser) {
            analyser = audioContext.createAnalyser();
            analyserRef.current = analyser;
        }

        try {
            let source = (video as any).__audioSourceNode;
            if (!source) {
                source = audioContext.createMediaElementSource(video);
                (video as any).__audioSourceNode = source;
            }
            
            sourceRef.current = source;
            source.connect(analyser);
            analyser.connect(audioContext.destination);
        } catch (err) {
            console.error("AudioContext source connection failed:", err);
        }

        analyser.fftSize = 128;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            ctx.fillStyle = '#111827'; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.0;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height * 0.7;
                
                // Color match with green emerald brand colors
                ctx.fillStyle = `rgb(16, ${185 + barHeight}, 129)`;
                ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth - 3, barHeight);
                x += barWidth;
            }
        };

        const resumeContext = () => {
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
        };

        // Try to resume immediately if the video is already playing
        if (!video.paused) {
            resumeContext();
        }

        const handleInteraction = () => {
            resumeContext();
            document.removeEventListener('click', handleInteraction);
        };
        document.addEventListener('click', handleInteraction);

        video.addEventListener('play', resumeContext);
        video.addEventListener('playing', resumeContext);
        draw();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            video.removeEventListener('play', resumeContext);
            video.removeEventListener('playing', resumeContext);
            document.removeEventListener('click', handleInteraction);
            
            try {
                if (sourceRef.current) {
                    sourceRef.current.disconnect();
                }
            } catch (e) {}
        };
    }, [video]);

    return (
        <div className="relative w-full h-full bg-gray-900 rounded-xl overflow-hidden flex flex-col items-center justify-center border border-brand-border">
            <canvas ref={canvasRef} width={800} height={360} className="w-full h-full block" />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-gradient-to-t from-gray-950/80 via-transparent to-transparent">
                <div className="p-4 bg-brand-charcoal/60 backdrop-blur-md rounded-full mb-3 border border-white/10 animate-pulse">
                    <Activity className="text-brand-emerald h-8 w-8" />
                </div>
                <p className="text-white font-black text-sm uppercase tracking-widest">Audio Track Active</p>
                <p className="text-gray-400 text-xs mt-1 sm:text-sm text-center">This video lesson contains an audio stream without a video channel.</p>
            </div>
        </div>
    );
};

// ==========================================
// CORE STATE TRACKER HOOK
// ==========================================
const useVideoTrackDetector = (
    video: HTMLVideoElement | null, 
    callback: (results: { isAudioOnly: boolean; hasAudio: boolean; hasVideo: boolean }) => void
) => {
    useEffect(() => {
        if (!video || !callback) return;

        const checkTracks = () => {
            const isMetadataLoaded = video.readyState >= 1;
            const hasVideo = video.videoWidth > 0 && video.videoHeight > 0;
            const isAudioOnly = isMetadataLoaded && !hasVideo;

            callback({
                isAudioOnly,
                hasAudio: isAudioOnly,
                hasVideo
            });
        };

        // Attach listeners across all data delivery checkpoints
        video.addEventListener('loadedmetadata', checkTracks);
        video.addEventListener('loadeddata', checkTracks);
        video.addEventListener('canplay', checkTracks);
        video.addEventListener('timeupdate', checkTracks);
        video.addEventListener('play', checkTracks);

        // Run an immediate check in case metadata is already loaded
        checkTracks();

        return () => {
            video.removeEventListener('loadedmetadata', checkTracks);
            video.removeEventListener('loadeddata', checkTracks);
            video.removeEventListener('canplay', checkTracks);
            video.removeEventListener('timeupdate', checkTracks);
            video.removeEventListener('play', checkTracks);
        };
    }, [video, callback]);
};

// mediaErrorFeedback is now handled in state within LessonView

const LessonView = () => {
    const { courseId, lessonId } = useParams();
    const [searchParams] = useSearchParams();
    const cohortId = searchParams.get('cohortId');
    const navigate = useNavigate();

    const [lesson, setLesson] = useState<any>(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [allLessons, setAllLessons] = useState<any[]>([]);
    const [previewAsset, setPreviewAsset] = useState<{ url: string; type: 'image' | 'pdf' | 'video' | 'ppt' } | null>(null);
    const [iframeLoading, setIframeLoading] = useState(true);

    // Quiz State
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
    const [isMaximized, setIsMaximized] = useState(false);
    const [quizResult, setQuizResult] = useState<{ score: number, passed: boolean } | null>(null);
    const [showReview, setShowReview] = useState(false);
    const [showAiInteraction, setShowAiInteraction] = useState(false);

    const aiTutor = useAIPutter();
    const aiStartedUrlRef = useRef<string | null>(null);

    // Start AI processing instantly in background
    useEffect(() => {
        if (lesson?.file_url) {
            const url = lesson.file_url;
            const isPdf = /\.pdf([?#]|$)/i.test(url) || (lesson.file_name && /\.pdf$/i.test(lesson.file_name));
            
            if (isPdf && aiStartedUrlRef.current !== url) {
                aiStartedUrlRef.current = url;
                aiTutor.startAIIntelligence(url);
            }
        }
    }, [lesson?.file_url, lesson?.file_name]);

    const API_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    // Track state additions
    const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
    const [trackInfo, setTrackInfo] = useState({ isAudioOnly: false, hasAudio: true, hasVideo: true });
    const [mediaError, setMediaError] = useState<boolean>(false);
    const bunnyIframeRef = useRef<HTMLIFrameElement | null>(null);
    // Tracks whether auto-complete was already triggered for this lesson to avoid double calls
    const autoCompletedRef = useRef<boolean>(false);

    const handleTrackAnalysis = useCallback((results: { isAudioOnly: boolean; hasAudio: boolean; hasVideo: boolean }) => {
        setTrackInfo(results);
    }, []);

     // Invoke track hook tracking ref configurations
    useVideoTrackDetector(videoElement, handleTrackAnalysis);

    const mediaErrorFeedback = useCallback((e: any) => {
        console.error("Media resource failed to load:", e);
        setMediaError(true);
    }, []);

    // Called when media (video/audio) ends — auto-completes if no quiz is attached
    const handleAutoCompleteAfterMedia = useCallback(() => {
        if (autoCompletedRef.current || isCompleted) return;
        const quizData = lesson?.quiz_data
            ? (typeof lesson.quiz_data === 'string' ? JSON.parse(lesson.quiz_data) : lesson.quiz_data)
            : null;
        const hasQuiz = quizData?.questions?.length > 0;
        if (!hasQuiz) {
            autoCompletedRef.current = true;
            handleCompleteLesson();
        }
    }, [isCompleted, lesson]);

    // Called when PDF reaches the last page — starts quiz if attached, else auto-completes
    const handlePDFReachedEnd = useCallback(() => {
        if (autoCompletedRef.current || isCompleted) return;
        const quizData = lesson?.quiz_data
            ? (typeof lesson.quiz_data === 'string' ? JSON.parse(lesson.quiz_data) : lesson.quiz_data)
            : null;
        const hasQuiz = quizData?.questions?.length > 0;
        if (hasQuiz) {
            // Close the preview and launch the quiz
            setPreviewAsset(null);
            setQuizStarted(true);
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        } else {
            autoCompletedRef.current = true;
            handleCompleteLesson();
        }
    }, [isCompleted, lesson]);

    // Listen for Bunny Stream player "ended" event via postMessage
    useEffect(() => {
        const handleBunnyMessage = (event: MessageEvent) => {
            const trustedOrigins = ['mediadelivery.net', 'iframe.mediadelivery.net', 'player.mediadelivery.net'];
            const isFromBunny = trustedOrigins.some(o => event.origin.includes(o));
            if (!isFromBunny) return;
            try {
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                if (data?.event === 'ended' || data?.type === 'ended') {
                    handleAutoCompleteAfterMedia();
                }
            } catch { /* ignore parse errors */ }
        };
        window.addEventListener('message', handleBunnyMessage);
        return () => window.removeEventListener('message', handleBunnyMessage);
    }, [handleAutoCompleteAfterMedia]);

    // Reset the auto-complete guard when the lesson changes
    useEffect(() => {
        autoCompletedRef.current = false;
    }, [lessonId]);

    useEffect(() => {
        const fetchLessonData = async () => {
            setLoading(true);
            setTrackInfo({ isAudioOnly: false, hasAudio: true, hasVideo: true });
            setIsCompleted(false);
            setQuizStarted(false);
            setCurrentQuestionIndex(0);
            setQuizResult(null);
            setShowReview(false);
            setPreviewAsset(null);
            setIframeLoading(true);
            setShowAiInteraction(false);
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/my-enrollments`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();

                if (response.ok) {
                    const enrolledCohort = data.cohorts.find((c: any) => c.id == cohortId);
                    if (enrolledCohort && enrolledCohort.course) {
                        const flattenedLessons: any[] = [];
                        enrolledCohort.course.modules.forEach((mod: any) => {
                            mod.lessons.forEach((l: any) => {
                                flattenedLessons.push({
                                    ...l,
                                    moduleTitle: mod.title,
                                    courseImage: enrolledCohort.course.image || enrolledCohort.course.thumbnail
                                });
                            });
                        });
                        setAllLessons(flattenedLessons);

                        const currentLesson = flattenedLessons.find(l => l.id == lessonId);
                        if (currentLesson) {
                            if (currentLesson.quiz_data && typeof currentLesson.quiz_data === 'string') {
                                try {
                                    currentLesson.quiz_data = JSON.parse(currentLesson.quiz_data);
                                } catch (e) {
                                    console.error("Failed to parse quiz_data", e);
                                }
                            }
                            setLesson(currentLesson);
                            const completedEntry = data.completed_lessons?.find((cl: any) => cl.id == lessonId);
                            if (completedEntry) {
                                setIsCompleted(true);
                                if (currentLesson.type === 'quiz' || (currentLesson.quiz_data && currentLesson.type === 'material')) {
                                    const quizData = typeof currentLesson.quiz_data === 'string' ? JSON.parse(currentLesson.quiz_data) : currentLesson.quiz_data;
                                    if (completedEntry.pivot?.score !== null && completedEntry.pivot?.score !== undefined) {
                                        setQuizResult({
                                            score: completedEntry.pivot.score,
                                            passed: completedEntry.pivot.score >= (quizData?.pass_mark || 80)
                                        });
                                        if (completedEntry.pivot.answers) {
                                            try {
                                                const parsedAnswers = typeof completedEntry.pivot.answers === 'string' ? JSON.parse(completedEntry.pivot.answers) : completedEntry.pivot.answers;
                                                setSelectedAnswers(parsedAnswers);
                                            } catch (e) {
                                                console.error("Failed to parse previous answers", e);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Fetch Lesson Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLessonData();
    }, [courseId, lessonId, cohortId, API_URL]);

    if (loading) {
        return (
           <SkeletonLessonView/>
        );
    }
    if (!lesson) {
        return (
            <div className="py-24 px-4 text-center bg-white dark:bg-brand-charcoal rounded-xl border border-brand-border ">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                    <X size={40} />
                </div>
                <h2 className="text-2xl font-black text-brand-charcoal dark:text-white mb-3 uppercase tracking-tight">Lesson Unavailable</h2>
                <p className="text-brand-muted font-medium mb-10 max-w-md mx-auto">The requested unit could not be located in the current curriculum synchronization.</p>
                <Link to={`/student/courses/${courseId}?cohortId=${cohortId}`} className="inline-flex items-center gap-3 bg-brand-charcoal dark:bg-brand-emerald text-white font-black text-xs uppercase tracking-widest py-4 px-8 rounded-2xl hover:scale-105 transition-all shadow-xl shadow-brand-charcoal/20">
                    <ChevronLeft size={18} /> Back to Course
                </Link>
            </div>
        );
    }

    const currentIndex = allLessons.findIndex(l => l.id == lessonId);
    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    const handleNavigateLesson = (id: number) => {
        navigate(`/student/courses/${courseId}/lesson/${id}?cohortId=${cohortId}`);
    };

    const handleCompleteLesson = async (extraData?: { score?: number; answers?: any; forceComplete?: boolean }) => {
        setIsCompleting(true);
        try {
            const token = localStorage.getItem('token');
            const newStatus = extraData?.forceComplete !== undefined ? extraData.forceComplete : !isCompleted;

            const response = await fetch(`${API_URL}/lessons/${lessonId}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    completed: newStatus,
                    ...extraData
                })
            });

            if (response.ok) {
                const data = await response.json();
                setIsCompleted(data.completed);
                if (data.completed && data.progress >= 100) {
                    setTimeout(() => {
                        navigate(`/student/courses/${courseId}?cohortId=${cohortId}`);
                    }, 1500);
                }
            }
        } catch (error) {
            console.error("Failed to mark lesson complete", error);
        } finally {
            setIsCompleting(false);
        }
    };

    const getCleanUrl = (url: string) => {
        if (!url) return '';
        if (url.includes('mediadelivery.net')) return url;
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
        let finalUrl = url;
        if (url.includes('localhost:8000') || url.includes('127.0.0.1:8000') || url.includes('192.168.')) {
            finalUrl = url.replace(/https?:\/\/[^\/]+/, baseUrl);
        } else if (url.startsWith('/storage/') || url.startsWith('storage/')) {
            const cleanPath = url.startsWith('/') ? url : `/${url}`;
            finalUrl = `${baseUrl}${cleanPath}`;
        } else if (url.includes('lessons/') || url.includes('courses/')) {
            finalUrl = `${baseUrl}/storage/${url}`;
        }
        finalUrl = finalUrl.replace('app/public/', '');
        if (finalUrl.includes('layosgroupllc.com') && finalUrl.startsWith('http:')) {
            return finalUrl.replace('http:', 'https:');
        }
        return finalUrl;
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden">
            <div className="flex-1 overflow-y-auto scrollbar ">

                <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
                    {/* Navigation Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                        <Link
                            to={`/student/courses/${courseId}?cohortId=${cohortId}`}
                            className="flex items-center gap-2 text-brand-muted font-black text-xs uppercase tracking-widest hover:text-brand-emerald transition-colors"
                        >
                            <ChevronLeft size={16} /> Course Curriculum
                        </Link>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => prevLesson && handleNavigateLesson(prevLesson.id)}
                                disabled={!prevLesson}
                                className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-brand-charcoal/30 text-brand-charcoal font-black text-[10px] uppercase tracking-widest hover:bg-green-600 hover:text-white disabled:opacity-30 transition-all transition-all flex items-center justify-center gap-2"
                            >
                                {prevLesson ? <ChevronLeft size={14} /> : null}   Previous
                            </button>
                            <button
                                onClick={() => nextLesson && handleNavigateLesson(nextLesson.id)}
                                disabled={!nextLesson}
                                className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-brand-charcoal text-white font-black text-[10px] uppercase tracking-widest hover:bg-brand-emerald disabled:opacity-30 transition-all flex items-center justify-center gap-2"
                            >
                                Next Unit <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Content Player Container */}
                    <div
                        className={`
                            bg-black rounded-lg overflow-hidden shadow-2xl transition-all duration-500 border border-brand-border
                            ${isMaximized ? 'fixed inset-0 z-[2000] rounded-none' : 'aspect-video relative'}
                        `}
                    >
                        <button
                            onClick={() => setIsMaximized(!isMaximized)}
                            className="absolute top-6 right-6 z-[2100] w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
                        >
                            {isMaximized ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
                        </button>

                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-charcoal to-black">
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                {lesson.type === 'live' ? (
                                    <div className="text-center p-8 max-w-2xl space-y-8 animate-fade-in-up">
                                        <div className="w-24 h-24 bg-brand-emerald/10 rounded-[32px] flex items-center justify-center mx-auto border border-brand-emerald/20">
                                            <Video size={48} className="text-brand-emerald" />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Live Session Active</h3>
                                            <p className="text-brand-muted font-medium text-lg">Synchronized learning protocol initialized. Access via {lesson.live_platform || 'Secure Tunnel'}.</p>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-white/10">
                                            <div className="flex flex-col items-start px-6">
                                                <span className="text-[10px] font-black text-brand-emerald uppercase tracking-widest mb-1">Session Date</span>
                                                <span className="text-xl font-black text-white">{lesson.live_date || 'Synchronizing...'}</span>
                                            </div>
                                            <div className="hidden sm:block w-px h-12 bg-white/10" />
                                            <div className="flex flex-col items-start px-6">
                                                <span className="text-[10px] font-black text-brand-emerald uppercase tracking-widest mb-1">Session Time</span>
                                                <span className="text-xl font-black text-white">{lesson.live_time || 'Synchronizing...'}</span>
                                            </div>
                                        </div>

                                        <div>
                                            {lesson.live_link ? (
                                                <a
                                                    href={lesson.live_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-3 bg-brand-emerald text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-brand-emerald/40 hover:scale-105 active:scale-95 transition-all no-underline"
                                                >
                                                    <Video size={20} /> Access Live Portal
                                                </a>
                                            ) : (
                                                <div className="px-8 py-4 bg-white/5 text-brand-muted rounded-xl font-black text-xs uppercase tracking-widest border border-white/5">
                                                    Link Synchronization Pending
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (lesson.type === 'quiz' || quizStarted) ? (
                                    <div className="w-full h-full bg-gradient-to-br from-brand-charcoal to-black flex flex-col overflow-hidden">
                                        {!quizStarted ? (
                                            <div className="m-auto text-center max-w-3xl p-8 md:p-16 bg-white/5 backdrop-blur-2xl rounded-[60px] border border-white/10 animate-fade-in-up space-y-10">
                                                <div className="relative w-32 h-32 mx-auto">
                                                    <div className="absolute inset-0 bg-brand-emerald/20 blur-3xl animate-pulse" />
                                                    <div className="relative w-full h-full bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                                                        <HelpCircle size={64} className="text-brand-emerald" strokeWidth={1.5} />
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-emerald/10 text-brand-emerald rounded-full border border-brand-emerald/20 text-[10px] font-black uppercase tracking-[0.2em]">
                                                        Knowledge Validation
                                                    </div>
                                                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">Diagnostic Audit</h2>
                                                    <p className="text-brand-muted text-lg font-medium leading-relaxed max-w-xl mx-auto">
                                                        Initialize the evaluation sequence to validate your unit proficiency. Minimum score of <span className="text-brand-emerald font-black underline underline-offset-4">{lesson.quiz_data?.pass_mark || 80}%</span> required for graduation.
                                                    </p>
                                                </div>

                                                <div className="flex flex-col sm:flex-row justify-center gap-6">
                                                    <div className="text-left p-6 bg-white/5 rounded-3xl border border-white/5 flex-1 min-w-[200px]">
                                                        <div className="text-[10px] font-black text-brand-emerald uppercase tracking-widest mb-1">Payload Size</div>
                                                        <div className="text-xl font-black text-white">{lesson.quiz_data?.questions?.length || 0} Logic Blocks</div>
                                                    </div>
                                                    <div className="text-left p-6 bg-white/5 rounded-3xl border border-white/5 flex-1 min-w-[200px]">
                                                        <div className="text-[10px] font-black text-brand-emerald uppercase tracking-widest mb-1">Success Metric</div>
                                                        <div className="text-xl font-black text-white">{lesson.quiz_data?.pass_mark || 80}% Precision</div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => setQuizStarted(true)}
                                                    className="w-full sm:w-auto bg-brand-emerald text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-brand-emerald/40 hover:-translate-y-1 active:scale-95 transition-all border-none cursor-pointer"
                                                >
                                                    Initialize Assessment
                                                </button>
                                            </div>
                                        ) : quizResult ? (
                                            <div className="m-auto text-center max-w-4xl p-8 md:p-16 bg-white/5 backdrop-blur-2xl rounded-[60px] border border-white/10 animate-fade-in-up space-y-12">
                                                <div className="relative w-40 h-40 mx-auto">
                                                    <div className={`absolute inset-0 blur-3xl opacity-30 ${quizResult.passed ? 'bg-brand-emerald' : 'bg-red-500'}`} />
                                                    <div className={`relative w-full h-full rounded-full border-4 flex items-center justify-center transition-all duration-1000 ${quizResult.passed ? 'border-brand-emerald bg-brand-emerald/10' : 'border-red-500 bg-red-500/10'}`}>
                                                        {quizResult.passed ? <CheckCircle size={80} className="text-brand-emerald" strokeWidth={1.5} /> : <X size={80} className="text-red-500" strokeWidth={1.5} />}
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${quizResult.passed ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                        {quizResult.passed ? 'Proficiency Validated' : 'Deficiency Identified'}
                                                    </div>
                                                    <h2 className="text-7xl font-black text-white tracking-tighter leading-none">
                                                        {quizResult.score}<span className="text-2xl text-brand-muted align-top ml-1">%</span>
                                                    </h2>
                                                    <p className="text-brand-muted text-lg font-medium leading-relaxed max-w-2xl mx-auto">
                                                        {quizResult.passed
                                                            ? `Exceptional performance. You have achieved deep mastery of this unit with a score of ${quizResult.score}%.`
                                                            : `Performance below established benchmarks (${quizResult.score}%). A re-evaluation is required to maintain curriculum standards.`}
                                                    </p>
                                                </div>

                                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                                    <button
                                                        onClick={() => setShowReview(true)}
                                                        className="px-8 py-4 bg-white/5 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                                    >
                                                        <Eye size={16} /> Audit Performance
                                                    </button>

                                                    {quizResult.passed ? (
                                                        <button
                                                            onClick={() => handleCompleteLesson({ score: quizResult.score, answers: selectedAnswers, forceComplete: true })}
                                                            className={`
                                                                px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 border-none cursor-pointer
                                                                ${isCompleted ? 'bg-white/5 text-brand-emerald border border-brand-emerald/30' : 'bg-brand-emerald text-white shadow-xl shadow-brand-emerald/30 hover:scale-105 active:scale-95'}
                                                            `}
                                                        >
                                                            {isCompleted ? <><CheckCircle2 size={16} strokeWidth={3} /> Synchronized</> : 'Commit to Record'}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setQuizStarted(false);
                                                                setQuizResult(null);
                                                                setSelectedAnswers({});
                                                                setCurrentQuestionIndex(0);
                                                            }}
                                                            className="px-10 py-4 bg-white text-brand-charcoal rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
                                                        >
                                                            Re-Initialize Assessment
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col h-full overflow-hidden">
                                                {/* Quiz Progress */}
                                                <div className="px-8 pt-8 pb-4 shrink-0">
                                                    <div className="max-w-4xl mx-auto flex justify-between items-center mb-8">
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-[10px] font-black text-brand-emerald uppercase tracking-[0.2em]">Diagnostic In Progress</span>
                                                            <div className="flex gap-2">
                                                                {lesson.quiz_data.questions.map((_: any, i: number) => (
                                                                    <div key={i} className={`w-3 h-1.5 rounded-full transition-all duration-500 ${i <= currentQuestionIndex ? 'bg-brand-emerald shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/10'}`} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="text-brand-muted font-black text-xs uppercase tracking-widest">
                                                            Block {currentQuestionIndex + 1} of {lesson.quiz_data.questions.length}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Quiz Question Area */}
                                                <div className="flex-1 overflow-y-auto px-8 pb-8 ">
                                                    <div className="max-w-4xl mx-auto py-12 space-y-12 animate-fade-in-up">
                                                        <h3 className="text-3xl md:text-4xl font-black text-white text-center leading-tight tracking-tight">
                                                            {lesson.quiz_data.questions[currentQuestionIndex].question}
                                                        </h3>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {lesson.quiz_data.questions[currentQuestionIndex].options.map((opt: string, idx: number) => {
                                                                const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                                                                return (
                                                                    <button
                                                                        key={idx}
                                                                        onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: idx })}
                                                                        className={`
                                                                            flex items-center gap-6 p-6 rounded-[32px] text-left transition-all duration-300 group border-none cursor-pointer
                                                                            ${isSelected
                                                                                ? 'bg-brand-emerald/10 border-brand-emerald ring-2 ring-brand-emerald/50 text-white'
                                                                                : 'bg-white/5 border border-white/10 text-brand-muted hover:bg-white/10 hover:text-white'}
                                                                        `}
                                                                    >
                                                                        <div className={`
                                                                            w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs transition-all
                                                                            ${isSelected ? 'bg-brand-emerald text-white' : 'bg-white/5 text-brand-muted group-hover:text-white'}
                                                                        `}>
                                                                            {String.fromCharCode(65 + idx)}
                                                                        </div>
                                                                        <span className="text-lg font-bold leading-relaxed flex-1">{opt}</span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Quiz Footer */}
                                                <div className="px-8 py-6 bg-black/40 backdrop-blur-xl border-t border-white/10 shrink-0">
                                                    <div className="max-w-4xl mx-auto flex justify-between items-center">
                                                        <button
                                                            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                                                            disabled={currentQuestionIndex === 0}
                                                            className="flex items-center gap-2 bg-transparent border-none text-brand-muted font-black text-xs uppercase tracking-widest hover:text-white transition-all disabled:opacity-0 cursor-pointer"
                                                        >
                                                            <ChevronLeft size={16} /> Back
                                                        </button>

                                                        {currentQuestionIndex < lesson.quiz_data.questions.length - 1 ? (
                                                            <button
                                                                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                                                                className="bg-white text-brand-charcoal px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all border-none cursor-pointer flex items-center gap-2"
                                                            >
                                                                Next Block <ChevronRight size={14} strokeWidth={3} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    let correctCount = 0;
                                                                    lesson.quiz_data.questions.forEach((q: any, idx: number) => {
                                                                        if (selectedAnswers[idx] === q.correct_answer) {
                                                                            correctCount++;
                                                                        }
                                                                    });
                                                                    const score = Math.round((correctCount / lesson.quiz_data.questions.length) * 100);
                                                                    const passMark = lesson.quiz_data.pass_mark || 80;
                                                                    const passed = score >= passMark;
                                                                    setQuizResult({ score, passed });
                                                                    // Auto-complete lesson when quiz is passed
                                                                    if (passed && !isCompleted && !autoCompletedRef.current) {
                                                                        autoCompletedRef.current = true;
                                                                        handleCompleteLesson({ score, answers: selectedAnswers, forceComplete: true });
                                                                    }
                                                                }}
                                                                disabled={selectedAnswers[currentQuestionIndex] === undefined}
                                                                className="bg-brand-emerald text-white px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-emerald/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 border-none cursor-pointer"
                                                            >
                                                                Commit Evaluation
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (() => {
                                    const rawUrl = lesson.video_url || lesson.file_url;
                                    const cleanUrl = getCleanUrl(rawUrl);
                                    const isBunny = cleanUrl.includes('mediadelivery.net');
                                    const isVideo = cleanUrl.match(/\.(mp4|webm|ogg|ogv|mov|m4v|avi|mkv|wmv|flv|3gp)([?#]|$)/i) || isBunny;
                                    const isImage = cleanUrl.match(/\.(jpg|jpeg|png|gif|webp)([?#]|$)/i);
                                    const isDoc = (cleanUrl.match(/\.pdf([?#]|$)/i) || cleanUrl.match(/\.(pptx?)([?#]|$)/i));

                                    if (!rawUrl) return (
                                        <div className="text-center space-y-4 animate-fade-in-up">
                                            <div className="w-20 h-20 bg-white/5 backdrop-blur-md rounded-[32px] border border-white/10 flex items-center justify-center mx-auto transition-transform hover:scale-110">
                                                <PlayCircle size={40} className="text-brand-emerald ml-1" />
                                            </div>
                                            <p className="text-brand-muted font-black text-xs uppercase tracking-widest">Protocol Synchronized • Content Prepared</p>
                                        </div>
                                    );

                                    if (isBunny) {
                                        return (
                                            <iframe
                                                ref={bunnyIframeRef}
                                                src={cleanUrl}
                                                loading="lazy"
                                                className="w-full h-full border-none rounded-xl "
                                                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                                                allowFullScreen={true}
                                                onError={mediaErrorFeedback}
                                            />
                                        );
                                    }

                                    if (isVideo) {
                                        return (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
                                                {trackInfo.isAudioOnly && (
                                                    <div className="w-full flex-1 flex items-center justify-center min-h-0">
                                                        <VideoAudioVisualizer video={videoElement} />
                                                    </div>
                                                )}
                                                <video
                                                    key={lesson.id}
                                                    ref={setVideoElement}
                                                    controls
                                                    src={cleanUrl}
                                                    autoPlay
                                                    className={trackInfo.isAudioOnly ? "w-full h-14 bg-black shrink-0" : "w-full h-full border-none rounded-sm object-contain"}
                                                    controlsList="nodownload"
                                                    crossOrigin="anonymous"
                                                    onContextMenu={(e: any) => e.preventDefault()}
                                                    onError={mediaErrorFeedback}
                                                    onEnded={handleAutoCompleteAfterMedia}
                                                />
                                            </div>
                                        );
                                    }

                                    if (isImage) {
                                        return (
                                            <div className="w-full h-full flex items-center justify-center p-4">
                                                <img
                                                    src={cleanUrl}
                                                    alt={lesson.title}
                                                    className="max-w-full max-h-full rounded-2xl md:rounded-xl shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
                                                    onContextMenu={(e: any) => e.preventDefault()}
                                                    onError={mediaErrorFeedback}
                                                />
                                            </div>
                                        );
                                    }

                                    if (isDoc) {
                                        return (
                                            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-10 animate-fade-in-up">
                                                <div className="relative w-40 h-24">
                                                    <div className="absolute inset-0 bg-brand-emerald/10 blur-2xl animate-pulse" />
                                                    <div className="relative w-full h-full bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-center overflow-hidden">
                                                        {lesson.courseImage ? (
                                                            <img src={lesson.courseImage} className="w-full h-full object-cover opacity-60" alt="Preview" />
                                                        ) : (
                                                            <FileText size={48} className="text-brand-emerald opacity-50" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-4 ">
                                                    <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">Intelligence Pack Ready</h3>
                                                    <p className="text-brand-muted text-lg  font-medium max-w-xl mx-auto leading-relaxed">
                                                        High-fidelity instructional materials have been architected. Launch the secure viewer below.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const url = lesson.file_url || '';
                                                        const isPdf = /\.pdf([?#]|$)/i.test(url) || (lesson.file_name && /\.pdf$/i.test(lesson.file_name));
                                                        const isPpt = /\.(pptx?)([?#]|$)/i.test(url);
                                                        const isVideo = /\.(mp4|webm|ogg|ogv|mov|m4v|avi|mkv)([?#]|$)/i.test(url);
                                                        setIframeLoading(true);
                                                        setPreviewAsset({ url, type: isPdf ? 'pdf' : isPpt ? 'ppt' : isVideo ? 'video' : 'image' });
                                                    }}
                                                    className="bg-brand-emerald text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-brand-emerald/40 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer flex items-center gap-3"
                                                >
                                                    <Eye size={20} /> View Lesson Guide
                                                </button>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="text-center p-8 space-y-8 animate-fade-in-up">
                                            <div className="w-20 h-20 bg-white/5 rounded-[32px] flex items-center justify-center mx-auto border border-white/10">
                                                <FileText size={40} className="text-brand-emerald opacity-50" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-white font-black text-lg uppercase tracking-tight">Material Protocol Prepared</p>
                                                <p className="text-brand-muted font-bold text-sm uppercase tracking-widest">{lesson.file_name || 'Attached Logic Block'}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const url = lesson.file_url || '';
                                                    const isPdf = /\.pdf([?#]|$)/i.test(url) || (lesson.file_name && /\.pdf$/i.test(lesson.file_name));
                                                    const isPpt = /\.(pptx?)([?#]|$)/i.test(url);
                                                    const isVideo = /\.(mp4|webm|ogg|ogv|mov|m4v|avi|mkv)([?#]|$)/i.test(url);
                                                    setIframeLoading(true);
                                                    setPreviewAsset({ url, type: isPdf ? 'pdf' : isPpt ? 'ppt' : isVideo ? 'video' : 'image' });
                                                }}
                                                className="bg-brand-emerald text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] shadow-xl shadow-brand-emerald/20 hover:-translate-y-1 transition-all border-none cursor-pointer flex items-center gap-2"
                                            >
                                                <Eye size={16} /> Open Resource
                                            </button>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Lesson Meta */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-brand-emerald/10 rounded-lg">
                                        <Activity size={16} className="text-brand-emerald" />
                                    </div>
                                    <span className="text-[10px] font-black text-brand-emerald uppercase tracking-[0.2em]">{lesson.moduleTitle}</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl sm:text-xl font-black text-brand-charcoal dark:text-white tracking-tight leading-none text-wrap break-words">
                                    {lesson.title}
                                </h1>
                            </div>

                            <p className="text-brand-muted text-lg font-medium leading-relaxed">
                                {lesson.description || 'Standard instructional content follows. Complete all unit objectives for mastery verification.'}
                            </p>

                            <div className="pt-10 border-t border-brand-border">
                                <button
                                    onClick={() => {
                                        const quizData = typeof lesson.quiz_data === 'string' ? JSON.parse(lesson.quiz_data) : lesson.quiz_data;
                                        if (quizData && quizData.questions && quizData.questions.length > 0 && !isCompleted) {
                                            setQuizStarted(true);
                                            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                                        } else {
                                            handleCompleteLesson();
                                        }
                                    }}
                                    disabled={isCompleting}
                                    className={`
                                        w-full sm:w-auto h-16 px-12 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border-none cursor-pointer active:scale-95
                                        ${isCompleted
                                            ? 'bg-brand-beige dark:bg-white/5 text-brand-emerald border-2 border-brand-emerald shadow-none'
                                            : 'bg-brand-charcoal dark:bg-brand-emerald text-white shadow-2xl shadow-brand-charcoal/30 hover:scale-105'}
                                    `}
                                >
                                    {isCompleting ? <Loader2 className="animate-spin" size={20} /> :
                                        isCompleted ? <><CheckCircle2 size={20} strokeWidth={3} /> Mastery Confirmed</> :
                                            (lesson.quiz_data ? 'Start Unit Assessment' : 'Mark Unit as Completed')}
                                </button>
                            </div>
                        </div>

                        {/* Sidebar: Progress Context */}
                        <div className="space-y-8">
                            <div className="bg-white dark:bg-brand-charcoal rounded-xl border border-brand-border p-8 shadow-sm space-y-8">
                                <h4 className="text-xs font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                    <BookOpen size={16} className="text-brand-emerald" /> Curriculum Status
                                </h4>

                                <div className="space-y-2">
                                    {allLessons.map((l, i) => {
                                        const isCurrent = l.id == lessonId;
                                        return (
                                            <button
                                                key={l.id}
                                                onClick={() => handleNavigateLesson(l.id)}
                                                className={`
                                                    w-full flex items-center gap-4 p-4 rounded-2xl transition-all border-none cursor-pointer text-left
                                                    ${isCurrent ? 'bg-brand-emerald text-white shadow-xl shadow-brand-emerald/20' : 'hover:bg-brand-beige dark:hover:bg-white/5 text-brand-muted'}
                                                `}
                                            >
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px] ${isCurrent ? 'bg-white/20' : 'bg-brand-beige dark:bg-white/5'}`}>
                                                    {i + 1}
                                                </div>
                                                <span className="text-[11px] font-black uppercase tracking-widest truncate flex-1">{l.title}</span>
                                                {isCurrent && <Activity size={14} className="animate-pulse" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Asset Preview Modal */}
{previewAsset && (
    <div className="fixed inset-0 z-[3000] bg-white dark:bg-brand-charcoal flex flex-col animate-in fade-in zoom-in-95 duration-300">
        
        {/* Responsive Header Banner */}
        <div className="px-4 py-3 md:px-8 md:py-6 border-b border-brand-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 dark:bg-brand-charcoal/80 backdrop-blur-xl">
            
            {/* Asset Meta Info */}
            <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-brand-emerald/10 flex items-center justify-center text-brand-emerald shrink-0">
                    {previewAsset.type === 'pdf' || previewAsset.type === 'ppt' ? <FileText size={20} className="md:w-6 md:h-6" /> : <Eye size={20} className="md:w-6 md:h-6" />}
                </div>
                <div className="min-w-0">
                    <h3 className="text-base md:text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight truncate">
                        Intelligence Hub
                    </h3>
                    <p className="text-[9px] md:text-[10px] font-black text-brand-muted uppercase tracking-[0.15em] md:tracking-[0.2em] truncate">
                        Secured Instructional Protocol
                    </p>
                </div>
            </div>

            {/* Core Action Panel */}
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t border-brand-border/40 sm:border-t-0 pt-3 sm:pt-0">
                <button
                    onClick={() => setShowAiInteraction(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 md:py-2 rounded-full border border-indigo-500 text-indigo-500 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all active:scale-95 cursor-pointer bg-transparent flex-1 sm:flex-none"
                >
                    <Sparkles size={14} /> <span>Virtual Tutor</span>
                </button>
                <button
                    onClick={() => setPreviewAsset(null)}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-brand-beige dark:bg-white/10 text-brand-muted flex items-center justify-center hover:text-red-500 transition-all border-none cursor-pointer shrink-0"
                >
                    <X size={20} className="md:w-6 md:h-6" />
                </button>
            </div>
        </div>

        {/* Adaptive Viewport Stage */}
        <div className="flex-1 relative bg-brand-beige dark:bg-brand-charcoal overflow-hidden flex items-center justify-center p-2 md:p-0">
            {iframeLoading && (previewAsset.type === 'pdf' || previewAsset.type === 'ppt') && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-brand-beige dark:bg-brand-charcoal animate-pulse p-4 text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-brand-border border-t-brand-emerald rounded-full animate-spin mb-4 md:mb-6" />
                    <h4 className="font-black text-xs md:text-sm text-brand-charcoal dark:text-white uppercase tracking-widest">
                        Architecting Workspace...
                    </h4>
                </div>
            )}
            
            {previewAsset.type === 'pdf' ? (
                <SecurePDFViewer
                    url={previewAsset.url}
                    onLoadSuccess={() => setIframeLoading(false)}
                    hideToolbar={false}
                    onReachedEnd={handlePDFReachedEnd}
                />
            ) : previewAsset.type === 'ppt' ? (
                <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewAsset.url)}`}
                    className="w-full h-full border-none"
                    title="PPT Review"
                    onLoad={() => setIframeLoading(false)}
                    onContextMenu={(e: any) => e.preventDefault()}
                />
            ) : previewAsset.type === 'video' ? (
                previewAsset.url.includes('mediadelivery.net') ? (
                    <iframe
                        src={previewAsset.url}
                        loading="lazy"
                        className="w-full h-full border-none"
                        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                        allowFullScreen={true}
                        onError={mediaErrorFeedback}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
                        {trackInfo.isAudioOnly && (
                            <div className="w-full flex-1 flex items-center justify-center min-h-0">
                                <VideoAudioVisualizer video={videoElement} />
                            </div>
                        )}
                        <video
                            key={previewAsset.url}
                            ref={setVideoElement}
                            controls
                            src={previewAsset.url}
                            className={trackInfo.isAudioOnly ? "w-full h-14 bg-black shrink-0" : "w-full h-full object-contain max-h-screen"}
                            controlsList="nodownload"
                            crossOrigin="anonymous"
                            onContextMenu={(e: any) => e.preventDefault()}
                            onError={mediaErrorFeedback}
                            onEnded={handleAutoCompleteAfterMedia}
                        />
                    </div>
                )
            ) : (
                <img
                    src={previewAsset.url}
                    className="max-w-full max-h-full object-contain select-none"
                    alt="Asset"
                    onContextMenu={(e: any) => e.preventDefault()}
                    onError={mediaErrorFeedback}
                />
            )}
        </div>
    </div>
)}

            {/* Performance Review Modal */}
            {showReview && (
                <div className="fixed inset-0 z-[4000] bg-brand-charcoal/90 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-brand-charcoal w-full max-w-5xl h-full max-h-[90vh] rounded-xl flex flex-col overflow-hidden shadow-2xl border border-brand-border">
                        <div className="px-8 py-8 border-b border-brand-border flex justify-between items-center shrink-0 bg-brand-beige/20 dark:bg-white/5">
                            <div>
                                <div className="flex items-center gap-2 text-brand-emerald mb-2">
                                    <ShieldCheck size={20} strokeWidth={3} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Decision Intelligence Audit</span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">Performance Report</h3>
                            </div>
                            <button onClick={() => setShowReview(false)} className="w-12 h-12 rounded-2xl bg-white dark:bg-white/10 text-brand-muted flex items-center justify-center hover:text-red-500 transition-all border-none cursor-pointer shadow-sm">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 md:p-12  space-y-12">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="bg-brand-beige/50 dark:bg-white/5 p-8 rounded-[32px] border border-brand-border">
                                    <div className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">Proficiency Ratio</div>
                                    <div className={`text-4xl font-black tracking-tighter ${quizResult?.passed ? 'text-brand-emerald' : 'text-red-500'}`}>{quizResult?.score}%</div>
                                </div>
                                <div className="bg-brand-beige/50 dark:bg-white/5 p-8 rounded-[32px] border border-brand-border">
                                    <div className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">Validation Status</div>
                                    <div className="text-xl font-black text-brand-charcoal dark:text-white uppercase">{quizResult?.passed ? 'Validated' : 'Action Req.'}</div>
                                </div>
                                <div className="bg-brand-beige/50 dark:bg-white/5 p-8 rounded-[32px] border border-brand-border">
                                    <div className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">Payload Units</div>
                                    <div className="text-xl font-black text-brand-charcoal dark:text-white uppercase">{lesson.quiz_data?.questions?.length} Blocks</div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {lesson.quiz_data?.questions?.map((q: any, idx: number) => {
                                    const studentAnswer = selectedAnswers[idx];
                                    const isCorrect = studentAnswer === q.correct_answer;

                                    return (
                                        <div key={idx} className={`p-8 rounded-xl border-2 bg-white dark:bg-white/5 space-y-8 relative overflow-hidden ${isCorrect ? 'border-brand-emerald/20' : 'border-red-500/20'}`}>
                                            <div className={`absolute top-0 left-0 bottom-0 w-2 ${isCorrect ? 'bg-brand-emerald' : 'bg-red-500'}`} />
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Intelligence Block {idx + 1}</span>
                                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${isCorrect ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                    {isCorrect ? 'Validated' : 'Logic Gap'}
                                                </div>
                                            </div>
                                            <h4 className="text-xl md:text-2xl font-black text-brand-charcoal dark:text-white leading-tight tracking-tight">{q.question}</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {q.options.map((opt: string, oIdx: number) => {
                                                    const isStudentPick = studentAnswer === oIdx;
                                                    const isRightAnswer = q.correct_answer === oIdx;

                                                    return (
                                                        <div
                                                            key={oIdx}
                                                            className={`
                                                                p-5 rounded-2xl border-2 flex items-center gap-4 transition-all
                                                                ${isRightAnswer ? 'bg-brand-emerald/10 border-brand-emerald text-brand-charcoal dark:text-white' :
                                                                    isStudentPick ? 'bg-red-500/10 border-red-500 text-red-500' :
                                                                        'bg-transparent border-brand-border text-brand-muted'}
                                                            `}
                                                        >
                                                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] ${isRightAnswer ? 'bg-brand-emerald text-white' : isStudentPick ? 'bg-red-500 text-white' : 'bg-brand-beige dark:bg-white/10'}`}>
                                                                {String.fromCharCode(65 + oIdx)}
                                                            </div>
                                                            <span className="text-sm font-bold flex-1">{opt}</span>
                                                            {isRightAnswer && <CheckCircle2 size={16} strokeWidth={3} className="text-brand-emerald" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-8 bg-brand-beige/20 dark:bg-white/5 border-t border-brand-border shrink-0">
                            <button onClick={() => setShowReview(false)} className="w-full py-5 bg-brand-charcoal text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-brand-emerald transition-all border-none cursor-pointer">
                                Dismiss Audit Report
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAiInteraction && previewAsset && (
                <AIPDFInteraction
                    pdfUrl={previewAsset.url}
                    onClose={() => setShowAiInteraction(false)}
                    aiPutter={aiTutor}
                />
            )}

            {/* Media Error Notification Popup */}
            {mediaError && (
                <div className="fixed inset-0 z-[5000] bg-brand-charcoal/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-brand-charcoal w-full max-w-md rounded-[32px] p-8 flex flex-col items-center text-center shadow-2xl border border-brand-border animate-in zoom-in-95 duration-300 relative">
                        <button 
                            onClick={() => setMediaError(false)} 
                            className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-brand-beige dark:bg-white/10 text-brand-muted flex items-center justify-center hover:text-red-500 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                        
                        <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6 border border-amber-500/20 animate-pulse">
                            <AlertCircle size={32} />
                        </div>
                        
                        <h3 className="text-2xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight mb-3">
                            Media Unavailable
                        </h3>
                        
                        <p className="text-brand-muted text-sm font-medium leading-relaxed mb-6">
                            This media file is currently unavailable. Kindly check back later.
                        </p>
                        
                        <button
                            onClick={() => setMediaError(false)}
                            className="w-full py-4 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-emerald/20 border-none cursor-pointer"
                        >
                            Understood
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LessonView;
