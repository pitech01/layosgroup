import { useState, useRef } from 'react';
import { Send, Paperclip, Loader2, Mic, Square, Trash2 } from 'lucide-react';

interface ChatInputProps {
    onSendMessage: (content: string, attachment?: File) => void;
    placeholder?: string;
    isSending?: boolean;
}

const ChatInput = ({ onSendMessage, placeholder = "Type a message...", isSending = false }: ChatInputProps) => {
    const [message, setMessage] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerIntervalRef = useRef<number | null>(null);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if ((message.trim() || file) && !isSending) {
            let finalContent = message.trim();
            if (!finalContent && file) {
                finalContent = file.type.startsWith('audio') ? '🎤 Voice note' : '📎 Attachment';
            }
            onSendMessage(finalContent, file || undefined);
            setMessage('');
            setFile(null);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const mimeType = mediaRecorder.mimeType || 'audio/webm';
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                const ext = mimeType.includes('mp4') ? 'm4a' : mimeType.includes('ogg') ? 'ogg' : 'webm';

                // Use File constructor if supported, else fallback to creating a Blob with a name prop for FormData
                let audioFile: File;
                try {
                    audioFile = new File([audioBlob], `voicenote_${Date.now()}.${ext}`, { type: mimeType });
                } catch (e) {
                    audioFile = audioBlob as any;
                    (audioFile as any).name = `voicenote_${Date.now()}.${ext}`;
                }

                setFile(audioFile);

                // Stop all tracks to release mic
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerIntervalRef.current = window.setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (error: any) {
            console.error("Error accessing mic: ", error);
            if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
                alert("Microphone access blocked. Please allow permissions in your browser settings.");
            } else {
                alert("Could not access microphone. Ensure you are on a secure connection (HTTPS) or localhost.");
            }
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        }
    };

    const cancelRecording = () => {
        stopRecording();
        setFile(null);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <form onSubmit={handleSubmit} className="chat-input-form" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'white',
            padding: '0.75rem 1.25rem',
            borderTop: '1px solid #e2e8f0',
            position: 'sticky',
            bottom: 0,
            zIndex: 10
        }}>
            <style>{`
                @media (max-width: 640px) {
                    .chat-input-form {
                        padding: 0.5rem 0.75rem !important;
                        gap: 0.4rem !important;
                    }
                    .ci-btn-icon {
                        padding: 0.4rem !important;
                    }
                    .ci-btn-icon svg {
                        width: 18px !important;
                        height: 18px !important;
                    }
                    .ci-input-main {
                        padding: 0.6rem 0.85rem !important;
                        font-size: 0.85rem !important;
                    }
                    .audio-status-box {
                        padding: 0.5rem 0.75rem !important;
                        font-size: 0.85rem !important;
                    }
                }
            `}</style>
            <button
                type="button"
                className="ci-btn-icon"
                style={{
                    background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '50%'
                }}
                onMouseEnter={(e: any) => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={(e: any) => e.currentTarget.style.background = 'transparent'}
                onClick={() => document.getElementById('chat-file-upload')?.click()}
            >
                <Paperclip size={20} />
                <input
                    type="file"
                    id="chat-file-upload"
                    style={{ display: 'none' }}
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                />
            </button>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                {isRecording ? (
                    <div className="audio-status-box" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#fee2e2', borderRadius: '24px', color: '#ef4444' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />
                            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Rec... {formatTime(recordingTime)}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="button" onClick={cancelRecording} className="ci-btn-icon" style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}>
                                <Trash2 size={18} />
                            </button>
                            <button type="button" onClick={stopRecording} style={{ background: '#ef4444', border: 'none', color: 'white', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
                                <Square size={12} fill="white" /> Stop
                            </button>
                        </div>
                    </div>
                ) : file && file.type.startsWith('audio') ? (
                    <div className="audio-status-box" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#f0fdf4', borderRadius: '24px', color: '#16a34a' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>🎤 Voice note</span>
                        <button type="button" onClick={() => setFile(null)} className="ci-btn-icon" style={{ background: 'transparent', border: 'none', color: '#16a34a', cursor: 'pointer', padding: '0.25rem' }}>
                            <Trash2 size={18} />
                        </button>
                    </div>
                ) : (
                    <input
                        type="text"
                        placeholder={file ? `Attached: ${file.name.substring(0, 10)}...` : placeholder}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="ci-input-main"
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            borderRadius: '24px',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.95rem',
                            outline: 'none',
                            background: '#f8fafc'
                        }}
                        disabled={isSending}
                    />
                )}
            </div>

            {!isRecording && (
                <button
                    type="button"
                    onClick={startRecording}
                    disabled={isSending}
                    className="ci-btn-icon"
                    style={{
                        background: 'transparent',
                        color: '#64748b',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '50%'
                    }}
                    onMouseEnter={(e: any) => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseLeave={(e: any) => e.currentTarget.style.background = 'transparent'}
                >
                    <Mic size={20} />
                </button>
            )}

            <button
                type="submit"
                disabled={(!message.trim() && !file) || isSending || isRecording}
                className="ci-btn-icon"
                style={{
                    background: 'transparent',
                    color: (!message.trim() && !file) || isSending || isRecording ? '#cbd5e1' : '#3b82f6',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: (!message.trim() && !file) || isSending || isRecording ? 'not-allowed' : 'pointer',
                    padding: '0.5rem',
                    transition: 'color 0.2s, transform 0.1s'
                }}
                onMouseDown={(e: any) => { if (!((!message.trim() && !file) || isSending || isRecording)) e.currentTarget.style.transform = 'scale(0.95)'; }}
                onMouseUp={(e: any) => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={(e: any) => e.currentTarget.style.transform = 'scale(1)'}
            >
                {isSending ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
            </button>
        </form>
    );
};

export default ChatInput;
