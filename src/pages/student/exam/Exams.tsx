import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
    GraduationCap,
    Clock,
    Lock,
    CheckCircle,
    XCircle,
    ArrowRight,
    AlertCircle,
    Loader2,
    Sparkles,
    LayoutGrid,
} from 'lucide-react';

interface ExamCardData {
    cohortId: string;
    cohortName: string;
    courseTitle: string;
    progress: number;
    eligible: boolean;
    windowStatus: 'not_open' | 'open' | 'closed' | 'disabled';
    examOpensAt: string | null;
    examClosesAt: string | null;
    submission: { score: number; passed: boolean } | null;
}

export default function StudentExams() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [exams, setExams] = useState<ExamCardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const load = async () => {
            const token = localStorage.getItem('token');
            try {
                const enrollRes = await fetch(`${API_URL}/my-enrollments`, {
                    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
                });

                if (enrollRes.status === 401) {
                    logout();
                    navigate('/login');
                    return;
                }

                const enrollData = await enrollRes.json();
                if (!enrollRes.ok) throw new Error(enrollData.message || 'Failed to load enrollments.');

                const examCohorts = (enrollData?.cohorts || []).filter((c: any) => c.exam_enabled);

                const details = await Promise.all(
                    examCohorts.map(async (c: any) => {
                        try {
                            const res = await fetch(`${API_URL}/cohorts/${c.id}/final-exam`, {
                                headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
                            });
                            const data = await res.json();
                            if (!res.ok) return null;
                            return {
                                cohortId: c.id,
                                cohortName: c.name,
                                courseTitle: data.course_title || c.course?.title || 'Course',
                                progress: data.progress ?? 0,
                                eligible: !!data.eligible,
                                windowStatus: data.window_status,
                                examOpensAt: data.exam_opens_at,
                                examClosesAt: data.exam_closes_at,
                                submission: data.submission
                                    ? { score: data.submission.score, passed: data.submission.passed }
                                    : null,
                            } as ExamCardData;
                        } catch {
                            return null;
                        }
                    })
                );

                setExams(details.filter((d): d is ExamCardData => d !== null));
            } catch (err: any) {
                setError(err.message || 'Failed to load exams.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const formatDate = (d: string | null) =>
        d ? new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

    return (
        <div className="space-y-6 md:space-y-8 pb-12 max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 text-[var(--index-text-heading)]">
            <header className="flex flex-col gap-2 border-b border-[var(--index-border-color)] pb-6 md:pb-8">
                <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-[var(--index-primary-color)]/10 rounded-md">
                        <Sparkles className="text-[var(--index-primary-color)]" size={14} />
                    </div>
                    <span className="text-[var(--index-primary-color)] font-bold text-[10px] md:text-xs uppercase tracking-wider">Academic Portal</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-[var(--index-primary-color)]">
                    Final Examinations
                </h1>
                <p className="text-[var(--index-text-secondary)] text-xs sm:text-sm md:text-base font-medium leading-relaxed max-w-2xl">
                    Pass your cohort's final exam to unlock your certificate of completion.
                </p>
            </header>

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="animate-spin text-[var(--index-primary-color)]" size={32} />
                </div>
            ) : error ? (
                <div className="bg-white p-6 sm:p-10 rounded-[24px] border border-red-100 text-center max-w-xl mx-auto space-y-4 shadow-sm">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
                        <AlertCircle size={26} />
                    </div>
                    <p className="text-[var(--index-text-secondary)] text-sm">{error}</p>
                </div>
            ) : exams.length === 0 ? (
                <div className="bg-[var(--index-bg-color)] py-16 md:py-20 px-4 text-center rounded-[32px] border border-dashed border-[var(--index-border-color)] max-w-2xl mx-auto">
                    <div className="w-14 h-14 bg-[var(--index-card-bg)] rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--index-text-faint)]">
                        <LayoutGrid size={26} />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-[var(--index-text-heading)] mb-1">No Exams Available</h2>
                    <p className="text-[var(--index-text-secondary)] text-xs sm:text-sm max-w-xs mx-auto font-medium">
                        Your instructor hasn't opened a final exam yet. Check back later.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {exams.map((exam) => {
                        const passed = exam.submission?.passed;
                        const failed = exam.submission && !exam.submission.passed;

                        let statusBadge: React.ReactNode;
                        let cta: React.ReactNode;

                        if (passed) {
                            statusBadge = (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider bg-[var(--index-accent-soft-bg)] text-[var(--index-primary-color)] rounded-md">
                                    <CheckCircle size={12} /> Passed — {exam.submission?.score}%
                                </span>
                            );
                            cta = (
                                <div className="w-full bg-[var(--index-card-bg)] text-[var(--index-primary-color)] text-center py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                                    <CheckCircle size={14} /> Exam Passed
                                </div>
                            );
                        } else if (exam.windowStatus === 'not_open') {
                            statusBadge = (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-700 rounded-md">
                                    <Clock size={12} /> Opens {formatDate(exam.examOpensAt)}
                                </span>
                            );
                            cta = (
                                <div className="w-full bg-[var(--index-card-bg)] text-[var(--index-text-secondary)] text-center py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                                    <Lock size={14} /> Not Yet Open
                                </div>
                            );
                        } else if (exam.windowStatus === 'closed') {
                            statusBadge = (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider bg-red-50 text-red-600 rounded-md">
                                    <XCircle size={12} /> Window Closed
                                </span>
                            );
                            cta = (
                                <div className="w-full bg-[var(--index-card-bg)] text-[var(--index-text-secondary)] text-center py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                                    <Lock size={14} /> Closed
                                </div>
                            );
                        } else if (!exam.eligible) {
                            statusBadge = (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-700 rounded-md">
                                    <Clock size={12} /> {Math.round(exam.progress)}% Complete
                                </span>
                            );
                            cta = (
                                <div className="w-full bg-[var(--index-card-bg)] text-[var(--index-text-secondary)] text-center py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                                    Finish All Lessons First
                                </div>
                            );
                        } else {
                            statusBadge = failed ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider bg-red-50 text-red-600 rounded-md">
                                    <XCircle size={12} /> Failed — {exam.submission?.score}%
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider bg-[var(--index-accent-soft-bg)] text-[var(--index-primary-color)] rounded-md">
                                    <Clock size={12} /> Available Now
                                </span>
                            );
                            cta = (
                                <Link
                                    to={`/student/exam/${exam.cohortId}`}
                                    className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all no-underline text-center border bg-[var(--index-primary-color)] border-[var(--index-primary-color)] text-white hover:bg-[var(--index-primary-hover)]"
                                >
                                    <span>{failed ? 'Retake Exam' : 'Start Exam'}</span>
                                    <ArrowRight size={14} className="flex-shrink-0" />
                                </Link>
                            );
                        }

                        return (
                            <div
                                key={exam.cohortId}
                                className="bg-white border border-[var(--index-border-color)] rounded-[24px] p-5 md:p-6 flex flex-col justify-between hover:shadow-md transition-all duration-300 relative group overflow-hidden"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-3.5">
                                        <span className="text-[11px] font-semibold text-[var(--index-text-secondary)] uppercase tracking-wider block max-w-[85%] truncate">
                                            {exam.cohortName}
                                        </span>
                                        <GraduationCap size={16} className="text-[var(--index-primary-color)] flex-shrink-0" />
                                    </div>
                                    <h3 className="text-base md:text-lg font-semibold text-[var(--index-text-heading)] tracking-tight leading-snug mb-4 line-clamp-2 min-h-[3rem]">
                                        {exam.courseTitle} — Final Exam
                                    </h3>
                                </div>
                                <div className="space-y-3.5">
                                    <div className="flex items-center justify-between gap-2">{statusBadge}</div>
                                    {cta}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
