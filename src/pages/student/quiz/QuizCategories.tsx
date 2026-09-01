import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, HelpCircle } from 'lucide-react';
import { QUIZ_CATEGORIES } from '../../../data/quizCategories';

export default function QuizCategories() {
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
                    General Quiz
                </h1>
                <p className="text-[var(--index-text-secondary)] text-xs sm:text-sm md:text-base font-medium leading-relaxed max-w-2xl">
                    Practice diagnostics across core curriculum topics. Pick a category to test your knowledge with 10 randomized questions.
                </p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {QUIZ_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                        <Link
                            key={cat.id}
                            to={`/student/quiz/${cat.id}`}
                            className="bg-[var(--index-card-bg)] border border-[var(--index-border-color)] rounded-[24px] p-5 md:p-6 flex flex-col justify-between hover:shadow-md transition-all duration-300 no-underline text-inherit group"
                        >
                            <div>
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                                    style={{ backgroundColor: cat.color + '15' }}
                                >
                                    <Icon size={24} color={cat.color} />
                                </div>
                                <h3 className="text-base md:text-lg font-semibold text-[var(--index-text-heading)] tracking-tight leading-snug mb-2 group-hover:text-[var(--index-primary-color)] transition-colors">
                                    {cat.title}
                                </h3>
                                <p className="text-[var(--index-text-secondary)] text-xs md:text-sm font-medium leading-relaxed mb-4 line-clamp-3">
                                    {cat.description}
                                </p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1.5 text-[10px] md:text-[11px] font-semibold uppercase tracking-wider text-[var(--index-text-secondary)]">
                                    <HelpCircle size={13} /> {cat.questions.length} Questions
                                </span>
                                <span className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: cat.color }}>
                                    Start <ArrowRight size={14} />
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
