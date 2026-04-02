import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle, CheckCircle2, ShieldCheck, Loader2, PlayCircle, FileText, Eye, X, Video, HelpCircle } from 'lucide-react';
import { usePdfTts } from '../../../utils/usePdfTts';
import ReadAloudControls from '../../../components/student/ReadAloudControls';

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

    // TTS hook — full Read Aloud system
    const tts = usePdfTts();

    // @ts-ignore
    const API_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    // @ts-ignore
    const IS_DEV = (import.meta as any).env.DEV;

    useEffect(() => {
        const fetchLessonData = async () => {
            setLoading(true);
            setQuizStarted(false);
            setCurrentQuestionIndex(0);
            setQuizResult(null);
            setShowReview(false);
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
                        // Flatten modules to get all lessons
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
                            // Ensure quiz_data is an object
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
        return () => { tts.stop(); };
    }, [courseId, lessonId, cohortId, API_URL]);

    useEffect(() => {
        if (lesson) {
            console.log('[DEBUG] Lesson Data:', lesson);
            console.log('[DEBUG] File URL:', lesson.file_url);
            if (lesson.file_url) {
                console.log('[DEBUG] Is PDF Match:', /\.pdf([?#]|$)/i.test(lesson.file_url));
            }
        }
    }, [lesson]);

    // Stop TTS whenever the lesson changes
    useEffect(() => { tts.stop(); }, [lessonId]);





    const toggleReadAloud = () => {
        if (!lesson?.file_url) return;
        if (['playing', 'paused'].includes(tts.ttsState)) {
            tts.stop();
        } else {
            tts.loadAndPlay(lesson.file_url, lesson.file_name);
        }
    };
    if (loading) {
        return (
            <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                <Loader2 className="animate-spin" size={40} color="#1a4d3e" />
                <p style={{ fontWeight: 800, color: '#64748b' }}>Streaming Lesson Content...</p>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <h2 style={{ fontWeight: 900, color: '#0f172a' }}>Lesson Not Found</h2>
                <p style={{ color: '#64748b', fontWeight: 600 }}>The requested lesson could not be loaded.</p>
                <Link to={`/student/courses/${courseId}?cohortId=${cohortId}`} className="btn-primary-forest" style={{ display: 'inline-flex', marginTop: '2rem' }}>Back to Course</Link>
            </div>
        );
    }

    const currentIndex = allLessons.findIndex(l => l.id == lessonId);
    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    const handleNavigateLesson = (id: number) => {
        navigate(`/student/courses/${courseId}/lesson/${id}?cohortId=${cohortId}`);
    };

    const handleCompleteLesson = async (extraData?: { score?: number; answers?: any }) => {
        setIsCompleting(true);
        try {
            const token = localStorage.getItem('token');
            const newStatus = !isCompleted;

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
            }
        } catch (error) {
            console.error("Failed to mark lesson complete", error);
        } finally {
            setIsCompleting(false);
        }
    };

    return (
        <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                    <style>{`
                        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                        @keyframes pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(26, 77, 62, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(26, 77, 62, 0); } 100% { box-shadow: 0 0 0 0 rgba(26, 77, 62, 0); } }
                        
                        .evaluation-premium-card {
                            background: rgba(15, 23, 42, 0.7) !important;
                            backdrop-filter: blur(12px);
                            border: 1px solid rgba(255, 255, 255, 0.08) !important;
                            animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                        }
                        
                        .option-modern {
                            background: rgba(255, 255, 255, 0.03);
                            border: 1.5px solid rgba(255, 255, 255, 0.08);
                            border-radius: 20px;
                            padding: 1.5rem 2rem;
                            color: #cbd5e1;
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                            gap: 1.5rem;
                            cursor: pointer;
                            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                            text-align: left;
                            width: 100%;
                            position: relative;
                            overflow: hidden;
                        }

                        .option-modern:hover:not(:disabled) {
                            background: rgba(255, 255, 255, 0.06);
                            border-color: rgba(255,255,255,0.2);
                            transform: translateX(8px);
                            color: white;
                        }

                        .option-modern.selected {
                            background: rgba(16, 185, 129, 0.1);
                            border-color: #10b981;
                            color: white;
                            box-shadow: 0 10px 40px -10px rgba(16, 185, 129, 0.2);
                        }

                        .option-modern.selected::before {
                            content: '';
                            position: absolute;
                            left: 0;
                            top: 0;
                            bottom: 0;
                            width: 6px;
                            background: #10b981;
                        }

                        .progress-orb {
                            width: 12px;
                            height: 12px;
                            border-radius: 50%;
                            background: rgba(255,255,255,0.1);
                            transition: all 0.3s;
                        }

                        .progress-orb.active {
                            background: #10b981;
                            box-shadow: 0 0 12px #10b981;
                            transform: scale(1.2);
                        }
                        
                        .btn-evaluation-start {
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                            color: white;
                            border: none;
                            padding: 1.25rem 3.5rem;
                            border-radius: 100px;
                            font-weight: 850;
                            font-size: 1.1rem;
                            cursor: pointer;
                            transition: all 0.3s;
                            box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4);
                        }
                        
                        .btn-evaluation-start:hover {
                            transform: translateY(-4px) scale(1.02);
                            box-shadow: 0 20px 35px -8px rgba(16, 185, 129, 0.5);
                        }
                    `}</style>

                    {/* Navigation Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <Link to={`/student/courses/${courseId}?cohortId=${cohortId}`} style={{ display: 'flex', alignItems: 'center', color: '#64748b', fontSize: '0.95rem', fontWeight: 700, textDecoration: 'none' }}>
                            <ChevronLeft size={18} style={{ marginRight: '0.25rem' }} />
                            Back to Course
                        </Link>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => prevLesson && handleNavigateLesson(prevLesson.id)}
                                disabled={!prevLesson}
                                className="btn-cta-white"
                                style={{ border: '1.5px solid #e2e8f0', padding: '0.6rem 1.25rem', fontSize: '0.9rem', borderRadius: '12px', opacity: !prevLesson ? 0.5 : 1 }}
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => nextLesson && handleNavigateLesson(nextLesson.id)}
                                disabled={!nextLesson}
                                className="btn-standard"
                                style={{ background: '#020617', padding: '0.6rem 1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '12px', opacity: !nextLesson ? 0.5 : 1 }}
                            >
                                Next Lesson <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Content Player Container */}
                    <div style={{
                        background: 'black',
                        borderRadius: isMaximized ? '0' : '24px',
                        overflow: 'hidden',
                        aspectRatio: isMaximized ? 'unset' : '16/9',
                        boxShadow: isMaximized ? 'none' : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        marginBottom: '2.5rem',
                        position: isMaximized ? 'fixed' : 'relative',
                        inset: isMaximized ? 0 : 'unset',
                        zIndex: isMaximized ? 2000 : 1,
                        border: isMaximized ? 'none' : '1.5px solid #1e293b'
                    }}>
                        <button
                            onClick={() => setIsMaximized(!isMaximized)}
                            style={{
                                position: 'absolute',
                                top: '1.5rem',
                                right: '1.5rem',
                                zIndex: 2100,
                                background: 'rgba(15, 23, 42, 0.6)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s'
                            }}
                            title={isMaximized ? "Minimize" : "Maximize view"}
                        >
                            {isMaximized ? <X size={20} /> : <Eye size={20} />}
                        </button>

                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)' }}>
                            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                {lesson.type === 'live' ? (
                                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                                        <div style={{ width: '90px', height: '90px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                            <Video size={44} color="#3b82f6" />
                                        </div>
                                        <h3 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 900 }}>Live Session Scheduled</h3>
                                        <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontWeight: 600 }}>Join the upcoming live class hosted on {lesson.live_platform || 'Zoom'}</p>

                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1.5rem', background: '#0f172a', padding: '1.25rem 2.5rem', borderRadius: '16px', border: '1px solid #1e293b', marginBottom: '2rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>Date</span>
                                                <span style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>{lesson.live_date || 'TBA'}</span>
                                            </div>
                                            <div style={{ width: '1px', height: '30px', background: '#1e293b' }}></div>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>Time</span>
                                                <span style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>{lesson.live_time || 'TBA'}</span>
                                            </div>
                                        </div>
                                        <div>
                                            {lesson.live_link ? (
                                                <a
                                                    href={lesson.live_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ display: 'inline-flex', background: '#3b82f6', color: 'white', padding: '1rem 2.5rem', borderRadius: '14px', fontWeight: 800, textDecoration: 'none', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)', alignItems: 'center', gap: '0.5rem' }}
                                                >
                                                    <Video size={18} /> Join Live Class
                                                </a>
                                            ) : (
                                                <span style={{ padding: '0.75rem 1.5rem', background: '#1e293b', color: '#64748b', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem' }}>Meeting Link Pending</span>
                                            )}
                                        </div>
                                    </div>
                                ) : (lesson.type === 'quiz' || quizStarted) ? (
                                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(165deg, #020617 0%, #0f172a 100%)', display: 'flex', flexDirection: 'column' }}>
                                        {!quizStarted ? (
                                            <div style={{ margin: 'auto', textAlign: 'center', maxWidth: '700px', padding: '3rem' }} className="evaluation-premium-card">
                                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
                                                    <div style={{ position: 'relative' }}>
                                                        <div style={{ position: 'absolute', inset: -15, background: 'rgba(16, 185, 129, 0.1)', borderRadius: '40px', filter: 'blur(10px)' }}></div>
                                                        <div style={{ width: '120px', height: '120px', background: 'rgba(255, 255, 255, 0.03)', border: '1.5px solid rgba(255, 255, 255, 0.1)', borderRadius: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                                            <HelpCircle size={56} color="#10b981" />
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '6px 14px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '0.05em', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                                    <ShieldCheck size={14} /> Knowledge Validation Unit
                                                </div>
                                                
                                                <h2 style={{ color: 'white', fontWeight: 900, fontSize: '2.5rem', marginBottom: '1rem', letterSpacing: '-0.04em' }}>Evaluation Intelligence</h2>
                                                <p style={{ color: '#94a3b8', fontSize: '1.15rem', lineHeight: 1.6, marginBottom: '3rem', fontWeight: 500 }}>
                                                    Complete this diagnostic module to validate your proficiency in the core concepts covered. Minimum <span style={{ color: '#10b981', fontWeight: 900 }}>{lesson.quiz_data?.pass_mark || 80}%</span> required for certification.
                                                </p>
                                                
                                                <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '3.5rem' }}>
                                                    <div style={{ textAlign: 'left', padding: '1rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px' }}>Question Payload</div>
                                                        <div style={{ color: 'white', fontWeight: 900, fontSize: '1.25rem' }}>{lesson.quiz_data?.questions?.length || 0} Critical Blocks</div>
                                                    </div>
                                                    <div style={{ textAlign: 'left', padding: '1rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px' }}>Passing Criteria</div>
                                                        <div style={{ color: 'white', fontWeight: 800, fontSize: '1.25rem' }}>{lesson.quiz_data?.pass_mark || 80}% Proficiency</div>
                                                    </div>
                                                </div>
                                                
                                                <button onClick={() => setQuizStarted(true)} className="btn-evaluation-start">
                                                    INITIALIZE ASSESSMENT
                                                </button>
                                            </div>
                                        ) : quizResult ? (
                                            <div style={{ margin: 'auto', textAlign: 'center', maxWidth: '750px', padding: '4rem' }} className="evaluation-premium-card">
                                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
                                                    <div style={{ 
                                                        width: '140px', 
                                                        height: '140px', 
                                                        background: quizResult.passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                                                        borderRadius: '50%', 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center', 
                                                        border: `2px solid ${quizResult.passed ? '#10b981' : '#ef4444'}`,
                                                        animation: 'pulseGlow 2s infinite'
                                                    }}>
                                                        {quizResult.passed ? <CheckCircle size={64} color="#10b981" /> : <X size={64} color="#ef4444" />}
                                                    </div>
                                                </div>
                                                
                                                <div style={{ color: quizResult.passed ? '#10b981' : '#ef4444', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.15em', marginBottom: '1rem' }}>
                                                    {quizResult.passed ? 'Criteria Validated' : 'Deficiency Identified'}
                                                </div>
                                                
                                                <h2 style={{ color: 'white', fontWeight: 950, fontSize: '3.5rem', marginBottom: '1rem', letterSpacing: '-0.05em' }}>
                                                    {quizResult.score}<span style={{ fontSize: '1.5rem', verticalAlign: 'middle', marginLeft: '4px', opacity: 0.6 }}>%</span>
                                                </h2>
                                                
                                                <p style={{ color: '#94a3b8', fontSize: '1.25rem', marginBottom: '3.5rem', maxWidth: '600px', margin: '0 auto 3.5rem', fontWeight: 500 }}>
                                                    {quizResult.passed 
                                                        ? `Exceptional work! You have mastered this cognitive module with a score of ${quizResult.score}%.` 
                                                        : `You achieved a proficiency level of ${quizResult.score}%, which is below the mandatory ${lesson.quiz_data.pass_mark}% threshold for this curriculum unit.`}
                                                </p>
                                                
                                                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                                                    <button
                                                        onClick={() => setShowReview(true)}
                                                        style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1.5px solid rgba(255,255,255,0.1)', padding: '1rem 2.5rem', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                    >
                                                        <Eye size={18} /> Analysis Review
                                                    </button>
                                                    
                                                    {quizResult.passed ? (
                                                        <button
                                                            onClick={() => handleCompleteLesson({ score: quizResult.score, answers: selectedAnswers })}
                                                            style={{ background: '#10b981', color: 'white', border: 'none', padding: '1rem 3rem', borderRadius: '16px', fontWeight: 850, cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)' }}
                                                        >
                                                            {isCompleted ? 'SYNC UPDATES' : 'FINALIZE & ADVANCE'}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setQuizStarted(false);
                                                                setQuizResult(null);
                                                                setSelectedAnswers({});
                                                                setCurrentQuestionIndex(0);
                                                            }}
                                                            style={{ background: 'white', color: '#0f172a', border: 'none', padding: '1rem 3rem', borderRadius: '16px', fontWeight: 850, cursor: 'pointer' }}
                                                        >
                                                            RETRY ASSESSMENT
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                                                {/* Cognitive Progress bar - Pinned at top */}
                                                <div style={{ padding: '2rem 3rem 0', flexShrink: 0 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                                            <span style={{ color: '#10b981', fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Target Module: Intelligence Diagnostic</span>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                {lesson.quiz_data.questions.map((_: any, i: number) => (
                                                                    <div key={i} className={`progress-orb ${i <= currentQuestionIndex ? 'active' : ''}`}></div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div style={{ color: '#64748b', fontWeight: 800, fontSize: '0.9rem' }}>
                                                            {currentQuestionIndex + 1} <span style={{ opacity: 0.4 }}>/</span> {lesson.quiz_data.questions.length}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Scrollable Content Area */}
                                                <div style={{ flex: 1, overflowY: 'auto', padding: '0 3rem 2rem' }}>
                                                    <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
                                                        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                                                            <span style={{ color: '#10b981', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '4px 12px', borderRadius: '100px', marginBottom: '1.5rem', display: 'inline-block' }}>Block {currentQuestionIndex + 1}</span>
                                                            <h3 style={{ color: 'white', fontSize: '2rem', fontWeight: 900, lineHeight: 1.25, letterSpacing: '-0.03em' }}>
                                                                {lesson.quiz_data.questions[currentQuestionIndex].question}
                                                            </h3>
                                                        </div>
                                                        
                                                        <div className="options-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                                            <style>{`
                                                                @media (max-width: 900px) {
                                                                    .options-grid { grid-template-columns: 1fr !important; }
                                                                }
                                                                @media (max-height: 800px) {
                                                                    .option-modern { padding: 1rem 1.5rem !important; }
                                                                }
                                                            `}</style>
                                                            {lesson.quiz_data.questions[currentQuestionIndex].options.map((opt: string, idx: number) => {
                                                                const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                                                                return (
                                                                    <button
                                                                        key={idx}
                                                                        onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: idx })}
                                                                        className={`option-modern ${isSelected ? 'selected' : ''}`}
                                                                    >
                                                                        <div style={{ 
                                                                            width: '28px', 
                                                                            height: '28px', 
                                                                            borderRadius: '10px', 
                                                                            border: '2px solid', 
                                                                            borderColor: isSelected ? '#10b981' : 'rgba(255,255,255,0.1)', 
                                                                            display: 'flex', 
                                                                            alignItems: 'center', 
                                                                            justifyContent: 'center',
                                                                            flexShrink: 0,
                                                                            background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'transparent'
                                                                        }}>
                                                                            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: isSelected ? 'white' : '#64748b' }}>{String.fromCharCode(65 + idx)}</span>
                                                                        </div>
                                                                        {opt}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Pinned Footer */}
                                                <div style={{ padding: '2rem 3rem', background: 'rgba(2, 6, 23, 0.5)', backdropFilter: 'blur(10px)', borderTop: '1.5px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '900px', margin: '0 auto' }}>
                                                        <button
                                                            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                                                            disabled={currentQuestionIndex === 0}
                                                            style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 850, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', opacity: currentQuestionIndex === 0 ? 0 : 1 }}
                                                        >
                                                            <ChevronLeft size={20} /> PREVIOUS LOGIC
                                                        </button>
                                                        
                                                        {currentQuestionIndex < lesson.quiz_data.questions.length - 1 ? (
                                                            <button
                                                                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                                                                className="btn-standard"
                                                                style={{ background: 'white', color: '#0f172a', padding: '1rem 3rem', borderRadius: '16px', fontWeight: 900, boxShadow: '0 10px 25px -5px rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}
                                                            >
                                                                NEXT BLOCK <ChevronRight size={20} />
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
                                                                    setQuizResult({ score, passed: score >= passMark });
                                                                }}
                                                                disabled={selectedAnswers[currentQuestionIndex] === undefined}
                                                                className="btn-evaluation-start"
                                                                style={{ 
                                                                    padding: '1rem 4rem', 
                                                                    borderRadius: '16px',
                                                                    opacity: selectedAnswers[currentQuestionIndex] === undefined ? 0.3 : 1,
                                                                    cursor: selectedAnswers[currentQuestionIndex] === undefined ? 'not-allowed' : 'pointer'
                                                                }}
                                                            >
                                                                CALCULATE PROFICIENCY
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : lesson.video_url ? (
                                    <video
                                        controls
                                        src={lesson.video_url}
                                                        autoPlay
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        controlsList="nodownload"
                                        onContextMenu={(e: any) => e.preventDefault()}
                                    />
                                ) : lesson.file_url ? (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                                        {lesson.file_url.match(/\.(jpg|jpeg|png|gif|webp)([?#]|$)/i) ? (
                                            <img
                                                src={lesson.file_url}
                                                alt={lesson.title}
                                                style={{ maxWidth: '100%', maxHeight: '100%', userSelect: 'none', pointerEvents: 'none', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                                onContextMenu={(e: any) => e.preventDefault()}
                                            />
                                        ) : lesson.file_url.match(/\.(mp4|webm|ogg|ogv)([?#]|$)/i) ? (
                                            <video
                                                controls
                                                src={lesson.file_url}
                                                style={{ width: '100%', height: '100%', borderRadius: '16px', objectFit: 'contain' }}
                                                controlsList="nodownload"
                                                onContextMenu={(e: any) => e.preventDefault()}
                                            />
                                        ) : (lesson.file_url.match(/\.pdf([?#]|$)/i) || lesson.file_url.match(/\.(pptx?)([?#]|$)/i)) ? (
                                            <div
                                                id="document-lesson-viewer"
                                                style={{
                                                    width: '100%', height: '100%', display: 'flex',
                                                    flexDirection: 'column', alignItems: 'center',
                                                    justifyContent: 'center', minHeight: '600px',
                                                    background: '#f8fafc', borderRadius: '32px',
                                                    border: '1.5px solid #f1f5f9', padding: '4rem',
                                                    position: 'relative'
                                                }}
                                            >
                                                {/* Instructional Resource Overview (Always visible) */}
                                                <div style={{
                                                    width: '100%', height: '100%', display: 'flex',
                                                    flexDirection: 'column', alignItems: 'center',
                                                    justifyContent: 'center', textAlign: 'center'
                                                }}>
                                                    <div style={{
                                                        width: '180px', height: '120px', background: '#f8fafc',
                                                        borderRadius: '24px', display: 'flex', alignItems: 'center',
                                                        justifyContent: 'center', marginBottom: '2.5rem',
                                                        boxShadow: '0 25px 50px -12px rgba(26, 77, 62, 0.2)',
                                                        overflow: 'hidden', border: '3px solid white'
                                                    }}>
                                                        {lesson.courseImage ? (
                                                            <img src={lesson.courseImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Session Preview" />
                                                        ) : (
                                                            <FileText size={48} color="#1a4d3e" opacity={0.6} />
                                                        )}
                                                    </div>
                                                    <h3 style={{ margin: '0 0 12px 0', fontSize: '2rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.03em' }}>
                                                         Instructional Resource Ready
                                                    </h3>
                                                    <p style={{ margin: '0 0 3rem 0', color: '#64748b', fontSize: '1.25rem', fontWeight: 600, maxWidth: '520px', lineHeight: 1.6 }}>
                                                        Your lesson materials have been architected. Start the neural narrator or explore the visual library below.
                                                    </p>
                                                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', alignItems: 'center' }}>
                                                        <button
                                                            onClick={toggleReadAloud}
                                                            className="btn-primary-forest"
                                                            style={{ 
                                                                padding: '0 3rem', height: '64px', fontSize: '1.1rem', fontWeight: 900,
                                                                boxShadow: '0 20px 40px -8px rgba(26, 77, 62, 0.3)',
                                                                borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '12px'
                                                            }}
                                                        >
                                                            <PlayCircle size={24} /> Listen to Lesson
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const assetsSection = document.getElementById('lesson-assets-sidebar');
                                                                if (assetsSection) {
                                                                    assetsSection.scrollIntoView({ behavior: 'smooth' });
                                                                }
                                                            }}
                                                            style={{
                                                                padding: '0 2.5rem', height: '64px', fontSize: '1.1rem',
                                                                background: 'rgba(2, 6, 23, 0.03)', border: '1.5px solid #e2e8f0', borderRadius: '20px',
                                                                color: '#475569', fontWeight: 850, cursor: 'pointer', transition: 'all 0.3s',
                                                                display: 'flex', alignItems: 'center', gap: '10px'
                                                            }}
                                                            onMouseEnter={(e: any) => { e.currentTarget.style.borderColor = '#1a4d3e'; e.currentTarget.style.color = '#1a4d3e'; e.currentTarget.style.background = 'white'; }}
                                                            onMouseLeave={(e: any) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'rgba(2, 6, 23, 0.03)'; }}
                                                        >
                                                            <Eye size={22} /> View Assets
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '4rem' }}>
                                                <div style={{ width: '80px', height: '80px', background: '#f1f5f9', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                                    <FileText size={40} color="#1a4d3e" opacity={0.5} />
                                                </div>
                                                <p style={{ color: '#1a4d3e', fontWeight: 900, fontSize: '1.25rem', margin: '0 0 8px 0' }}>Material Resource Prepared</p>
                                                <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 600 }}>{lesson.file_name || 'Attached File'}</p>
                                                <div
                                                    onClick={() => {
                                                        const assetsSection = document.getElementById('lesson-assets-sidebar');
                                                        if (assetsSection) assetsSection.scrollIntoView({ behavior: 'smooth' });
                                                    }}
                                                    style={{ marginTop: '2rem', background: '#f8fafc', border: '1.5px solid #e2e8f0', color: '#1a4d3e', padding: '0.85rem 2rem', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                                                >
                                                    <Eye size={18} /> Review Lesson Assets
                                                </div>
                                            </div>

                                        )}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ width: '90px', height: '90px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', margin: '0 auto 1.5rem auto', cursor: 'pointer', transition: 'all 0.3s', border: '1.5px solid rgba(255,255,255,0.1)' }}>
                                            <svg width="44" height="44" viewBox="0 0 24 24" fill="white" style={{ marginLeft: '6px' }}><path d="M8 5v14l11-7z"/></svg>
                                        </div>
                                        <p style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 600 }}>Secure Content Stream Prepared</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3.5rem' }}>
                        <div>
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1a4d3e', marginBottom: '0.75rem' }}>
                                    <PlayCircle size={18} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{lesson.moduleTitle}</span>
                                </div>
                                <h1 style={{ fontSize: '2.5rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.04em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    {lesson.title}
                                    {lesson.file_url && (
                                        <button
                                            onClick={toggleReadAloud}
                                            disabled={tts.ttsState === 'extracting'}
                                            style={{
                                                background: ['playing','paused'].includes(tts.ttsState) ? 'rgba(26, 77, 62, 0.12)' : '#f8fafc',
                                                border: '1.5px solid',
                                                borderColor: ['playing','paused'].includes(tts.ttsState) ? '#1a4d3e' : '#e2e8f0',
                                                padding: '5px 12px', borderRadius: '100px', color: '#1a4d3e',
                                                fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px',
                                                cursor: tts.ttsState === 'extracting' ? 'not-allowed' : 'pointer',
                                                opacity: tts.ttsState === 'extracting' ? 0.6 : 1,
                                                transition: 'all 0.3s', boxShadow: ['playing','paused'].includes(tts.ttsState) ? '0 4px 15px rgba(26,77,62,0.2)' : 'none'
                                            }}
                                        >
                                            {tts.ttsState === 'extracting' ? <><div className="animate-spin" style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%' }} /> Extracting...</>
                                            : ['playing','paused','switching'].includes(tts.ttsState) ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg> Stop Narrator</>
                                            : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg> Read Aloud</>}
                                        </button>
                                    )}
                                </h1>

                            </div>

                            <div style={{ color: '#475569', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '3rem', fontWeight: 500 }}>
                                <p>{lesson.description || 'No description available for this lesson.'}</p>
                            </div>

                            <div style={{ paddingTop: '2rem', borderTop: '1.5px solid #f1f5f9' }}>
                                <button
                                    onClick={() => {
                                        const quizData = typeof lesson.quiz_data === 'string' ? JSON.parse(lesson.quiz_data) : lesson.quiz_data;
                                        if (quizData && quizData.questions && quizData.questions.length > 0) {
                                            setQuizStarted(true);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        } else {
                                            handleCompleteLesson();
                                        }
                                    }}
                                    disabled={isCompleted || isCompleting}
                                    className="btn-primary-forest"
                                    style={{ padding: '1rem 3rem', height: '60px', fontSize: '1.1rem', background: isCompleted ? '#f1f5f9' : '#1a4d3e', color: isCompleted ? '#94a3b8' : 'white' }}
                                >
                                    {isCompleting ? <Loader2 className="animate-spin" /> : isCompleted ? 'Session Validated' : (lesson.quiz_data ? 'Initialize Validation Quiz' : 'Finalize Lesson')}
                                </button>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div>
                            <div id="lesson-assets-sidebar" style={{ padding: '2rem', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '24px', transition: 'all 0.4s ease' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Eye size={20} color="#1a4d3e" /> Lesson Assets
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {lesson.file_url ? (
                                        <div style={{ padding: '1rem', background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ background: '#f1f5f9', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FileText size={18} color="#1a4d3e" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>{lesson.file_name || 'Resource Material'}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Available for Review</div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const url = lesson.file_url || '';
                                                    const isPdf = /\.pdf([?#]|$)/i.test(url) || (lesson.file_name && /\.pdf$/i.test(lesson.file_name));
                                                    const isPpt = /\.(pptx?)([?#]|$)/i.test(url);
                                                    const isVideo = /\.(mp4|webm|ogg|ogv)([?#]|$)/i.test(url);
                                                    setIframeLoading(true);
                                                    setPreviewAsset({ url, type: isPdf ? 'pdf' : isPpt ? 'ppt' : isVideo ? 'video' : 'image' });
                                                }}
                                                style={{ padding: '8px 12px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', color: '#1a4d3e', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}
                                            >
                                                <Eye size={14} /> Preview
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ padding: '1rem', border: '1.5px dashed #e2e8f0', borderRadius: '14px', textAlign: 'center' }}>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>No additional assets for this unit.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Asset Preview Modal */}
            {
                previewAsset && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, background: 'white' }}>
                        <div style={{ background: 'white', overflow: 'hidden', width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '1.25rem 2rem', borderBottom: '1.5px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fcfdfe' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{ padding: '10px', borderRadius: '14px', background: '#f0fdf4' }}>
                                        {previewAsset.type === 'pdf' || previewAsset.type === 'ppt' ? <FileText size={22} color="#1a4d3e" /> : <Eye size={22} color="#1a4d3e" />}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontWeight: 950, color: '#0f172a', letterSpacing: '-0.02em' }}>Unit Resource Review</h3>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Secure Curriculum Stream • Unauthorized distribution is prohibited</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <button 
                                        onClick={toggleReadAloud}
                                        disabled={tts.ttsState === 'extracting'}
                                        style={{ 
                                            background: ['playing','paused'].includes(tts.ttsState) ? 'rgba(26, 77, 62, 0.1)' : '#f8fafc', 
                                            border: '1.5px solid', 
                                            borderColor: ['playing','paused'].includes(tts.ttsState) ? '#1a4d3e' : '#e2e8f0',
                                            padding: '4px 10px',
                                            borderRadius: '100px',
                                            color: '#1a4d3e',
                                            fontSize: '0.7rem',
                                            fontWeight: 800,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            opacity: tts.ttsState === 'extracting' ? 0.6 : 1
                                        }}
                                    >
                                        {tts.ttsState === 'extracting' ? <div className="animate-spin" style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%' }} /> : ['playing','paused'].includes(tts.ttsState) ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>}
                                        {tts.ttsState === 'extracting' ? 'Extracting...' : ['playing','paused'].includes(tts.ttsState) ? 'Stop' : 'Read Aloud'}
                                    </button>
                                    <button
                                        onClick={() => setPreviewAsset(null)}
                                        style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
                                    >
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                    </button>
                                </div>
                            </div>

                            <div style={{ flex: 1, padding: 0, background: '#f8fafc', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                                {iframeLoading && (previewAsset.type === 'pdf' || previewAsset.type === 'ppt') && (
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', zIndex: 10 }}>
                                        <div style={{ position: 'relative', marginBottom: '2rem' }}>
                                            <div style={{ width: '80px', height: '80px', borderRadius: '24px', border: '4px solid #f1f5f9', borderTopColor: '#1a4d3e', animation: 'spin-lesson 1s linear infinite' }}></div>
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a4d3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                                            </div>
                                        </div>
                                        <h4 style={{ margin: 0, fontWeight: 900, color: '#0f172a', fontSize: '1.25rem' }}>Architecting Secure View...</h4>
                                        <p style={{ marginTop: '0.75rem', fontWeight: 600, color: '#64748b', fontSize: '0.9rem' }}>Preparing high-fidelity instructional workspace</p>
                                        <style>{`
                                            @keyframes spin-lesson { to { transform: rotate(360deg); } }
                                        `}</style>
                                    </div>
                                )}
                                {(previewAsset.type === 'pdf' || previewAsset.type === 'ppt') ? (
                                    <iframe
                                        src={previewAsset.type === 'ppt' 
                                            ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewAsset.url)}`
                                            : `${previewAsset.url}#toolbar=0&navpanes=0`}
                                        style={{ width: '100%', height: '100%', border: 'none', opacity: iframeLoading ? 0 : 1, transition: 'opacity 0.4s ease' }}
                                        title="Asset Review"
                                        onLoad={() => setIframeLoading(false)}
                                        onContextMenu={(e: any) => e.preventDefault()}
                                    />
                                ) : previewAsset.type === 'video' ? (
                                    <video
                                        controls
                                        src={previewAsset.url}
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        controlsList="nodownload"
                                        onContextMenu={(e: any) => e.preventDefault()}
                                    />
                                ) : (
                                    <img
                                        src={previewAsset.url}
                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', userSelect: 'none', pointerEvents: 'none' }}
                                        alt="Asset Review"
                                        onContextMenu={(e: any) => e.preventDefault()}
                                    />
                                )}
                            </div>
                            <div style={{ padding: '0.75rem 2rem', background: '#fcfdfe', borderTop: '1.5px solid #f1f5f9', textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Protected by Global Security Protocol</p>
                            </div>
                        </div>
                    </div>
                )
            }


            {/* Premium Review Modal */}
            {showReview && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.9)', backdropFilter: 'blur(16px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div style={{ background: '#0f172a', width: '100%', maxWidth: '900px', maxHeight: '90vh', borderRadius: '40px', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.1)', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)' }}>
                        <div style={{ padding: '2.5rem 3.5rem', borderBottom: '1.5px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', marginBottom: '8px' }}>
                                    <ShieldCheck size={20} />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Decision Intelligence Analysis</span>
                                </div>
                                <h3 style={{ margin: 0, fontWeight: 950, color: 'white', fontSize: '1.75rem', letterSpacing: '-0.02em' }}>Evaluation Performance Audit</h3>
                            </div>
                            <button onClick={() => setShowReview(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', width: '48px', height: '48px', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div style={{ flex: 1, overflowY: 'auto', padding: '3.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '4rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, marginBottom: '0.5rem' }}>SCORE RATIO</div>
                                    <div style={{ color: quizResult?.passed ? '#10b981' : '#ef4444', fontWeight: 950, fontSize: '2rem' }}>{quizResult?.score}%</div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, marginBottom: '0.5rem' }}>STATUS</div>
                                    <div style={{ color: 'white', fontWeight: 950, fontSize: '1.25rem', marginTop: '0.75rem' }}>{quizResult?.passed ? 'VALIDATED' : 'ACTION REQUIRED'}</div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, marginBottom: '0.5rem' }}>TOTAL BLOCKS</div>
                                    <div style={{ color: 'white', fontWeight: 950, fontSize: '1.25rem', marginTop: '0.75rem' }}>{lesson.quiz_data?.questions?.length} Units</div>
                                </div>
                            </div>

                            {(() => {
                                const quizData = typeof lesson.quiz_data === 'string' ? JSON.parse(lesson.quiz_data) : lesson.quiz_data;
                                return quizData?.questions?.map((q: any, idx: number) => {
                                    const studentAnswer = selectedAnswers[idx];
                                    const isCorrect = studentAnswer === q.correct_answer;
                                    
                                    return (
                                        <div key={idx} style={{ marginBottom: '3rem', padding: '2.5rem', borderRadius: '32px', border: `1.5px solid ${isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`, background: 'rgba(255, 255, 255, 0.02)', position: 'relative', overflow: 'hidden' }}>
                                            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: isCorrect ? '#10b981' : '#ef4444' }}></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.1em' }}>Intelligence Block {idx + 1}</span>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: isCorrect ? '#10b981' : '#ef4444', background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '6px 14px', borderRadius: '100px', border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
                                                    {isCorrect ? 'VALIDATED' : 'LOGIC ERROR'}
                                                </div>
                                            </div>
                                            <h4 style={{ margin: '0 0 2rem 0', fontWeight: 850, color: 'white', lineHeight: 1.4, fontSize: '1.35rem', letterSpacing: '-0.02em' }}>{q.question}</h4>
                                            <div style={{ display: 'grid', gap: '1rem' }}>
                                                {q.options.map((opt: string, oIdx: number) => {
                                                    const isStudentPick = studentAnswer === oIdx;
                                                    const isRightAnswer = q.correct_answer === oIdx;
                                                    
                                                    return (
                                                        <div 
                                                            key={oIdx} 
                                                            style={{ 
                                                                padding: '1.25rem 1.5rem', 
                                                                borderRadius: '16px', 
                                                                background: isRightAnswer ? 'rgba(16, 185, 129, 0.1)' : isStudentPick ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.02)',
                                                                border: `1.5px solid ${isRightAnswer ? '#10b981' : isStudentPick ? '#ef4444' : 'rgba(255,255,255,0.05)'}`,
                                                                color: isRightAnswer ? 'white' : isStudentPick ? '#ef4444' : '#94a3b8',
                                                                fontWeight: (isStudentPick || isRightAnswer) ? 800 : 600,
                                                                fontSize: '1rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '14px'
                                                            }}
                                                        >
                                                            <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                {(isStudentPick || isRightAnswer) && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'currentColor' }}></div>}
                                                            </div>
                                                            {opt}
                                                            {isRightAnswer && <CheckCircle2 size={18} style={{ marginLeft: 'auto', color: '#10b981' }} />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                        <div style={{ padding: '2rem 3.5rem', background: 'rgba(255,255,255,0.02)', borderTop: '1.5px solid rgba(255,255,255,0.05)' }}>
                            <button onClick={() => setShowReview(false)} className="btn-evaluation-start" style={{ width: '100%', borderRadius: '20px' }}>CLOSE AUDIT REPORT</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TTS Mini Player ── */}
            <ReadAloudControls tts={tts} onClose={tts.stop} />
        </div>
    );
};

export default LessonView;
