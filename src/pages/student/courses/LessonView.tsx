import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle, Play, Loader2, PlayCircle, FileText, Eye, X, Video, HelpCircle } from 'lucide-react';

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
    const [previewAsset, setPreviewAsset] = useState<{ url: string; type: 'image' | 'pdf' | 'video' } | null>(null);
    const [iframeLoading, setIframeLoading] = useState(true);

    // Quiz State
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
    const [quizResult, setQuizResult] = useState<{ score: number, passed: boolean } | null>(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const fetchLessonData = async () => {
            setLoading(true);
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
                                    moduleTitle: mod.title
                                });
                            });
                        });
                        setAllLessons(flattenedLessons);

                        const currentLesson = flattenedLessons.find(l => l.id == lessonId);
                        if (currentLesson) {
                            setLesson(currentLesson);
                            const completedEntry = data.completed_lessons?.find((cl: any) => cl.id == lessonId);
                            if (completedEntry) {
                                setIsCompleted(true);
                                if (currentLesson.type === 'quiz' && completedEntry.pivot?.score !== null && completedEntry.pivot?.score !== undefined) {
                                    const quizData = typeof currentLesson.quiz_data === 'string' ? JSON.parse(currentLesson.quiz_data) : currentLesson.quiz_data;
                                    setQuizResult({ 
                                        score: completedEntry.pivot.score, 
                                        passed: completedEntry.pivot.score >= (quizData?.pass_mark || 80) 
                                    });
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
                        borderRadius: '24px',
                        overflow: 'hidden',
                        aspectRatio: '16/9',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        marginBottom: '2.5rem',
                        position: 'relative',
                        border: '1.5px solid #1e293b'
                    }}>
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
                                ) : lesson.type === 'quiz' ? (
                                    <div style={{ width: '100%', height: '100%', padding: '3rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                                        {!quizStarted ? (
                                            <div style={{ textAlign: 'center', margin: 'auto' }}>
                                                <div style={{ width: '100px', height: '100px', background: 'rgba(26, 77, 62, 0.1)', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', border: '1px solid rgba(26, 77, 62, 0.3)' }}>
                                                    <HelpCircle size={48} color="#1a4d3e" />
                                                </div>
                                                <h2 style={{ color: 'white', fontWeight: 900, fontSize: '2rem', marginBottom: '1rem' }}>Knowledge Validation Unit</h2>
                                                <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
                                                    Complete this evaluation to validate your mastery of the concepts covered in this module.
                                                </p>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', maxWidth: '400px', margin: '0 auto 3rem', background: '#0f172a', padding: '1.5rem', borderRadius: '20px', border: '1px solid #1e293b' }}>
                                                    <div style={{ textAlign: 'left' }}>
                                                        <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>Items</div>
                                                        <div style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>{lesson.quiz_data?.questions?.length || 0} Questions</div>
                                                    </div>
                                                    <div style={{ textAlign: 'left' }}>
                                                        <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>Pass Mark</div>
                                                        <div style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>{lesson.quiz_data?.pass_mark || 80}% Proficiency</div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setQuizStarted(true)}
                                                    className="btn-standard"
                                                    style={{ background: '#1a4d3e', color: 'white', padding: '1rem 3rem', fontSize: '1.1rem' }}
                                                >
                                                    Initialize Evaluation
                                                </button>
                                            </div>
                                        ) : quizResult ? (
                                            <div style={{ textAlign: 'center', margin: 'auto' }}>
                                                <div style={{ width: '100px', height: '100px', background: quizResult.passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', border: `1px solid ${quizResult.passed ? '#10b98140' : '#ef444440'}` }}>
                                                    {quizResult.passed ? <CheckCircle size={48} color="#10b981" /> : <X size={48} color="#ef4444" />}
                                                </div>
                                                <h2 style={{ color: 'white', fontWeight: 900, fontSize: '2rem', marginBottom: '1rem' }}>
                                                    {quizResult.passed ? 'Evaluation Mastered' : 'Action Required: Knowledge Gap Detected'}
                                                </h2>
                                                <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
                                                    You scored <span style={{ color: quizResult.passed ? '#10b981' : '#ef4444', fontWeight: 900 }}>{quizResult.score}%</span>
                                                    {quizResult.passed ? '. You have met the proficiency threshold.' : `. A minimum of ${lesson.quiz_data.pass_mark}% is required to advance.`}
                                                </p>

                                                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                                                    <button
                                                        onClick={() => {
                                                            setQuizStarted(false);
                                                            setQuizResult(null);
                                                            setSelectedAnswers({});
                                                            setCurrentQuestionIndex(0);
                                                        }}
                                                        className="btn-standard"
                                                        style={{ background: 'white', color: '#0f172a', padding: '0.8rem 2rem' }}
                                                    >
                                                        Retry Evaluation
                                                    </button>
                                                    {quizResult.passed && !isCompleted && (
                                                        <button
                                                            onClick={() => handleCompleteLesson({ score: quizResult.score, answers: selectedAnswers })}
                                                            className="btn-standard"
                                                            style={{ background: '#1a4d3e', color: 'white', padding: '0.8rem 2.5rem' }}
                                                        >
                                                            Mark as Completed
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                                                    <div style={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
                                                        Question {currentQuestionIndex + 1} of {lesson.quiz_data.questions.length}
                                                    </div>
                                                    <div style={{ width: '200px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${((currentQuestionIndex + 1) / lesson.quiz_data.questions.length) * 100}%`, height: '100%', background: '#1a4d3e', borderRadius: '3px', transition: 'width 0.3s ease' }}></div>
                                                    </div>
                                                </div>

                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                    <h3 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 800, marginBottom: '3rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto 3rem' }}>
                                                        {lesson.quiz_data.questions[currentQuestionIndex].question}
                                                    </h3>

                                                    <div style={{ display: 'grid', gap: '1rem', maxWidth: '600px', width: '100%', margin: '0 auto' }}>
                                                        {lesson.quiz_data.questions[currentQuestionIndex].options.map((opt: string, idx: number) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: idx })}
                                                                style={{
                                                                    padding: '1.25rem 2rem',
                                                                    background: selectedAnswers[currentQuestionIndex] === idx ? 'rgba(26, 77, 62, 0.2)' : 'rgba(255,255,255,0.03)',
                                                                    border: `1.5px solid ${selectedAnswers[currentQuestionIndex] === idx ? '#1a4d3e' : 'rgba(255,255,255,0.1)'}`,
                                                                    borderRadius: '16px',
                                                                    color: 'white',
                                                                    textAlign: 'left',
                                                                    fontSize: '1rem',
                                                                    fontWeight: 700,
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '1.25rem'
                                                                }}
                                                            >
                                                                <div style={{
                                                                    width: '24px',
                                                                    height: '24px',
                                                                    borderRadius: '50%',
                                                                    border: '2px solid',
                                                                    borderColor: selectedAnswers[currentQuestionIndex] === idx ? '#1a4d3e' : '#64748b',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}>
                                                                    {selectedAnswers[currentQuestionIndex] === idx && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#1a4d3e' }}></div>}
                                                                </div>
                                                                {opt}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <button
                                                        onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                                                        disabled={currentQuestionIndex === 0}
                                                        style={{ background: 'none', border: 'none', color: '#94a3b8', fontWeight: 700, cursor: 'pointer', opacity: currentQuestionIndex === 0 ? 0.3 : 1 }}
                                                    >
                                                        Previous Question
                                                    </button>

                                                    {currentQuestionIndex < lesson.quiz_data.questions.length - 1 ? (
                                                        <button
                                                            onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                                                            disabled={selectedAnswers[currentQuestionIndex] === undefined}
                                                            className="btn-standard"
                                                            style={{ background: '#1a4d3e', color: 'white', padding: '0.75rem 2rem', opacity: selectedAnswers[currentQuestionIndex] === undefined ? 0.5 : 1 }}
                                                        >
                                                            Next Question
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
                                                            className="btn-standard"
                                                            style={{ background: '#1a4d3e', color: 'white', padding: '0.75rem 2.5rem', opacity: selectedAnswers[currentQuestionIndex] === undefined ? 0.5 : 1 }}
                                                        >
                                                            Submit Analysis
                                                        </button>
                                                    )}
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
                                        {lesson.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                            <img
                                                src={lesson.file_url}
                                                alt={lesson.title}
                                                style={{ maxWidth: '100%', maxHeight: '100%', userSelect: 'none', pointerEvents: 'none', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                                onContextMenu={(e: any) => e.preventDefault()}
                                            />
                                        ) : lesson.file_url.match(/\.(mp4|webm|ogg|ogv)$/i) ? (
                                            <video
                                                controls
                                                src={lesson.file_url}
                                                style={{ width: '100%', height: '100%', borderRadius: '16px', objectFit: 'contain' }}
                                                controlsList="nodownload"
                                                onContextMenu={(e: any) => e.preventDefault()}
                                            />
                                        ) : lesson.file_url.match(/\.pdf$/i) ? (
                                            <iframe
                                                src={`${lesson.file_url}#toolbar=0&navpanes=0`}
                                                style={{ width: '100%', height: '100%', border: 'none', borderRadius: '16px' }}
                                                title="Document Preview"
                                                onContextMenu={(e: any) => e.preventDefault()}
                                            />
                                        ) : (
                                            <div style={{ textAlign: 'center' }}>
                                                <FileText size={64} color="#1a4d3e" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                                                <p style={{ color: '#1a4d3e', fontWeight: 800 }}>Document Resource Prepared</p>
                                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{lesson.file_name || 'Attached File'}</p>
                                                <div style={{ marginTop: '1.5rem', background: '#f1f5f9', color: '#64748b', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem' }}>View Lesson Assets</div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ width: '90px', height: '90px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', margin: '0 auto 1.5rem auto', cursor: 'pointer', transition: 'all 0.3s', border: '1.5px solid rgba(255,255,255,0.1)' }}>
                                            <Play size={44} color="white" style={{ marginLeft: '6px' }} />
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
                                <h1 style={{ fontSize: '2.5rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.04em', marginBottom: '1.5rem' }}>{lesson.title}</h1>
                            </div>

                            <div style={{ color: '#475569', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '3rem', fontWeight: 500 }}>
                                <p>{lesson.description || 'No description available for this lesson.'}</p>
                            </div>

                            <div style={{ paddingTop: '2rem', borderTop: '1.5px solid #f1f5f9' }}>
                                <button
                                    onClick={() => handleCompleteLesson()}
                                    disabled={isCompleting}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '1rem 2rem',
                                        borderRadius: '16px',
                                        fontWeight: 900,
                                        border: isCompleted ? '1.5px solid #bbf7d0' : 'none',
                                        backgroundColor: isCompleted ? '#f0fdf4' : '#1a4d3e',
                                        color: isCompleted ? '#166534' : 'white',
                                        cursor: isCompleting ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: isCompleted ? 'none' : '0 10px 15px -3px rgba(26, 77, 62, 0.2)',
                                        opacity: isCompleting ? 0.7 : 1
                                    }}
                                >
                                    {isCompleting ? <Loader2 className="animate-spin" size={22} /> : <CheckCircle size={22} />}
                                    {isCompleted ? 'Learning Objective Achieved' : 'Complete Lesson'}
                                </button>
                            </div>
                        </div>

                        <div>
                            <div style={{ padding: '2rem', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '24px' }}>
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
                                                    const isPdf = url.toLowerCase().endsWith('.pdf') || lesson.file_name?.toLowerCase().endsWith('.pdf');
                                                    const isVideo = url.toLowerCase().match(/\.(mp4|webm|ogg|ogv)$/i);
                                                    setIframeLoading(true);
                                                    setPreviewAsset({ url, type: isPdf ? 'pdf' : isVideo ? 'video' : 'image' });
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
                                        {previewAsset.type === 'pdf' ? <FileText size={22} color="#1a4d3e" /> : <Eye size={22} color="#1a4d3e" />}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontWeight: 950, color: '#0f172a', letterSpacing: '-0.02em' }}>Unit Resource Review</h3>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Secure Curriculum Stream • Unauthorized distribution is prohibited</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setPreviewAsset(null)}
                                    style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
                                >
                                    <X size={22} />
                                </button>
                            </div>

                            <div style={{ flex: 1, padding: 0, background: '#f8fafc', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                                {iframeLoading && previewAsset.type === 'pdf' && (
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', zIndex: 10 }}>
                                        <div style={{ position: 'relative', marginBottom: '2rem' }}>
                                            <div style={{ width: '80px', height: '80px', borderRadius: '24px', border: '4px solid #f1f5f9', borderTopColor: '#1a4d3e', animation: 'spin-lesson 1s linear infinite' }}></div>
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FileText size={32} color="#1a4d3e" opacity={0.3} />
                                            </div>
                                        </div>
                                        <h4 style={{ margin: 0, fontWeight: 900, color: '#0f172a', fontSize: '1.25rem' }}>Architecting Secure View...</h4>
                                        <p style={{ marginTop: '0.75rem', fontWeight: 600, color: '#64748b', fontSize: '0.9rem' }}>Preparing high-fidelity instructional workspace</p>
                                        <style>{`
                                            @keyframes spin-lesson { to { transform: rotate(360deg); } }
                                        `}</style>
                                    </div>
                                )}
                                {previewAsset.type === 'pdf' ? (
                                    <iframe
                                        src={`${previewAsset.url}#toolbar=0&navpanes=0`}
                                        style={{ width: '100%', height: '100%', border: 'none', opacity: iframeLoading ? 0 : 1, transition: 'opacity 0.4s ease' }}
                                        title="PDF Review"
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
        </div >
    );
};

export default LessonView;
