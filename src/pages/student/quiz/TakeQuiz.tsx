import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Trophy, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { QUIZ_CATEGORIES, QUIZ_PASS_MARK, shuffleAndSlice, type QuizQuestion } from '../../../data/quizCategories';

export default function TakeQuiz() {
    const { categoryId } = useParams();
    const category = QUIZ_CATEGORIES.find((c) => c.id === categoryId);

    const [started, setStarted] = useState(false);
    const [sessionQuestions, setSessionQuestions] = useState<QuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
    const [showReview, setShowReview] = useState(false);

    if (!category) {
        return (
            <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
                <AlertCircle className="mx-auto text-red-500" size={40} />
                <p className="text-[var(--index-text-secondary)] text-sm font-medium">This quiz category could not be found.</p>
                <Link to="/student/quiz" className="inline-flex items-center gap-2 text-[var(--index-primary-color)] font-bold text-sm no-underline">
                    <ArrowLeft size={16} /> Back to General Quiz
                </Link>
            </div>
        );
    }

    const Icon = category.icon;
    const totalQuestions = sessionQuestions.length;
    const currentQuestion = sessionQuestions[currentIndex];
    const hasSelected = selectedAnswers[currentIndex] !== undefined;

    const handleStart = () => {
        setSessionQuestions(shuffleAndSlice(category.questions, 10));
        setCurrentIndex(0);
        setSelectedAnswers({});
        setResult(null);
        setShowReview(false);
        setStarted(true);
    };

    const handleSubmit = () => {
        let correct = 0;
        sessionQuestions.forEach((q, idx) => {
            if (selectedAnswers[idx] === q.correctAnswer) correct++;
        });
        const score = Math.round((correct / totalQuestions) * 100);
        setResult({ score, passed: score >= QUIZ_PASS_MARK });
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 pb-12 text-[var(--index-text-heading)]">
            <div className="flex items-center justify-between py-6">
                <Link
                    to="/student/quiz"
                    className="inline-flex items-center gap-2 text-[var(--index-text-secondary)] hover:text-[var(--index-primary-color)] font-bold text-xs uppercase tracking-wider no-underline transition-colors"
                >
                    <ArrowLeft size={16} /> Back
                </Link>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--index-text-secondary)]">
                    {category.title}
                </span>
            </div>

            {!started ? (
                <div className="bg-[var(--index-card-bg)] border border-[var(--index-border-color)] rounded-[32px] p-8 md:p-12 text-center space-y-6">
                    <div
                        className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto"
                        style={{ backgroundColor: category.color + '15' }}
                    >
                        <Icon size={40} color={category.color} />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight">{category.title} Diagnostic</h1>
                        <p className="text-[var(--index-text-secondary)] text-sm md:text-base font-medium leading-relaxed max-w-lg mx-auto">
                            This evaluation contains 10 scenario-based multiple choice questions to assess your understanding of {category.title}.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                        <div className="bg-[var(--index-hover-bg)] rounded-2xl p-4">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--index-text-faint)] mb-1">Format</div>
                            <div className="text-xs md:text-sm font-black">Multiple Choice</div>
                        </div>
                        <div className="bg-[var(--index-hover-bg)] rounded-2xl p-4">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--index-text-faint)] mb-1">Questions</div>
                            <div className="text-xs md:text-sm font-black">10 Units</div>
                        </div>
                        <div className="bg-[var(--index-hover-bg)] rounded-2xl p-4">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--index-text-faint)] mb-1">Pass Mark</div>
                            <div className="text-xs md:text-sm font-black">{QUIZ_PASS_MARK}%</div>
                        </div>
                    </div>

                    <button
                        onClick={handleStart}
                        className="w-full sm:w-auto px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider text-white transition-all hover:opacity-90 active:scale-95"
                        style={{ backgroundColor: category.color }}
                    >
                        Start Assessment
                    </button>
                </div>
            ) : result ? (
                showReview ? (
                    <div className="space-y-6">
                        <div className="text-center space-y-1 mb-6">
                            <h2 className="text-xl md:text-2xl font-black tracking-tight">Answer Review: {category.title}</h2>
                            <p className="text-[var(--index-text-secondary)] text-sm font-medium">Study the explanations to master correct controls concepts.</p>
                        </div>

                        {sessionQuestions.map((q, qIdx) => {
                            const userAns = selectedAnswers[qIdx];
                            const isCorrect = userAns === q.correctAnswer;
                            return (
                                <div key={qIdx} className="bg-[var(--index-card-bg)] border border-[var(--index-border-color)] rounded-[24px] p-5 md:p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black uppercase tracking-wider text-[var(--index-text-secondary)]">
                                            Question {qIdx + 1}
                                        </span>
                                        <span
                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                                isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                                            }`}
                                        >
                                            {isCorrect ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                            {isCorrect ? 'Correct' : 'Incorrect'}
                                        </span>
                                    </div>
                                    <p className="font-bold text-sm md:text-base leading-relaxed">{q.question}</p>
                                    <div className="space-y-2">
                                        {q.options.map((opt, oIdx) => {
                                            const wasSelected = userAns === oIdx;
                                            const isRight = oIdx === q.correctAnswer;
                                            let cls = 'bg-[var(--index-card-bg)] border-[var(--index-border-color)]';
                                            let circleCls = 'bg-[var(--index-hover-bg)] text-[var(--index-text-heading)]';
                                            if (isRight) {
                                                cls = 'bg-emerald-50 border-emerald-200';
                                                circleCls = 'bg-emerald-500 text-white';
                                            } else if (wasSelected) {
                                                cls = 'bg-red-50 border-red-200';
                                                circleCls = 'bg-red-500 text-white';
                                            }
                                            return (
                                                <div key={oIdx} className={`flex items-center gap-3 p-3 rounded-xl border ${cls}`}>
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${circleCls}`}>
                                                        {String.fromCharCode(65 + oIdx)}
                                                    </div>
                                                    <span className="text-sm font-medium">{opt}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="bg-[var(--index-hover-bg)] rounded-xl p-4">
                                        <div className="text-[10px] font-black uppercase tracking-wider text-[var(--index-text-faint)] mb-1">Explanation</div>
                                        <p className="text-sm font-medium text-[var(--index-text-secondary)] leading-relaxed">{q.explanation}</p>
                                    </div>
                                </div>
                            );
                        })}

                        <button
                            onClick={() => setShowReview(false)}
                            className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider text-white bg-[var(--index-primary-color)] hover:opacity-90 transition-all"
                        >
                            Back to Summary
                        </button>
                    </div>
                ) : (
                    <div className="bg-[var(--index-card-bg)] border border-[var(--index-border-color)] rounded-[32px] p-8 md:p-12 text-center space-y-6">
                        {result.passed ? (
                            <Trophy className="mx-auto text-amber-500" size={64} />
                        ) : (
                            <AlertCircle className="mx-auto text-red-500" size={64} />
                        )}
                        <div className="space-y-2">
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                {result.passed ? 'Evaluation Passed!' : 'Requires Review'}
                            </h2>
                            <p className="text-4xl font-black" style={{ color: result.passed ? category.color : '#ef4444' }}>
                                {result.score}%
                            </p>
                            <p className="text-[var(--index-text-secondary)] text-sm md:text-base font-medium max-w-md mx-auto">
                                {result.passed
                                    ? 'Excellent work! You have validated your core competency in this category.'
                                    : `You fell short of the ${QUIZ_PASS_MARK}% passing criterion. Review explanations and try again!`}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => setShowReview(true)}
                                className="px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider text-white bg-[var(--index-primary-color)] hover:opacity-90 transition-all"
                            >
                                Review Answers
                            </button>
                            <button
                                onClick={handleStart}
                                className="px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-[var(--index-hover-bg)] text-[var(--index-text-heading)] hover:bg-[var(--index-border-color)] transition-all"
                            >
                                Retry Quiz
                            </button>
                            <Link
                                to="/student/quiz"
                                className="px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider border border-[var(--index-border-color)] text-[var(--index-text-secondary)] hover:bg-[var(--index-hover-bg)] transition-all no-underline text-center"
                            >
                                Return to Categories
                            </Link>
                        </div>
                    </div>
                )
            ) : (
                <div className="bg-[var(--index-card-bg)] border border-[var(--index-border-color)] rounded-[32px] p-6 md:p-10 space-y-8">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[var(--index-text-secondary)]">
                                Question {currentIndex + 1} of {totalQuestions}
                            </span>
                            <span className="text-xs font-black uppercase tracking-wider" style={{ color: category.color }}>
                                {category.title}
                            </span>
                        </div>
                        <div className="h-1.5 bg-[var(--index-hover-bg)] rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%`, backgroundColor: category.color }}
                            />
                        </div>
                    </div>

                    <h2 className="text-lg md:text-xl font-bold leading-relaxed">{currentQuestion.question}</h2>

                    <div className="grid grid-cols-1 gap-3">
                        {currentQuestion.options.map((opt, oIdx) => {
                            const isSelected = selectedAnswers[currentIndex] === oIdx;
                            return (
                                <button
                                    key={oIdx}
                                    onClick={() => setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: oIdx }))}
                                    className={`flex items-center gap-4 p-4 rounded-2xl text-left border transition-all ${
                                        isSelected
                                            ? 'border-transparent'
                                            : 'bg-[var(--index-card-bg)] border-[var(--index-border-color)] hover:bg-[var(--index-hover-bg)]'
                                    }`}
                                    style={
                                        isSelected
                                            ? { backgroundColor: category.color + '10', boxShadow: `0 0 0 2px ${category.color}` }
                                            : undefined
                                    }
                                >
                                    <div
                                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                                            isSelected ? 'text-white' : 'bg-[var(--index-hover-bg)] text-[var(--index-text-heading)]'
                                        }`}
                                        style={isSelected ? { backgroundColor: category.color } : undefined}
                                    >
                                        {String.fromCharCode(65 + oIdx)}
                                    </div>
                                    <span className="text-sm font-semibold flex-1">{opt}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <button
                            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                            disabled={currentIndex === 0}
                            className="px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider border border-[var(--index-border-color)] text-[var(--index-text-secondary)] disabled:opacity-30 hover:bg-[var(--index-hover-bg)] transition-all"
                        >
                            Previous
                        </button>

                        {currentIndex < totalQuestions - 1 ? (
                            <button
                                onClick={() => setCurrentIndex((prev) => prev + 1)}
                                disabled={!hasSelected}
                                className="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-wider text-white disabled:opacity-30 transition-all"
                                style={{ backgroundColor: category.color }}
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={!hasSelected}
                                className="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-wider text-white disabled:opacity-30 transition-all"
                                style={{ backgroundColor: category.color }}
                            >
                                Submit
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
