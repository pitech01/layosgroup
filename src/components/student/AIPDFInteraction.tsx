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
    const [chat, setChat] = useState<{role: 'user' | 'ai', content: string}[]>([]);
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
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 4000,
            background: 'rgba(2, 6, 23, 0.95)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            color: 'white',
            fontFamily: "'Inter', sans-serif"
        }}>
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
            `}</style>

            {/* Header */}
            <div style={{ 
                padding: '1rem 2.5rem', 
                borderBottom: '1px solid rgba(255,255,255,0.05)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                background: 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '240px' }}>
                    <div style={{ 
                        width: '42px', 
                        height: '42px', 
                        borderRadius: '12px', 
                        background: 'linear-gradient(135deg, #49BABA, #5bc4c4)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '1.1rem'
                    }}>
                        L
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, background: 'linear-gradient(90deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Layos Virtual Tutor
                        </h2>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>
                            AI ANALYSIS ENGINE
                        </span>
                    </div>
                </div>

                {/* Central Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, justifyContent: 'center' }}>
                    {ai.state === 'idle' ? (
                        <button 
                            onClick={handleStart}
                            style={{ background: 'linear-gradient(135deg, #49BABA 0%, #3fa3a3 100%)', color: 'white', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', fontSize: '0.8rem', letterSpacing: '0.05em', boxShadow: '0 10px 20px -5px rgba(73, 186, 186, 0.3)' }}
                        >
                            INITIALIZE VIRTUAL TUTOR
                        </button>
                    ) : (ai.state === 'speaking' || ai.state === 'paused') ? (
                        <>
                            <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <button 
                                    onClick={ai.state === 'speaking' ? ai.pause : ai.resume}
                                    style={{ background: 'white', color: '#0f172a', border: 'none', padding: '0 1rem', height: '36px', borderRadius: '10px', cursor: 'pointer', fontWeight: 900, fontSize: '0.65rem', letterSpacing: '0.05em' }}
                                >
                                    {ai.state === 'speaking' ? 'PAUSE' : 'RESUME'}
                                </button>
                                <button 
                                    onClick={ai.stop}
                                    style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '0 1rem', height: '36px', borderRadius: '10px', cursor: 'pointer', fontWeight: 900, fontSize: '0.65rem', letterSpacing: '0.05em' }}
                                >
                                    STOP
                                </button>
                            </div>

                            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }} />

                            <div style={{ display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
                                <span style={{ fontSize: '0.55rem', fontWeight: 900, color: '#67d9d9', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    {ai.isSpeaking ? 'NOW TEACHING' : 'PAUSED'}
                                </span>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {ai.explanations[ai.currentExplanationIndex]?.title || 'Analyzing...'}
                                </span>
                            </div>

                            <button 
                                onClick={() => setShowChat(true)}
                                style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#67d9d9', border: '1px solid rgba(73, 186, 186, 0.3)', padding: '0.6rem 1.2rem', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', fontSize: '0.75rem', letterSpacing: '0.05em' }}
                            >
                                ASK LAYOS
                            </button>
                        </>
                    ) : (ai.state === 'ready' || ai.explanations.length > 0) ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button 
                                onClick={ai.startSpeaking}
                                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', fontSize: '0.8rem', letterSpacing: '0.05em', boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.4)' }}
                            >
                                {ai.state === 'summarizing' ? 'START READING (STILL ANALYZING...)' : 'START READING NOW'}
                            </button>
                            <button 
                                onClick={() => setShowChat(true)}
                                style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#67d9d9', border: '1px solid rgba(73, 186, 186, 0.3)', padding: '0.6rem 1.2rem', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', fontSize: '0.75rem', letterSpacing: '0.05em' }}
                            >
                                ASK LAYOS
                            </button>
                            {ai.state === 'summarizing' && (
                                <span style={{ fontSize: '0.7rem', color: '#49BABA', fontWeight: 900, animation: 'pulse 2s infinite' }}>
                                    ANALYZING MORE PAGES...
                                </span>
                            )}
                        </div>
                    ) : null}
                </div>

                <div style={{ minWidth: '240px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                        onClick={onClose}
                        style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', fontSize: '0.75rem', letterSpacing: '0.05em' }}
                    >
                        CLOSE TUTOR
                    </button>
                </div>
            </div>

            {/* Main Layout: Document-First Design */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#020617' }}>
                
                {/* Background Layer: The Smart PDF Document with Auto-Scroll Tracking */}
                <div style={{ width: '100%', height: '100%', zIndex: 1, background: '#020617', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <AutoScrollPDFViewer 
                        url={pdfUrl} 
                        currentPage={ai.explanations[ai.currentExplanationIndex]?.page || 1}
                    />
                </div>

                {/* Layer 2: Thinking/Processing Overlay (Only show if no content yet) */}
                {(ai.state === 'extracting' || (ai.state === 'summarizing' && ai.explanations.length === 0)) && (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                        <div style={{ padding: '3rem', maxWidth: '420px' }}>
                            <div className="css-loader" style={{ margin: '0 auto 2rem' }}></div>
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
                            <h3 style={{ fontSize: '1.75rem', fontWeight: 950, color: 'white', letterSpacing: '0.02em', marginBottom: '1rem' }}>
                                {ai.state === 'extracting' ? 'Parsing Core Concepts...' : 'Synthesizing Knowledge...'}
                            </h3>
                            <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6 }}>
                                Layos Virtual Tutor is orchestrating a personalized learning path based on your material.
                            </p>
                        </div>
                    </div>
                )}



                {/* Layer 4: AI Chat Intelligence (Floating High-Performance Sidebar) */}
                {showChat && (
                    <div style={{ 
                        position: 'absolute', 
                        top: '1.5rem', 
                        bottom: '1.5rem',
                        right: '1.5rem', 
                        width: '440px', 
                        background: 'rgba(15, 23, 42, 0.92)', 
                        backdropFilter: 'blur(30px)',
                        borderRadius: '32px', 
                        border: '1px solid rgba(73, 186, 186, 0.3)', 
                        boxShadow: '0 50px 100px -20px rgba(0,0,0,0.8), 0 0 40px rgba(73, 186, 186, 0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        animation: 'chatSlideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                        overflow: 'hidden',
                        zIndex: 1000
                    }}>
                        <style>{`
                            @keyframes chatSlideInUp { from { opacity: 0; transform: translateX(40px) scale(0.98); } to { opacity: 1; transform: translateX(0) scale(1); } }
                            .ai-bubble { background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(148, 163, 184, 0.1); align-self: flex-start; border-bottom-left-radius: 4px; color: #e2e8f0; }
                            .user-bubble { background: linear-gradient(135deg, #49BABA 0%, #3fa3a3 100%); align-self: flex-end; border-bottom-right-radius: 4px; color: white; box-shadow: 0 10px 20px -5px rgba(73, 186, 186, 0.3); }
                            .chat-scroll::-webkit-scrollbar { width: 6px; }
                            .chat-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                            
                            .ai-bubble p { margin-top: 0; margin-bottom: 0.5rem; line-height: 1.6; }
                            .ai-bubble p:last-child { margin-bottom: 0; }
                            .ai-bubble ul, .ai-bubble ol { margin-top: 0.25rem; margin-bottom: 0.5rem; padding-left: 1.25rem; }
                            .ai-bubble li { margin-bottom: 0.25rem; line-height: 1.5; }
                            .ai-bubble strong { color: #fff; font-weight: 800; }
                        `}</style>

                        <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(139, 92, 246, 0.12)', borderBottom: '1px solid rgba(73, 186, 186, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#49BABA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'white' }}>
                                    L
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 900, color: 'white' }}>LAYOS VIRTUAL TUTOR</h4>
                                    <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 800 }}>• ACTIVE ANALYSIS</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    onClick={() => ai.state === 'paused' ? ai.resume() : ai.pause()}
                                    style={{ background: 'rgba(73, 186, 186, 0.15)', color: '#49BABA', border: '1px solid rgba(73, 186, 186, 0.3)', padding: '0.5rem 1rem', borderRadius: '10px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.05em' }}
                                >
                                    {ai.state === 'paused' ? 'PLAY AUDIO' : 'PAUSE AUDIO'}
                                </button>
                                <button 
                                    onClick={() => setShowChat(false)} 
                                    style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '10px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.05em' }}
                                >
                                    CLOSE
                                </button>
                            </div>
                        </div>
                        
                        <div ref={chatScrollRef} className="chat-scroll" style={{ flex: 1, overflowY: 'auto', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {chat.length === 0 && (
                                <div style={{ textAlign: 'center', color: '#64748b', marginTop: '6rem' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontWeight: 900, fontSize: '2rem', color: '#49BABA' }}>
                                        ?
                                    </div>
                                    <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 900, marginBottom: '0.5rem' }}>Direct Interaction</h3>
                                    <p style={{ fontSize: '0.9rem', lineHeight: 1.5, padding: '0 2rem' }}>Consult the Virtual Tutor about any concept within this document.</p>
                                </div>
                            )}
                            {chat.map((msg, idx) => (
                                <div key={idx} className={`ai-chat-bubble ${msg.role === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
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
                                <div className="ai-bubble ai-chat-bubble" style={{ display: 'flex', gap: '6px', padding: '1rem' }}>
                                    <div style={{ width: '6px', height: '6px', background: '#49BABA', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                                    <div style={{ width: '6px', height: '6px', background: '#49BABA', borderRadius: '50%', animation: 'pulse 1s infinite 0.2s' }} />
                                    <div style={{ width: '6px', height: '6px', background: '#49BABA', borderRadius: '50%', animation: 'pulse 1s infinite 0.4s' }} />
                                </div>
                            )}
                        </div>
    
                        <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <form onSubmit={handleAsk} style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', padding: '6px' }}>
                                <input 
                                    ref={inputRef}
                                    style={{ flex: 1, background: 'none', border: 'none', color: 'white', padding: '0.8rem 1rem', fontSize: '1rem', outline: 'none' }}
                                    placeholder="Query the Tutor..."
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                />
                                <button 
                                    type="submit"
                                    disabled={!question.trim() || isAsking}
                                    style={{ background: question.trim() ? '#49BABA' : 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '0 1.25rem', height: '44px', borderRadius: '14px', cursor: 'pointer', fontWeight: 900, fontSize: '0.75rem', letterSpacing: '0.05em' }}
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
