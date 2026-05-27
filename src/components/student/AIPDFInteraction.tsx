import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAIPutter } from '../../utils/useAIPutter';
import AutoScrollPDFViewer from './AutoScrollPDFViewer';

interface AIPDFInteractionProps {
    pdfUrl: string;
    onClose: () => void;
    onReachedEnd?: () => void;
    aiPutter?: ReturnType<typeof useAIPutter>;
}

const AIPDFInteraction: React.FC<AIPDFInteractionProps> = ({ pdfUrl, onClose, onReachedEnd, aiPutter }) => {
    const localAi = useAIPutter();
    const ai = aiPutter || localAi;
    const [question, setQuestion] = useState('');
    const [chat, setChat] = useState<{role: 'user' | 'ai', content: string}[]>([]);
    const [isAsking, setIsAsking] = useState(false);
    const [showChat, setShowChat] = useState(false);
    
    // Auto-scroll & Auto-focus refs
    const chatScrollRef = useRef<HTMLDivElement>(null);

    // Auto-complete trigger when AI finishes the document
    useEffect(() => {
        if (ai.state === 'idle' && ai.explanations.length > 0 && ai.currentExplanationIndex === ai.explanations.length - 1) {
            onReachedEnd?.();
        }
    }, [ai.state, ai.currentExplanationIndex, ai.explanations.length, onReachedEnd]);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [chat, isAsking]);

    React.useEffect(() => {
        if (showChat && !isAsking && inputRef.current) {
            inputRef.current.focus();
        }
    }, [showChat, isAsking]);

    const handleStart = () => {
        ai.startAIIntelligence(pdfUrl);
    };

    const handleAsk = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || isAsking) return;

        const userQ = question.trim();
        setChat(prev => [...prev, { role: 'user', content: userQ }]);
        setQuestion('');
        setIsAsking(true);
        setShowChat(true);

        const answer = await ai.askQuestion(userQ);
        setChat(prev => [...prev, { role: 'ai', content: answer }]);
        setIsAsking(false);
        
        // Speak the answer automatically
        ai.speakText(answer);
    };

    return (
        <div className="fixed inset-0 z-[4000] flex flex-col bg-slate-950/95 text-white antialiased backdrop-blur-2xl selection:bg-teal-500/30 font-['Inter',_sans-serif]">
            <style>{`
                @keyframes slideInUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                @keyframes pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(73, 186, 186, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(139, 92, 246, 0); } 100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); } }
                .ai-section-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 1rem;
                    transition: all 0.3s ease;
                }
                .ai-section-card.active {
                    background: rgba(73, 186, 186, 0.1);
                    border-color: #49BABA;
                    transform: scale(1.02);
                }
                .ai-chat-bubble {
                    padding: 0.75rem 1rem;
                    border-radius: 18px;
                    max-width: 85%;
                    font-size: 0.9rem;
                    line-height: 1.5;
                }
                .user-bubble { background: #1e293b; align-self: flex-end; border-bottom-right-radius: 4px; }
                .ai-bubble { background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(73, 186, 186, 0.2); align-self: flex-start; border-bottom-left-radius: 4px; }
                .premium-input {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    padding: 0.75rem 1rem;
                    color: white;
                    width: 100%;
                    outline: none;
                    transition: all 0.2s;
                }
                .premium-input:focus { border-color: #49BABA; background: rgba(255,255,255,0.08); }
                
                /* Scoped Markdown styling for the AI bubble response */
                .markdown-body p { margin-top: 0; margin-bottom: 0.5rem; line-height: 1.6; }
                .markdown-body p:last-child { margin-bottom: 0; }
                .markdown-body ul, .markdown-body ol { margin-top: 0.25rem; margin-bottom: 0.5rem; padding-left: 1.25rem; }
                .markdown-body li { margin-bottom: 0.25rem; line-height: 1.5; }
                .markdown-body strong { color: #fff; font-weight: 800; }
            `}</style>

            {/* Header */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-white/5 bg-slate-900/40 px-4 md:px-10 py-4 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-4 w-full lg:w-auto lg:min-w-[240px]">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#49BABA] to-[#5bc4c4] text-lg font-black text-white shadow-lg shadow-[#49BABA]/10">
                        L
                    </div>
                    <div>
                        <h2 className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-lg font-black text-transparent tracking-tight">
                            Layos Virtual Tutor
                        </h2>
                        <span className="text-[10px] font-semibold tracking-wider text-slate-400 block mt-0.5">
                            AI ANALYSIS ENGINE
                        </span>
                    </div>
                </div>

                {/* Central Controls */}
                <div className="flex flex-wrap items-center justify-center gap-3 w-full lg:flex-1">
                    {ai.state === 'idle' ? (
                        <button 
                            onClick={handleStart}
                            className="w-full sm:w-auto bg-gradient-to-r from-[#49BABA] to-[#3fa3a3] text-white px-6 py-2.5 rounded-xl font-black text-xs tracking-wider uppercase shadow-[0_10px_20px_-5px_rgba(73,186,186,0.3)] hover:opacity-90 active:scale-95 transition-all"
                        >
                            INITIALIZE VIRTUAL TUTOR
                        </button>
                    ) : (ai.state === 'speaking' || ai.state === 'paused') ? (
                        <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
                            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
                                <button 
                                    onClick={ai.state === 'speaking' ? ai.pause : ai.resume}
                                    className="bg-white text-slate-900 px-4 h-9 rounded-xl font-black text-[10px] tracking-wider uppercase active:scale-95 transition-transform"
                                >
                                    {ai.state === 'speaking' ? 'PAUSE' : 'RESUME'}
                                </button>
                                <button 
                                    onClick={ai.stop}
                                    className="bg-white/10 text-white px-4 h-9 rounded-xl font-black text-[10px] tracking-wider uppercase hover:bg-white/20 active:scale-95 transition-all"
                                >
                                    STOP
                                </button>
                            </div>

                            <div className="hidden sm:block w-px h-6 bg-white/10 mx-2" />

                            <div className="flex flex-col min-w-[120px] max-w-[180px] text-center sm:text-left">
                                <span className="text-[9px] font-black text-[#67d9d9] tracking-widest uppercase">
                                    {ai.isSpeaking ? 'NOW TEACHING' : 'PAUSED'}
                                </span>
                                <span className="text-xs font-bold text-slate-200 truncate">
                                    {ai.explanations[ai.currentExplanationIndex]?.title || 'Analyzing...'}
                                </span>
                            </div>

                            <button 
                                onClick={() => setShowChat(true)}
                                className="w-full sm:w-auto bg-purple-500/15 text-[#67d9d9] border border-[#49BABA]/30 px-5 py-2.5 rounded-xl font-black text-xs tracking-wider uppercase hover:bg-purple-500/20 active:scale-95 transition-all"
                            >
                                ASK LAYOS
                            </button>
                        </div>
                    ) : (ai.state === 'ready' || ai.explanations.length > 0) ? (
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                            <button 
                                onClick={ai.startSpeaking}
                                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2.5 rounded-xl font-black text-xs tracking-wider uppercase shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)] hover:opacity-90 active:scale-95 transition-all"
                            >
                                {ai.state === 'summarizing' ? 'START READING (STILL ANALYZING...)' : 'START READING NOW'}
                            </button>
                            <button 
                                onClick={() => setShowChat(true)}
                                className="w-full sm:w-auto bg-purple-500/15 text-[#67d9d9] border border-[#49BABA]/30 px-5 py-2.5 rounded-xl font-black text-xs tracking-wider uppercase hover:bg-purple-500/20 active:scale-95 transition-all"
                            >
                                ASK LAYOS
                            </button>
                            {ai.state === 'summarizing' && (
                                <span className="text-[11px] text-[#49BABA] font-black animate-pulse whitespace-nowrap">
                                    ANALYZING MORE PAGES...
                                </span>
                            )}
                        </div>
                    ) : null}
                </div>

                <div className="w-full lg:w-auto lg:min-w-[240px] flex justify-center lg:justify-end">
                    <button 
                        onClick={() => {
                            ai.stop();
                            onClose();
                        }}
                        className="w-full sm:w-auto bg-red-500 text-white px-5 py-2.5 rounded-xl font-black text-xs tracking-wider uppercase hover:bg-red-600 active:scale-95 transition-all"
                    >
                        CLOSE TUTOR
                    </button>
                </div>
            </div>

            {/* Main Layout: Document-First Design */}
            <div className="flex-1 relative overflow-hidden bg-slate-950">
                
                {/* Background Layer: The Smart PDF Document with Auto-Scroll Tracking */}
                <div className="absolute inset-0 z-10 w-full h-full bg-slate-950">
                    <AutoScrollPDFViewer 
                        url={pdfUrl} 
                        currentPage={ai.explanations[ai.currentExplanationIndex]?.page || 1}
                    />
                </div>

                {/* Layer 2: Thinking/Processing Overlay */}
                {(ai.state === 'extracting' || (ai.state === 'summarizing' && ai.explanations.length === 0)) && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-950/85 px-6 text-center backdrop-blur-md">
                        <div className="max-w-md py-12">
                            <div className="css-loader mx-auto mb-8"></div>
                            <style>{`
                                .css-loader {
                                    width: 50px;
                                    height: 50px;
                                    border: 4px solid rgba(73, 186, 186, 0.2);
                                    border-top-color: #49BABA;
                                    border-radius: 50%;
                                    animation: spin 0.8s linear infinite;
                                }
                                @keyframes spin { to { transform: rotate(360deg); } }
                            `}</style>
                            <h3 className="text-2xl font-[950] tracking-wide text-white mb-4">
                                {ai.state === 'extracting' ? 'Parsing Core Concepts...' : 'Synthesizing Knowledge...'}
                            </h3>
                            <p className="text-sm md:text-base text-slate-400 leading-relaxed">
                                Layos Virtual Tutor is orchestrating a personalized learning path based on your material.
                            </p>
                        </div>
                    </div>
                )}

                {/* Layer 3: Error Overlay — shown when AI connection fails */}
                {ai.state === 'error' && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-950/90 px-6 text-center backdrop-blur-md">
                        <div className="max-w-md py-12 space-y-6">
                            <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/40 flex items-center justify-center">
                                <span className="text-3xl">⚠️</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-[950] tracking-wide text-white mb-3">
                                    Tutor Connection Failed
                                </h3>
                                <p className="text-sm text-red-400 font-bold mb-2 uppercase tracking-wider">
                                    {ai.error?.includes('429') || ai.error?.toLowerCase().includes('too many')
                                        ? 'Rate Limit Reached'
                                        : ai.error?.includes('401') || ai.error?.toLowerCase().includes('key')
                                        ? 'Unable to connect to your smart tutor at the moment'
                                        : 'Connection Error'}
                                </p>
                                <p className="text-sm md:text-base text-slate-400 leading-relaxed">
                                    {ai.error?.includes('429') || ai.error?.toLowerCase().includes('too many')
                                        ? 'The AI tutor is currently handling too many requests. Please wait a moment and try again.'
                                        : ai.error?.includes('401') || ai.error?.toLowerCase().includes('key')
                                        ? 'The AI service could not authenticate. Please contact your administrator.'
                                        : 'The Virtual Tutor could not connect to the AI service. Check your internet connection and try again.'}
                                </p>
                            </div>
                            <button
                                onClick={handleStart}
                                className="bg-gradient-to-r from-[#49BABA] to-[#3fa3a3] text-white px-8 py-3 rounded-xl font-black text-xs tracking-wider uppercase shadow-[0_10px_20px_-5px_rgba(73,186,186,0.3)] hover:opacity-90 active:scale-95 transition-all"
                            >
                                Retry Connection
                            </button>
                        </div>
                    </div>
                )}


                {showChat && (
                    <div className="absolute inset-0 sm:inset-y-6 sm:right-6 sm:left-auto w-full sm:w-[440px] bg-slate-900/95 sm:bg-slate-900/92 backdrop-blur-3xl sm:rounded-[32px] border-t sm:border border-[#49BABA]/30 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8),_0_0_40px_rgba(73,186,186,0.1)] flex flex-col overflow-hidden z-[1000] [animation:chatSlideInUp_0.4s_cubic-bezier(0.16,_1,_0.3,_1)]">
                        <style>{`
                            @keyframes chatSlideInUp { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
                            @media (min-width: 640px) {
                                @keyframes chatSlideInUp { from { opacity: 0; transform: translateX(40px) scale(0.98); } to { opacity: 1; transform: translateX(0) scale(1); } }
                            }
                            .ai-chat-bubble.ai-bubble { background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(148, 163, 184, 0.1); align-self: flex-start; border-bottom-left-radius: 4px; color: #e2e8f0; }
                            .ai-chat-bubble.user-bubble { background: linear-gradient(135deg, #49BABA 0%, #3fa3a3 100%); align-self: flex-end; border-bottom-right-radius: 4px; color: white; box-shadow: 0 10px 20px -5px rgba(73, 186, 186, 0.3); }
                        `}</style>

                        {/* Chat Panel Header */}
                        <div className="flex items-center justify-between gap-4 p-4 md:p-5 bg-purple-500/12 border-b border-[#49BABA]/20 shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#49BABA] font-black text-white">
                                    L
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs font-black tracking-wide text-white truncate">LAYOS VIRTUAL TUTOR</h4>
                                    <span className="text-[10px] font-extrabold text-emerald-400 block truncate mt-0.5">• ACTIVE ANALYSIS</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button 
                                    onClick={() => ai.state === 'paused' ? ai.resume() : ai.pause()}
                                    className="bg-[#49BABA]/15 text-[#49BABA] border border-[#49BABA]/30 px-2.5 py-1.5 rounded-xl text-[9px] sm:text-[10px] font-black tracking-wider uppercase active:scale-95 transition-all whitespace-nowrap"
                                >
                                    {ai.state === 'paused' ? 'PLAY AUDIO' : 'PAUSE AUDIO'}
                                </button>
                                <button 
                                    onClick={() => setShowChat(false)} 
                                    className="bg-white/10 text-white px-2.5 py-1.5 rounded-xl text-[9px] sm:text-[10px] font-black tracking-wider uppercase hover:bg-white/20 active:scale-95 transition-all"
                                >
                                    CLOSE
                                </button>
                            </div>
                        </div>
                        
                        {/* Chat History Container */}
                        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5 scrollbar-thin scrollbar-thumb-white/10">
                            {chat.length === 0 && (
                                <div className="text-center text-slate-500 my-auto py-12 px-4">
                                    <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-purple-500/5 text-2xl md:text-3xl font-black text-[#49BABA] mx-auto mb-4 md:mb-6">
                                        ?
                                    </div>
                                    <h3 className="text-base md:text-lg font-black text-white mb-2">Direct Interaction</h3>
                                    <p className="text-xs md:text-sm leading-relaxed max-w-xs mx-auto text-slate-400">Consult the Virtual Tutor about any concept within this document.</p>
                                </div>
                            )}
                            {chat.map((msg, idx) => (
                                <div key={idx} className={`ai-chat-bubble ${msg.role === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                                    {msg.role === 'ai' ? (
                                        <div className="markdown-body">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        msg.content
                                    )}
                                </div>
                            ))}
                            {isAsking && (
                                <div className="ai-bubble ai-chat-bubble flex gap-1.5 p-4 items-center">
                                    <div className="w-1.5 h-1.5 bg-[#49BABA] rounded-full animate-pulse" />
                                    <div className="w-1.5 h-1.5 bg-[#49BABA] rounded-full animate-pulse [animation-delay:0.2s]" />
                                    <div className="w-1.5 h-1.5 bg-[#49BABA] rounded-full animate-pulse [animation-delay:0.4s]" />
                                </div>
                            )}
                        </div>
    
                        {/* Chat Form Area */}
                        <div className="p-4 md:p-6 bg-black/40 sm:bg-black/30 border-t border-white/5 shrink-0 pb-safe-bottom">
                            <form onSubmit={handleAsk} className="relative flex items-center bg-slate-900/80 sm:bg-slate-900/60 rounded-2xl border border-white/10 p-1.5 focus-within:border-[#49BABA] transition-colors gap-1">
                                <input 
                                    ref={inputRef}
                                    className="flex-1 bg-transparent border-none text-white px-3 md:px-4 py-2.5 md:py-3 text-sm outline-none placeholder:text-slate-500 min-w-0"
                                    placeholder="Query the Tutor..."
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                />
                                <button 
                                    type="submit"
                                    disabled={!question.trim() || isAsking}
                                    className={`px-4 md:px-5 h-10 md:h-11 rounded-xl font-black text-xs tracking-wider uppercase transition-all shrink-0 flex items-center justify-center ${
                                        question.trim() ? 'bg-[#49BABA] text-white active:scale-95' : 'bg-white/5 text-slate-500 cursor-not-allowed'
                                    }`}
                                >
                                    {isAsking ? '...' : 'SEND'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIPDFInteraction;