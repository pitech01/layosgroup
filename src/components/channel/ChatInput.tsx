import { useState, useRef } from 'react';
import { Send, Paperclip, Loader2, Mic, Trash2 } from 'lucide-react';

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
        <form onSubmit={handleSubmit} className="luxury-chat-input-container">
            <style>{`
                .luxury-chat-input-container {
                    background: #ffffff;
                    padding: 1rem 1.5rem;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: all 0.2s;
                }
                
                .chat-input-field-wrapper {
                    flex: 1;
                    background: #f8fafc;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    padding: 0 12px;
                    transition: all 0.2s;
                }
                
                .chat-input-field-wrapper:focus-within {
                    background: white;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
                }
                
                .chat-text-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    outline: none;
                    padding: 12px 8px;
                    font-size: 0.95rem;
                    color: #0f172a;
                    font-family: 'Inter', sans-serif;
                }
                
                .chat-action-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                    background: transparent;
                    color: #64748b;
                }
                
                .chat-action-btn:hover {
                    background: #f1f5f9;
                    color: #0f172a;
                    transform: translateY(-1px);
                }
                
                .chat-send-btn {
                    background: #0f172a;
                    color: white;
                    width: 44px;
                    height: 44px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
                }
                
                .chat-send-btn:hover:not(:disabled) {
                    background: #334155;
                    transform: scale(1.05);
                    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.25);
                }
                
                .chat-send-btn:disabled {
                    background: #f1f5f9;
                    color: #cbd5e1;
                    box-shadow: none;
                    cursor: not-allowed;
                }

                .audio-recording-overlay {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: #fef2f2;
                    border: 1.5px solid #fee2e2;
                    border-radius: 16px;
                    padding: 0 12px;
                    height: 48px;
                    color: #ef4444;
                }

                @keyframes pulse-red {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                }

                .recording-dot {
                    width: 10px;
                    height: 10px;
                    background: #ef4444;
                    border-radius: 50%;
                    animation: pulse-red 1s infinite ease-in-out;
                }
            `}</style>

            <button
                type="button"
                className="chat-action-btn"
                onClick={() => document.getElementById('chat-file-upload')?.click()}
                title="Attach file"
            >
                <Paperclip size={20} />
                <input
                    type="file"
                    id="chat-file-upload"
                    style={{ display: 'none' }}
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                />
            </button>

            <div className="chat-input-field-wrapper">
                {isRecording ? (
                    <div className="audio-recording-overlay">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="recording-dot" />
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>RECORDING {formatTime(recordingTime)}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="button" onClick={cancelRecording} className="chat-action-btn" style={{ color: '#ef4444' }}>
                                <Trash2 size={18} />
                            </button>
                            <button type="button" onClick={stopRecording} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '4px 12px', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}>
                                STOP
                            </button>
                        </div>
                    </div>
                ) : file && file.type.startsWith('audio') ? (
                    <div className="audio-recording-overlay" style={{ background: '#f0fdf4', borderColor: '#dcfce7', color: '#16a34a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Mic size={18} />
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Voice Note Ready</span>
                        </div>
                        <button type="button" onClick={() => setFile(null)} className="chat-action-btn" style={{ color: '#16a34a' }}>
                            <Trash2 size={18} />
                        </button>
                    </div>
                ) : (
                    <input
                        type="text"
                        placeholder={file ? `Attached: ${file.name.substring(0, 15)}...` : placeholder}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="chat-text-input"
                        disabled={isSending}
                    />
                )}
            </div>

            {!isRecording && !file && (
                <button
                    type="button"
                    onClick={startRecording}
                    disabled={isSending}
                    className="chat-action-btn"
                    title="Record voice note"
                >
                    <Mic size={20} />
                </button>
            )}

            <button
                type="submit"
                disabled={(!message.trim() && !file) || isSending || isRecording}
                className="chat-send-btn"
            >
                {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
        </form>
    );
};

export default ChatInput;
