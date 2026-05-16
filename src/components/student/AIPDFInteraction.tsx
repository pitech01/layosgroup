import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAIPutter } from '../../utils/useAIPutter';
import AutoScrollPDFViewer from './AutoScrollPDFViewer';

interface AIPDFInteractionProps {
    pdfUrl: string;
    onClose: () => void;
}

const AIPDFInteraction: React.FC<AIPDFInteractionProps> = ({ pdfUrl, onClose }) => {
    const ai = useAIPutter();
    const [question, setQuestion] = useState('');
    const [chat, setChat] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
    const [isAsking, setIsAsking] = useState(false);
    const [showChat, setShowChat] = useState(false);

    // Auto-scroll & Auto-focus refs
    const chatScrollRef = React.useRef<HTMLDivElement>(null);
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
        setChat((prev) => [...prev, { role: 'user', content: userQ }]);
        setQuestion('');
        setIsAsking(true);
        setShowChat(true);

        const answer = await ai.askQuestion(userQ);
        setChat((prev) => [...prev, { role: 'ai', content: answer }]);
        setIsAsking(false);

        // Speak the answer automatically
        ai.speakText(answer);
    };

    return (
        <div className="fixed inset-0 z-[4000] flex flex-col bg-slate-950/95 text-white backdrop-blur-[20px] font-sans antialiased selection:bg-[#49BABA]/30">
            
            {/* Header */}
            <div className="px-4 py-3 md:px-10 md:py-4 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 bg-slate-900/40 backdrop-blur-md">
                
                {/* Brand */}
                <div className="flex items-center gap-3 min-w-full md:min-w-[240px] justify-between md:justify-start">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 md:w-[42px] md:h-[42px] rounded-xl bg-gradient-to-br from-[#49BABA] to-[#5bc4c4] flex items-center justify-center font-black text-sm md:text-2xl shadow-lg shadow-[#49BABA]/20">
                            L
                        </div>
                        <div>
                            <h2 className="m-0 text-sm md:text-lg font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                Layos Virtual Tutor
                            </h2>
                            <span className="block text-[10px] md:text-[11px] text-slate-400 font-bold tracking-wider uppercase">
                                AI ANALYSIS ENGINE
                            </span>
                        </div>
                    </div>
                    {/* Small Close Button on Mobile Header if chat screen takes up screen */}
                    <button 
                        onClick={onClose}
                        className="md:hidden bg-red-500 text-white px-3 py-1.5 rounded-lg font-black text-xs tracking-wider uppercase hover:bg-red-600 transition-colors"
                    >
                        Close
                    </button>
                </div>

                {/* Central Controls */}
                <div className="flex items-center gap-2 md:gap-4 w-full md:flex-1 justify-center">
                    {ai.state === 'idle' ? (
                        <button
                            onClick={handleStart}
                            className="bg-gradient-to-br from-[#49BABA] to-[#3fa3a3] text-white px-4 py-2.5 md:px-6 md:py-2.5 rounded-xl font-black text-xs tracking-wider shadow-lg shadow-[#49BABA]/30 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase w-full md:w-auto text-center"
                        >
                            INITIALIZE VIRTUAL TUTOR
                        </button>
                    ) : ai.state === 'speaking' || ai.state === 'paused' ? (
                        <div className="flex items-center justify-between md:justify-center gap-3 w-full md:w-auto">
                            <div className="flex gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5">
                                <button
                                    onClick={ai.state === 'speaking' ? ai.pause : ai.resume}
                                    className="bg-white text-slate-900 px-3 md:px-4 h-9 rounded-lg font-black text-[10px] md:text-xs tracking-wider hover:bg-slate-100 transition-colors uppercase"
                                >
                                    {ai.state === 'speaking' ? 'PAUSE' : 'RESUME'}
                                </button>
                                <button
                                    onClick={ai.stop}
                                    className="bg-white/10 text-white px-3 md:px-4 h-9 rounded-lg font-black text-[10px] md:text-xs tracking-wider hover:bg-white/20 transition-colors uppercase"
                                >
                                    STOP
                                </button>
                            </div>

                            <div className="hidden md:block w-px h-6 bg-white/10 mx-2" />

                            <div className="flex flex-col min-w-0 max-w-[120px] md:max-w-[180px] md:min-w-[150px]">
                                <span className="text-[9px] md:text-[10px] font-black text-[#67d9d9] uppercase tracking-widest truncate">
                                    {ai.isSpeaking ? 'NOW TEACHING' : 'PAUSED'}
                                </span>
                                <span className="text-xs font-bold text-slate-200 truncate">
                                    {ai.explanations[ai.currentExplanationIndex]?.title || 'Analyzing...'}
                                </span>
                            </div>

                            <button
                                onClick={() => setShowChat(true)}
                                className="bg-[#1399af]/15 text-[#67d9d9] border border-[#49BABA]/30 px-3 py-2 md:px-5 md:py-2 rounded-xl font-black text-[10px] md:text-xs tracking-wider hover:bg-[#49BABA]/20 transition-all uppercase"
                            >
                                ASK LAYOS
                            </button>
                        </div>
                    ) : ai.state === 'ready' || ai.explanations.length > 0 ? (
                        <div className="flex flex-wrap gap-2 items-center justify-center">
                            <button
                                onClick={ai.startSpeaking}
                                className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-4 py-2 md:px-6 md:py-2.5 rounded-xl font-black text-xs tracking-wider shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase"
                            >
                                {ai.state === 'summarizing' ? 'START (ANALYZING...)' : 'START READING NOW'}
                            </button>
                            <button
                                onClick={() => setShowChat(true)}
                                className="bg-[#1399af]/15 text-[#67d9d9] border border-[#49BABA]/30 px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-black text-xs tracking-wider hover:bg-[#49BABA]/20 transition-all uppercase"
                            >
                                ASK LAYOS
                            </button>
                            {ai.state === 'summarizing' && (
                                <span className="text-[10px] text-[#49BABA] font-black animate-pulse w-full text-center md:w-auto md:text-left">
                                    ANALYZING MORE PAGES...
                                </span>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Main Desktop Close Button Container */}
                <div className="hidden md:flex min-w-[240px] justify-end">
                    <button
                        onClick={onClose}
                        className="bg-red-500 text-white px-5 py-2.5 rounded-xl font-black text-xs tracking-wider hover:bg-red-600 active:scale-95 transition-all uppercase"
                    >
                        CLOSE TUTOR
                    </button>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex-1 relative overflow-hidden bg-slate-950">
                
                {/* Background Layer: PDF Viewer */}
                <div className="absolute inset-0 z-10 bg-slate-950">
                    <AutoScrollPDFViewer
                        url={pdfUrl}
                        currentPage={ai.explanations[ai.currentExplanationIndex]?.page || 1}
                    />
                </div>

                {/* Processing Overlay */}
                {(ai.state === 'extracting' || (ai.state === 'summarizing' && ai.explanations.length === 0)) && (
                    <div className="absolute inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center text-center p-6">
                        <div className="max-w-md">
                            <div className="w-12 h-12 border-4 border-[#49BABA]/20 border-top-[#49BABA] rounded-full animate-spin mx-auto mb-6" style={{ borderTopColor: '#49BABA' }} />
                            <h3 className="text-xl md:text-2xl font-black text-white mb-2 tracking-wide">
                                {ai.state === 'extracting' ? 'Parsing Core Concepts...' : 'Synthesizing Knowledge...'}
                            </h3>
                            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                                Layos Virtual Tutor is orchestrating a personalized learning path based on your material.
                            </p>
                        </div>
                    </div>
                )}

                {/* AI Chat Drawer Layer */}
                {showChat && (
                    <div className="absolute inset-0 w-full h-full md:inset-auto md:top-6 md:bottom-6 md:right-6 md:w-[440px] md:h-[calc(100%-3rem)] bg-slate-900/95 md:bg-slate-900/92 backdrop-blur-2xl md:rounded-[32px] md:border md:border-[#49BABA]/30 md:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8),0_0_40px_rgba(73, 186, 186, 0.1)] flex flex-col overflow-hidden z-[1000] animate-[slideInUp_0.4s_cubic-bezier(0.16,1,0.3,1)] md:animate-[chatSlideInUp_0.5s_cubic-bezier(0.16,1,0.3,1)]">
                        
                        {/* Custom Keyframe Animations (handled gracefully inside the template markup inline configuration fallback) */}
                        <style>{`
                            @keyframes chatSlideInUp { from { opacity: 0; transform: translateX(40px) scale(0.98); } to { opacity: 1; transform: translateX(0) scale(1); } }
                            @keyframes slideInUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                        `}</style>

                        {/* Sidebar Header */}
                        <div className="p-4 md:p-5 bg-[#8b5cf6]/10 border-b border-[#49BABA]/20 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#49BABA] flex items-center justify-center font-black text-white text-base">
                                    L
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs md:text-sm font-black text-white truncate uppercase tracking-wider">LAYOS VIRTUAL TUTOR</h4>
                                    <span className="text-[9px] md:text-[10px] text-emerald-400 font-extrabold tracking-wider block">• ACTIVE ANALYSIS</span>
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button
                                    onClick={() => (ai.state === 'paused' ? ai.resume() : ai.pause())}
                                    className="bg-[#49BABA]/15 text-[#49BABA] border border-[#49BABA]/30 px-3 py-1.5 rounded-xl text-[10px] md:text-xs font-black tracking-wide uppercase hover:bg-[#49BABA]/25 transition-all"
                                >
                                    {ai.state === 'paused' ? 'PLAY' : 'PAUSE'} <span className="hidden sm:inline">AUDIO</span>
                                </button>
                                <button
                                    onClick={() => setShowChat(false)}
                                    className="bg-white/10 text-white px-3 py-1.5 rounded-xl text-[10px] md:text-xs font-black tracking-wide uppercase hover:bg-white/20 transition-all"
                                >
                                    CLOSE
                                </button>
                            </div>
                        </div>

                        {/* Messages Body */}
                        <div 
                            ref={chatScrollRef} 
                            className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                        >
                            {chat.length === 0 && (
                                <div className="text-center text-slate-500 my-auto p-4">
                                    <div className="w-16 h-16 rounded-full bg-[#8b5cf6]/5 flex items-center justify-center mx-auto mb-4 font-black text-2xl text-[#49BABA]">
                                        ?
                                    </div>
                                    <h3 className="text-white text-base md:text-lg font-black mb-1">Direct Interaction</h3>
                                    <p className="text-xs md:text-sm leading-relaxed max-w-xs mx-auto">
                                        Consult the Virtual Tutor about any concept within this document.
                                    </p>
                                </div>
                            )}

                            {chat.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`p-3 md:p-4 rounded-[18px] max-w-[85%] text-xs md:text-sm leading-relaxed ${
                                        msg.role === 'user'
                                            ? 'bg-gradient-to-br from-[#49BABA] to-[#3fa3a3] text-white self-end rounded-br-4px shadow-lg shadow-[#49BABA]/20'
                                            : 'bg-slate-800/60 border border-slate-700/30 text-slate-200 self-flex-start rounded-bl-4px prose prose-invert prose-p:my-1 prose-strong:text-white prose-strong:font-extrabold prose-ul:list-disc prose-ol:list-decimal prose-li:my-0.5'
                                    }`}
                                >
                                    {msg.role === 'ai' ? (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.content}
                                        </ReactMarkdown>
                                    ) : (
                                        msg.content
                                    )}
                                </div>
                            ))}

                            {isAsking && (
                                <div className="bg-slate-800/60 border border-slate-700/30 self-flex-start rounded-bl-4px p-4 rounded-[18px] flex gap-1.5 items-center max-w-[85%]">
                                    <div className="w-1.5 h-1.5 bg-[#49BABA] rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 bg-[#49BABA] rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 bg-[#49BABA] rounded-full animate-bounce" />
                                </div>
                            )}
                        </div>

                        {/* Input Container */}
                        <div className="p-4 bg-black/30 border-t border-white/5 shrink-0 pb-safe">
                            <form
                                onSubmit={handleAsk}
                                className="flex items-center bg-slate-900/60 rounded-2xl border border-white/10 p-1.5 focus-within:border-[#49BABA] transition-colors"
                            >
                                <input
                                    ref={inputRef}
                                    className="flex-1 bg-transparent border-none text-white px-3 py-2 text-sm md:text-base outline-none placeholder-slate-500"
                                    placeholder="Query the Tutor..."
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={!question.trim() || isAsking}
                                    className={`px-4 h-10 rounded-xl font-black text-xs tracking-wider transition-all uppercase shrink-0 ${
                                        question.trim() && !isAsking
                                            ? 'bg-[#49BABA] text-white hover:bg-[#3fa3a3]'
                                            : 'bg-white/5 text-slate-500 cursor-not-allowed'
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