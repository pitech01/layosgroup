import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, X, Send, Trash2 } from 'lucide-react';
import { useAIAssistant } from '../../hooks/useAIAssistant';

const AIAssistantFAB = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [draft, setDraft] = useState('');
    const { messages, isSending, error, sendMessage, clear } = useAIAssistant();

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isSending]);

    useEffect(() => {
        if (isOpen) {
            // Let the open animation start before stealing focus
            const t = setTimeout(() => inputRef.current?.focus(), 150);
            return () => clearTimeout(t);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!draft.trim() || isSending) return;
        sendMessage(draft);
        setDraft('');
    };

    return (
        <>
            <style>{`
                @keyframes aiFabPanelIn {
                    from { opacity: 0; transform: translateY(16px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .ai-fab-markdown p { margin: 0 0 0.5rem 0; line-height: 1.6; }
                .ai-fab-markdown p:last-child { margin-bottom: 0; }
                .ai-fab-markdown ul, .ai-fab-markdown ol { margin: 0.25rem 0 0.5rem 0; padding-left: 1.25rem; }
                .ai-fab-markdown li { margin-bottom: 0.25rem; line-height: 1.5; }
                .ai-fab-markdown strong { font-weight: 800; }
                .ai-fab-markdown code { background: var(--index-hover-bg); border-radius: 4px; padding: 0.1rem 0.35rem; font-size: 0.85em; }
                .ai-fab-markdown pre { background: var(--index-hover-bg); border-radius: 12px; padding: 0.75rem; overflow-x: auto; }
                .ai-fab-markdown pre code { background: none; padding: 0; }
                .ai-fab-markdown a { color: var(--index-primary-color); }
            `}</style>

            {/* Floating action button */}
            <button
                onClick={() => setIsOpen((v) => !v)}
                aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
                className="fixed bottom-6 right-6 z-[3000] flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_16px_32px_-8px_rgba(0,217,233,0.5)] transition-all duration-300 hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, var(--lgl-cyan) 0%, var(--lgl-cyan-dark) 100%)' }}
            >
                {isOpen ? <X size={24} /> : <Sparkles size={24} />}
            </button>

            {/* Chat panel */}
            {isOpen && (
                <div
                    role="dialog"
                    aria-label="Layos AI Assistant"
                    className="fixed inset-4 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[400px] sm:h-[600px] sm:max-h-[75vh] z-[3000] flex flex-col overflow-hidden rounded-[28px] border border-[var(--index-border-color)] bg-[var(--index-card-bg)] text-[var(--index-text-heading)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)]"
                    style={{ animation: 'aiFabPanelIn 0.25s cubic-bezier(0.16,1,0.3,1)' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 border-b border-[var(--index-border-color)] bg-[var(--index-hover-bg)] px-5 py-4 shrink-0">
                        <div className="flex items-center gap-3 min-w-0">
                            <div
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white"
                                style={{ background: 'linear-gradient(135deg, var(--lgl-cyan) 0%, var(--lgl-cyan-dark) 100%)' }}
                            >
                                L
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-sm font-black tracking-tight truncate">Layos AI Assistant</h4>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--index-text-secondary)]">
                                    Ask me anything
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            {messages.length > 0 && (
                                <button
                                    onClick={clear}
                                    aria-label="Clear conversation"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--index-text-secondary)] hover:bg-[var(--index-border-color)] hover:text-[var(--index-text-heading)] transition-colors"
                                >
                                    <Trash2 size={15} />
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                aria-label="Close"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--index-text-secondary)] hover:bg-[var(--index-border-color)] hover:text-[var(--index-text-heading)] transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3">
                        {messages.length === 0 && (
                            <div className="m-auto text-center px-6 py-10">
                                <div
                                    className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                                    style={{ background: 'color-mix(in srgb, var(--lgl-cyan) 12%, transparent)' }}
                                >
                                    <Sparkles size={24} style={{ color: 'var(--lgl-cyan)' }} />
                                </div>
                                <h3 className="text-sm font-black mb-1.5">How can I help?</h3>
                                <p className="text-xs leading-relaxed text-[var(--index-text-secondary)] max-w-[220px] mx-auto">
                                    Ask about your courses, assignments, or anything else on your mind.
                                </p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                                    msg.role === 'user'
                                        ? 'self-end text-white rounded-br-md'
                                        : 'self-start border border-[var(--index-border-color)] bg-[var(--index-hover-bg)] rounded-bl-md'
                                }`}
                                style={msg.role === 'user' ? { background: 'var(--index-primary-color)' } : undefined}
                            >
                                {msg.role === 'model' ? (
                                    <div className="ai-fab-markdown">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                    </div>
                                ) : (
                                    msg.content
                                )}
                            </div>
                        ))}

                        {isSending && (
                            <div className="self-start flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[var(--index-border-color)] bg-[var(--index-hover-bg)] px-4 py-3">
                                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'var(--lgl-cyan)' }} />
                                <span className="h-1.5 w-1.5 rounded-full animate-pulse [animation-delay:0.2s]" style={{ background: 'var(--lgl-cyan)' }} />
                                <span className="h-1.5 w-1.5 rounded-full animate-pulse [animation-delay:0.4s]" style={{ background: 'var(--lgl-cyan)' }} />
                            </div>
                        )}

                        {error && (
                            <div className="self-stretch rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-3.5 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="border-t border-[var(--index-border-color)] p-3.5 shrink-0">
                        <form
                            onSubmit={handleSubmit}
                            className="flex items-center gap-1.5 rounded-2xl border border-[var(--index-border-color)] bg-[var(--index-input-bg)] p-1.5 transition-colors focus-within:border-[var(--index-primary-color)]"
                        >
                            <input
                                ref={inputRef}
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 min-w-0 bg-transparent border-none px-3 py-2 text-sm outline-none placeholder:text-[var(--index-text-faint)]"
                            />
                            <button
                                type="submit"
                                disabled={!draft.trim() || isSending}
                                aria-label="Send message"
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all active:scale-95 ${
                                    draft.trim() && !isSending
                                        ? 'text-white'
                                        : 'bg-[var(--index-hover-bg)] text-[var(--index-text-faint)] cursor-not-allowed'
                                }`}
                                style={draft.trim() && !isSending ? { background: 'var(--index-primary-color)' } : undefined}
                            >
                                <Send size={15} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIAssistantFAB;
