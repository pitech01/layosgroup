import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
    HelpCircle,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    X,
    Loader2,
    Lock,
    Clock,
    ArrowLeft,
} from 'lucide-react';

interface Question {
    id: string;
    question: string;
    options: string[];
    correct_answer: number;
}

interface ExamData {
    cohort_id: string;
    course_title: string | null;
    progress: number;
    eligible: boolean;
    window_status: 'not_open' | 'open' | 'closed' | 'disabled';
    exam_opens_at: string | null;
    exam_closes_at: string | null;
    pass_mark: number;
    questions: Question[];
    submission: { score: number; passed: boolean } | null;
}

export default function TakeExam() {
    const { cohortId } = useParams();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [examData, setExamData] = useState<ExamData | null>(null);

    const [started, setStarted] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const API_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const fetchExam = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/cohorts/${cohortId}/final-exam`, {
                headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
            });
            if (res.status === 401) {
                logout();
                navigate('/login');
                return;
            }
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to load the exam.');
            setExamData(data);
            if (data.submission?.passed) {
                setResult({ score: data.submission.score, passed: true });
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load the exam.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExam();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cohortId]);

    const handleSubmit = async (score: number) => {
        setSubmitting(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/cohorts/${cohortId}/final-exam/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ score, answers: selectedAnswers }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to submit the exam.');
            setResult({ score: data.score, passed: data.passed });
        } catch (err: any) {
            toast.error(err.message || 'Failed to submit the exam.');
        } finally {
            setSubmitting(false);
        }
    };

    const resetAttempt = () => {
        setStarted(false);
        setResult(null);
        setSelectedAnswers({});
        setCurrentIndex(0);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[3000] bg-gradient-to-br from-brand-charcoal to-black flex items-center justify-center">
                <Loader2 className="animate-spin text-brand-emerald" size={40} />
            </div>
        );
    }

    if (error || !examData) {
        return (
            <div className="fixed inset-0 z-[3000] bg-gradient-to-br from-brand-charcoal to-black flex flex-col items-center justify-center gap-6 text-center px-6">
                <p className="text-white/70 font-medium max-w-md">{error || 'This exam could not be loaded.'}</p>
                <Link
                    to="/student/exam"
                    className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest no-underline hover:bg-white/10 transition-all"
                >
                    <ArrowLeft size={16} /> Back to Exams
                </Link>
            </div>
        );
    }

    // Blocked states: not yet open / closed / not eligible
    if (!result && (examData.window_status !== 'open' || !examData.eligible)) {
        let title = 'Exam Not Available';
        let message = '';

        if (examData.window_status === 'not_open') {
            title = 'Exam Not Yet Open';
            message = examData.exam_opens_at
                ? `This exam opens on ${new Date(examData.exam_opens_at).toLocaleString()}.`
                : 'Your instructor has not opened the exam window yet.';
        } else if (examData.window_status === 'closed') {
            title = 'Exam Window Closed';
            message = 'The submission window for this exam has ended. Contact your instructor if you believe this is an error.';
        } else if (!examData.eligible) {
            title = 'Complete Your Lessons First';
            message = `You're at ${Math.round(examData.progress)}% progress. Finish all course lessons before attempting the final exam.`;
        }

        return (
            <div className="fixed inset-0 z-[3000] bg-gradient-to-br from-brand-charcoal to-black flex flex-col items-center justify-center gap-6 text-center px-6">
                <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-brand-muted">
                    {examData.window_status === 'not_open' || examData.window_status === 'closed' ? <Clock size={36} /> : <Lock size={36} />}
                </div>
                <div className="space-y-2 max-w-md">
                    <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
                    <p className="text-brand-muted font-medium">{message}</p>
                </div>
                <Link
                    to="/student/exam"
                    className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest no-underline hover:bg-white/10 transition-all"
                >
                    <ArrowLeft size={16} /> Back to Exams
                </Link>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[3000] bg-gradient-to-br from-brand-charcoal to-black flex flex-col overflow-hidden">
            {!started ? (
                <div className="m-auto text-center max-w-3xl p-8 md:p-16 bg-white/5 backdrop-blur-2xl rounded-[60px] border border-white/10 animate-fade-in-up space-y-10">
                    <div className="relative w-32 h-32 mx-auto">
                        <div className="absolute inset-0 bg-brand-emerald/20 blur-3xl animate-pulse" />
                        <div className="relative w-full h-full bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                            <HelpCircle size={64} className="text-brand-emerald" strokeWidth={1.5} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-emerald/10 text-brand-emerald rounded-full border border-brand-emerald/20 text-[10px] font-black uppercase tracking-[0.2em]">
                            Final Examination
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
                            {examData.course_title || 'Course'}
                        </h2>
                        <p className="text-brand-muted text-lg font-medium leading-relaxed max-w-xl mx-auto">
                            Pass this exam with a minimum score of{' '}
                            <span className="text-brand-emerald font-black underline underline-offset-4">{examData.pass_mark}%</span> to
                            unlock your certificate.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <div className="text-left p-6 bg-white/5 rounded-3xl border border-white/5 flex-1 min-w-[200px]">
                            <div className="text-[10px] font-black text-brand-emerald uppercase tracking-widest mb-1">Questions</div>
                            <div className="text-xl font-black text-white">{examData.questions.length} Questions</div>
                        </div>
                        <div className="text-left p-6 bg-white/5 rounded-3xl border border-white/5 flex-1 min-w-[200px]">
                            <div className="text-[10px] font-black text-brand-emerald uppercase tracking-widest mb-1">Pass Mark</div>
                            <div className="text-xl font-black text-white">{examData.pass_mark}%</div>
                        </div>
                    </div>

                    {result && !result.passed && (
                        <p className="text-red-400 font-bold text-sm">Previous attempt: {result.score}% — you can retake now.</p>
                    )}

                    <button
                        onClick={() => {
                            setResult(null);
                            setSelectedAnswers({});
                            setCurrentIndex(0);
                            setStarted(true);
                        }}
                        className="w-full sm:w-auto bg-brand-emerald text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-brand-emerald/40 hover:-translate-y-1 active:scale-95 transition-all border-none cursor-pointer"
                    >
                        {result ? 'Retake Exam' : 'Start Exam'}
                    </button>

                    <div>
                        <Link to="/student/exam" className="text-brand-muted text-xs font-bold uppercase tracking-widest no-underline hover:text-white">
                            Back to Exams
                        </Link>
                    </div>
                </div>
            ) : result ? (
                <div className="m-auto text-center max-w-4xl p-8 md:p-16 bg-white/5 backdrop-blur-2xl rounded-[60px] border border-white/10 animate-fade-in-up space-y-12">
                    <div className="relative w-40 h-40 mx-auto">
                        <div className={`absolute inset-0 blur-3xl opacity-30 ${result.passed ? 'bg-brand-emerald' : 'bg-red-500'}`} />
                        <div
                            className={`relative w-full h-full rounded-full border-4 flex items-center justify-center transition-all duration-1000 ${
                                result.passed ? 'border-brand-emerald bg-brand-emerald/10' : 'border-red-500 bg-red-500/10'
                            }`}
                        >
                            {result.passed ? (
                                <CheckCircle size={80} className="text-brand-emerald" strokeWidth={1.5} />
                            ) : (
                                <X size={80} className="text-red-500" strokeWidth={1.5} />
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div
                            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${
                                result.passed
                                    ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20'
                                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                            }`}
                        >
                            {result.passed ? 'Exam Passed' : 'Not Yet Passed'}
                        </div>
                        <h2 className="text-7xl font-black text-white tracking-tighter leading-none">
                            {result.score}
                            <span className="text-2xl text-brand-muted align-top ml-1">%</span>
                        </h2>
                        <p className="text-brand-muted text-lg font-medium leading-relaxed max-w-2xl mx-auto">
                            {result.passed
                                ? `Congratulations! You passed with a score of ${result.score}%. Your certificate is now available to claim.`
                                : `You scored ${result.score}%, below the required ${examData.pass_mark}%. You may retake the exam${
                                      examData.window_status === 'open' ? ' now' : ' once the window reopens'
                                  }.`}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        {result.passed ? (
                            <Link
                                to="/student/dashboard"
                                className="px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 border-none cursor-pointer bg-brand-emerald text-white shadow-xl shadow-brand-emerald/30 hover:scale-105 active:scale-95 no-underline"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <button
                                onClick={resetAttempt}
                                disabled={examData.window_status !== 'open'}
                                className="px-10 py-4 bg-white text-brand-charcoal rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] hover:scale-105 active:scale-95 transition-all border-none cursor-pointer disabled:opacity-30"
                            >
                                Retake Exam
                            </button>
                        )}
                        <Link
                            to="/student/exam"
                            className="px-8 py-4 bg-white/5 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2 no-underline"
                        >
                            Back to Exams
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <div className="px-8 pt-8 pb-4 shrink-0">
                        <div className="max-w-4xl mx-auto flex justify-between items-center mb-8">
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-brand-emerald uppercase tracking-[0.2em]">Exam In Progress</span>
                                <div className="flex gap-2">
                                    {examData.questions.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-3 h-1.5 rounded-full transition-all duration-500 ${
                                                i <= currentIndex ? 'bg-brand-emerald' : 'bg-white/10'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="text-brand-muted font-black text-xs uppercase tracking-widest">
                                Question {currentIndex + 1} of {examData.questions.length}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-8 pb-8">
                        <div className="max-w-4xl mx-auto py-12 space-y-12 animate-fade-in-up">
                            <h3 className="text-3xl md:text-4xl font-black text-white text-center leading-tight tracking-tight">
                                {examData.questions[currentIndex].question}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {examData.questions[currentIndex].options.map((opt, idx) => {
                                    const isSelected = selectedAnswers[currentIndex] === idx;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentIndex]: idx })}
                                            className={`
                                                flex items-center gap-6 p-6 rounded-[32px] text-left transition-all duration-300 group border-none cursor-pointer
                                                ${
                                                    isSelected
                                                        ? 'bg-brand-emerald/10 border-brand-emerald ring-2 ring-brand-emerald/50 text-white'
                                                        : 'bg-white/5 border border-white/10 text-brand-muted hover:bg-white/10 hover:text-white'
                                                }
                                            `}
                                        >
                                            <div
                                                className={`
                                                    w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs transition-all
                                                    ${isSelected ? 'bg-brand-emerald text-white' : 'bg-white/5 text-brand-muted group-hover:text-white'}
                                                `}
                                            >
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <span className="text-lg font-bold leading-relaxed flex-1">{opt}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="px-8 py-6 bg-black/40 backdrop-blur-xl border-t border-white/10 shrink-0">
                        <div className="max-w-4xl mx-auto flex justify-between items-center">
                            <button
                                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                                disabled={currentIndex === 0}
                                className="flex items-center gap-2 bg-transparent border-none text-brand-muted font-black text-xs uppercase tracking-widest hover:text-white transition-all disabled:opacity-0 cursor-pointer"
                            >
                                <ChevronLeft size={16} /> Back
                            </button>

                            {currentIndex < examData.questions.length - 1 ? (
                                <button
                                    onClick={() => setCurrentIndex(currentIndex + 1)}
                                    disabled={selectedAnswers[currentIndex] === undefined}
                                    className="bg-white text-brand-charcoal px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all border-none cursor-pointer flex items-center gap-2 disabled:opacity-30"
                                >
                                    Next <ChevronRight size={14} strokeWidth={3} />
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        let correctCount = 0;
                                        examData.questions.forEach((q, idx) => {
                                            if (selectedAnswers[idx] === q.correct_answer) correctCount++;
                                        });
                                        const score = Math.round((correctCount / examData.questions.length) * 100);
                                        handleSubmit(score);
                                    }}
                                    disabled={selectedAnswers[currentIndex] === undefined || submitting}
                                    className="bg-brand-emerald text-white px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-emerald/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 border-none cursor-pointer flex items-center gap-2"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={16} /> : null}
                                    Submit Exam
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
